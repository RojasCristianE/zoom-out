#!/usr/bin/env bash
# ──────────────────────────────────────────────
# setup-lan.sh — Prepara Zoom-Out para la red local
# ──────────────────────────────────────────────
# 1. Detecta y valida la IP del host en la red local
# 2. Renderiza infra/livekit/{livekit,egress}.yaml desde las plantillas
# 3. Genera certificados TLS (mkcert) para entrar desde otros dispositivos
# 4. Reinicia livekit, livekit-egress y caddy para aplicar los cambios
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"
ENV_FALLBACK="$ROOT_DIR/.env.example"
CERTS_DIR="$ROOT_DIR/infra/certs"
LIVEKIT_DIR="$ROOT_DIR/infra/livekit"
COMPOSE_FILE="$ROOT_DIR/infra/docker-compose.yml"

RENDER_ONLY=0
WITH_CERTS=1
WITH_RESTART=1

for arg in "$@"; do
  case "$arg" in
    --render-only) RENDER_ONLY=1; WITH_RESTART=0 ;;
    --no-certs)    WITH_CERTS=0 ;;
    --no-restart)  WITH_RESTART=0 ;;
    -h|--help)
      cat <<'AYUDA'
Uso: bash scripts/setup-lan.sh [opciones]

Opciones:
  --render-only   Solo renderiza las plantillas de LiveKit (lo usa `bun run infra:up`)
  --no-certs      No regenera los certificados TLS
  --no-restart    No reinicia los contenedores
  -h, --help      Muestra esta ayuda

Variables:
  HOST_IP=x.x.x.x   Fuerza la IP del host (si no, se autodetecta)

Ejemplos:
  bun run setup:lan
  HOST_IP=192.168.0.50 bash scripts/setup-lan.sh
AYUDA
      exit 0
      ;;
    *) echo "⚠️  Argumento desconocido: $arg (ignorado)" >&2 ;;
  esac
done

log()  { echo -e "\033[0;36m▸\033[0m $*"; }
ok()   { echo -e "\033[0;32m✅\033[0m $*"; }
warn() { echo -e "\033[1;33m⚠️\033[0m $*"; }
err()  { echo -e "\033[0;31m❌\033[0m $*" >&2; }
titulo() { echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  $*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"; }

# ── Carga de .env (sin `source`: tolera comentarios, [secciones] y CRLF) ──
load_env() {
  local archivo="$1" linea clave valor
  while IFS= read -r linea || [ -n "$linea" ]; do
    # Quita comentarios en línea y espacios sobrantes
    linea="$(printf '%s' "$linea" | sed -e 's/[[:space:]]#.*$//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    case "$linea" in ''|'#'*) continue ;; esac
    case "$linea" in *=*) ;; *) continue ;; esac

    clave="${linea%%=*}"
    valor="${linea#*=}"

    # Solo claves válidas y sin sobreescribir lo que ya vino por CLI
    [[ "$clave" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    if [ -n "${!clave:-}" ]; then continue; fi

    export "$clave=$valor"
  done < "$archivo"
}

# ── Detección de IP (interfaz con ruta por defecto, no la primera que aparezca) ──
detect_ip() {
  local ip=""
  if command -v ip >/dev/null 2>&1; then
    ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for (i=1;i<=NF;i++) if ($i=="src") {print $(i+1); exit}}')" || true
  fi
  if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}')" || true
  fi
  printf '%s' "$ip"
}

is_private_ip() {
  case "$1" in
    10.*|192.168.*|127.*) return 0 ;;
    172.1[6-9].*|172.2[0-9].*|172.3[0-1].*) return 0 ;;
    *) return 1 ;;
  esac
}

# ── 1. Entorno ──
if [ -f "$ENV_FILE" ]; then
  ENV_SRC="$ENV_FILE"
else
  ENV_SRC="$ENV_FALLBACK"
  warn "No existe .env — usando .env.example (corré 'bun run setup' para crear el real)"
fi
log "Cargando entorno: ${ENV_SRC#"$ROOT_DIR"/}"
load_env "$ENV_SRC"

# Defaults para .env creados antes de estas claves
: "${MINIO_INTERNAL_ENDPOINT:=minio}"
: "${MINIO_BUCKET_RECORDINGS:=recordings}"
: "${MINIO_PORT:=9000}"
: "${API_PORT:=3000}"

# ── 2. IP del host ──
if [ -z "${HOST_IP:-}" ]; then
  HOST_IP="$(detect_ip)"
fi

if [ -z "$HOST_IP" ]; then
  err "No se pudo detectar la IP del host. Forzala: HOST_IP=192.168.x.x bash scripts/setup-lan.sh"
  exit 1
fi

if ! is_private_ip "$HOST_IP"; then
  warn "HOST_IP=$HOST_IP no parece una IP privada (10.x / 172.16-31.x / 192.168.x)"
fi

case "$HOST_IP" in
  172.1[7-9].*|172.2[0-9].*|172.3[0-1].*)
    warn "HOST_IP=$HOST_IP está en el rango de Docker: los dispositivos de la LAN no van a poder alcanzarla"
    ;;
esac

