#!/usr/bin/env bash
# ──────────────────────────────────────────────
# setup-certs.sh — Genera certificados TLS locales con mkcert
# Usar una vez para habilitar HTTPS en la red local (acceso desde teléfono)
# ──────────────────────────────────────────────
set -euo pipefail

CERTS_DIR="$(dirname "$0")/../infra/certs"
HOST_IP="${HOST_IP:-$(hostname -I | awk '{print $1}')}"

log()  { echo -e "\033[0;36m▸\033[0m $*"; }
ok()   { echo -e "\033[0;32m✅\033[0m $*"; }
err()  { echo -e "\033[0;31m❌\033[0m $*" >&2; }
warn() { echo -e "\033[1;33m⚠️\033[0m $*"; }

# ── 1. Verificar mkcert ──
if ! command -v mkcert &>/dev/null; then
  err "mkcert no está instalado."
  echo ""
  echo "  Instalar con:"
  echo "    Arch/Manjaro : sudo pacman -S mkcert"
  echo "    Ubuntu/Debian: sudo apt install mkcert"
  echo "    Fedora       : sudo dnf install mkcert"
  echo "    Manual       : https://github.com/FiloSottile/mkcert/releases"
  exit 1
fi

ok "mkcert $(mkcert --version) encontrado"

# ── 2. Instalar root CA en el sistema ──
log "Instalando root CA en el sistema (requiere contraseña)..."
mkcert -install
ok "Root CA instalada"

# ── 3. Crear directorio de certs ──
mkdir -p "$CERTS_DIR"

# ── 4. Generar certificados para IP local + localhost ──
log "Generando certificados para: $HOST_IP localhost 127.0.0.1"
mkcert \
  -cert-file "$CERTS_DIR/local.pem" \
  -key-file  "$CERTS_DIR/local-key.pem" \
  "$HOST_IP" localhost 127.0.0.1

ok "Certificados generados:"
echo "    cert : infra/certs/local.pem"
echo "    key  : infra/certs/local-key.pem"

# ── 5. Copiar root CA para instalación en Android ──
CAROOT=$(mkcert -CAROOT)
cp "$CAROOT/rootCA.pem" "$CERTS_DIR/rootCA.pem"
ok "Root CA copiada → infra/certs/rootCA.pem"

# ── 6. Generar QR para acceso fácil desde teléfono ──
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📱 PRÓXIMOS PASOS — INSTALAR CA EN ANDROID"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  1. Transferir rootCA.pem al teléfono:"
echo "     a) Via ADB:"
echo "        adb push infra/certs/rootCA.pem /sdcard/rootCA.pem"
echo "     b) Via servidor HTTP temporal:"
echo "        python3 -m http.server 8888 --directory infra/certs &"
echo "        # Abrir http://$HOST_IP:8888/rootCA.pem desde Chrome Android"
echo ""
echo "  2. Instalar en Android:"
echo "     Ajustes → Seguridad → Credenciales → Instalar certificado"
echo "     → CA certificate → rootCA.pem"
echo "     (Puede variar según fabricante/versión Android)"
echo ""
echo "  3. Acceder desde el teléfono:"
echo "     https://$HOST_IP"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
warn "IP detectada: $HOST_IP. Si cambia, regenerar con: bash scripts/setup-certs.sh"
echo ""