# Persiste HOST_IP en .env para no re-detectar en cada corrida
if [ "$ENV_SRC" = "$ENV_FILE" ] && grep -q '^HOST_IP=' "$ENV_FILE"; then
  IP_ENV="$(grep -m1 '^HOST_IP=' "$ENV_FILE" | cut -d= -f2- | tr -d '[:space:]')"
  if [ -z "$IP_ENV" ]; then
    sed -i "s|^HOST_IP=.*|HOST_IP=$HOST_IP|" "$ENV_FILE"
    ok "HOST_IP=$HOST_IP guardada en .env"
  elif [ "$IP_ENV" != "$HOST_IP" ]; then
    warn "El .env tiene HOST_IP=$IP_ENV distinta a la detectada ($HOST_IP)"
  fi
fi

# ── 3. Render de plantillas ──
VARS_RENDER=(
  HOST_IP LIVEKIT_API_KEY LIVEKIT_API_SECRET
  MINIO_ACCESS_KEY MINIO_SECRET_KEY MINIO_INTERNAL_ENDPOINT MINIO_PORT MINIO_BUCKET_AUDIENCIAS
  API_PORT
)

for v in HOST_IP LIVEKIT_API_KEY LIVEKIT_API_SECRET MINIO_ACCESS_KEY MINIO_SECRET_KEY; do
  if [ -z "${!v:-}" ]; then
    err "Falta $v en ${ENV_SRC#"$ROOT_DIR"/}"
    exit 1
  fi
done

for v in "${VARS_RENDER[@]}"; do export "$v"; done

render() {
  local tpl="$1" out="$2" v val
  if [ ! -f "$tpl" ]; then
    err "Falta la plantilla: ${tpl#"$ROOT_DIR"/}"
    exit 1
  fi

  if command -v envsubst >/dev/null 2>&1; then
    envsubst < "$tpl" > "$out"
  else
    # Fallback sin gettext: escape de caracteres especiales de sed
    cp "$tpl" "$out"
    for v in "${VARS_RENDER[@]}"; do
      val="${!v}"
      val="${val//\\/\\\\}"
      val="${val//&/\\&}"
      val="${val//|/\\|}"
      sed -i "s|\${$v}|$val|g" "$out"
    done
  fi

  if grep -q '\${' "$out"; then
    err "Quedaron placeholders sin resolver en ${out#"$ROOT_DIR"/}"
    exit 1
  fi

  ok "Renderizado: ${out#"$ROOT_DIR"/}"
}

log "Renderizando configuración de LiveKit (node_ip=$HOST_IP)"
render "$LIVEKIT_DIR/livekit.yaml.template" "$LIVEKIT_DIR/livekit.yaml"
render "$LIVEKIT_DIR/egress.yaml.template"  "$LIVEKIT_DIR/egress.yaml"

if [ "$RENDER_ONLY" -eq 1 ]; then
  exit 0
fi

# ── 4. Certificados TLS ──
if [ "$WITH_CERTS" -eq 1 ]; then
  if ! command -v mkcert >/dev/null 2>&1; then
    warn "mkcert no está instalado — se omite HTTPS (solo funciona localhost)"
    echo "    Arch/Manjaro : sudo pacman -S mkcert"
    echo "    Ubuntu/Debian: sudo apt install mkcert"
  else
    log "Generando certificados para: $HOST_IP localhost 127.0.0.1"
    mkcert -install
    mkdir -p "$CERTS_DIR"
    mkcert \
      -cert-file "$CERTS_DIR/local.pem" \
      -key-file  "$CERTS_DIR/local-key.pem" \
      "$HOST_IP" localhost 127.0.0.1
    cp "$(mkcert -CAROOT)/rootCA.pem" "$CERTS_DIR/rootCA.pem"
    ok "Certificados en infra/certs/ (válidos por 2 años)"
  fi
fi

# ── 5. Reinicio de contenedores afectados ──
if [ "$WITH_RESTART" -eq 1 ] && command -v docker >/dev/null 2>&1; then
  COMPOSE_ARGS=(-f "$COMPOSE_FILE")
  if [ -f "$ENV_FILE" ]; then COMPOSE_ARGS+=(--env-file "$ENV_FILE"); fi

  REINICIADOS=0
  for svc in livekit livekit-egress caddy; do
    if [ -n "$(docker compose "${COMPOSE_ARGS[@]}" ps -q "$svc" 2>/dev/null || true)" ]; then
      docker compose "${COMPOSE_ARGS[@]}" up -d "$svc" >/dev/null
      REINICIADOS=1
    fi
  done

  if [ "$REINICIADOS" -eq 1 ]; then
    ok "Contenedores actualizados: livekit, livekit-egress, caddy"
  else
    warn "No hay contenedores corriendo — levantá la infra con 'bun run infra:up'"
  fi
fi

# ── 6. Resumen ──
titulo "📱 ACCESO DESDE LA RED LOCAL"
echo "  Web (HTTPS)      : https://$HOST_IP"
echo "  LiveKit (WSS)    : wss://$HOST_IP:7443"
echo "  LiveKit (host)   : ws://$HOST_IP:7880"
echo "  MinIO Console    : http://$HOST_IP:9001"
echo "  Web (local)      : http://localhost:5173"
echo ""
echo "  Media (ICE)      : UDP 50000-50060 → host"
echo "  Requiere abrir en el firewall: 443, 7443 (TCP) y 50000-50060 (UDP)"
echo ""
echo "  1er uso en Android: instalar infra/certs/rootCA.pem como CA"
echo "    adb push infra/certs/rootCA.pem /sdcard/rootCA.pem"
warn "Si cambia la IP del host, volvé a correr: bun run setup:lan"
echo ""
