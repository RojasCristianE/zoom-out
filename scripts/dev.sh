#!/bin/bash
set -euo pipefail

# === Configuración ===
V4L2_DEVICE="/dev/video10"
V4L2_LABEL="Android Camera"
SCRCPY_CAMERA_ID=0
SCRCPY_CAMERA_SIZE="1280x720"
PULSE_SINK_NAME="Mic_Virtual"
PULSE_SOURCE_NAME="Mic_Android_Final"
PULSE_SINK_DESC="Cable_Virtual_Android"
PULSE_SOURCE_DESC="Microfono_Samsung_A36"

# === Estado para cleanup ===
MODULE_NULL_ID=""
MODULE_REMAP_ID=""
USE_CAMERA=1
SCRCPY_PID=""

# === Colores ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}▸${NC} $*"; }
ok()   { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC} $*"; }
err()  { echo -e "${RED}❌${NC} $*" >&2; }

# === Parse args ===
for arg in "$@"; do
  case "$arg" in
    --no-camera) USE_CAMERA=0 ;;
  esac
done

# === Cleanup ===
cleanup() {
  echo ""
  log "Deteniendo servicios..."

  if [ "$USE_CAMERA" -eq 1 ]; then
    # Matar scrcpy
    if [ -n "$SCRCPY_PID" ] && kill -0 "$SCRCPY_PID" 2>/dev/null; then
      kill "$SCRCPY_PID" 2>/dev/null
      wait "$SCRCPY_PID" 2>/dev/null || true
      log "scrcpy detenido."
    fi

    # Descargar módulos PulseAudio
    if [ -n "$MODULE_REMAP_ID" ]; then
      pactl unload-module "$MODULE_REMAP_ID" 2>/dev/null || true
    fi
    if [ -n "$MODULE_NULL_ID" ]; then
      pactl unload-module "$MODULE_NULL_ID" 2>/dev/null || true
    fi

  fi

  # Terminar procesos background
  kill $(jobs -p) 2>/dev/null || true
  wait 2>/dev/null || true
  ok "Limpieza completa."
}
trap cleanup EXIT

# === Flujo de cámara ===
if [ "$USE_CAMERA" -eq 1 ]; then
  log "Preparando cámara Android..."

  # --- 1. Verificar v4l2loopback (permanente vía /etc/modules-load.d) ---
  if [ ! -e "$V4L2_DEVICE" ]; then
    err "$V4L2_DEVICE no existe. Ejecuta:"
    err "  echo 'v4l2loopback' | sudo tee /etc/modules-load.d/v4l2loopback.conf"
    err "  sudo modprobe v4l2loopback"
    exit 1
  fi
  ok "v4l2loopback activo → $V4L2_DEVICE"

  # --- 2. Limpiar conexiones ADB duplicadas ---
  # Desconectar TCP para evitar "Multiple ADB devices" con mismo teléfono
  ADB_TCP_DEVICES=$(adb devices -l 2>/dev/null | grep "tcpip" | awk '{print $1}' || true)
  if [ -n "$ADB_TCP_DEVICES" ]; then
    for tcp_dev in $ADB_TCP_DEVICES; do
      log "Desconectando ADB TCP: $tcp_dev"
      adb disconnect "$tcp_dev" 2>/dev/null || true
    done
  fi

  # Verificar que queda exactamente 1 dispositivo
  ADB_COUNT=$(adb devices 2>/dev/null | grep -c "device$" || true)
  if [ "$ADB_COUNT" -eq 0 ]; then
    err "No se encontró dispositivo ADB conectado por USB."
    err "  → Conecta el teléfono por USB y habilita depuración."
    exit 1
  elif [ "$ADB_COUNT" -gt 1 ]; then
    warn "Múltiples dispositivos ADB detectados ($ADB_COUNT). Usando USB (-d)."
  fi

  # --- 3. PulseAudio: crear pipeline de audio virtual ---
  log "Configurando audio virtual..."

  # ORDEN CORRECTO: primero null-sink, luego remap-source
  MODULE_NULL_ID=$(pactl load-module module-null-sink \
    sink_name="$PULSE_SINK_NAME" \
    sink_properties=device.description="$PULSE_SINK_DESC" 2>/dev/null) || {
    err "No se pudo crear null-sink PulseAudio."
    exit 1
  }

  MODULE_REMAP_ID=$(pactl load-module module-remap-source \
    master="${PULSE_SINK_NAME}.monitor" \
    source_name="$PULSE_SOURCE_NAME" \
    source_properties=device.description="$PULSE_SOURCE_DESC" 2>/dev/null) || {
    err "No se pudo crear remap-source PulseAudio."
    exit 1
  }

  ok "Audio virtual configurado (null-sink: $MODULE_NULL_ID, remap: $MODULE_REMAP_ID)"

  # --- 4. Iniciar scrcpy ---
  log "Iniciando scrcpy (cámara + micrófono → v4l2 + PulseAudio)..."

  PULSE_SINK="$PULSE_SINK_NAME" scrcpy \
    -d \
    --video-source=camera \
    --camera-id="$SCRCPY_CAMERA_ID" \
    --camera-size="$SCRCPY_CAMERA_SIZE" \
    --v4l2-sink="$V4L2_DEVICE" \
    --no-video-playback \
    --audio-source=mic \
    --audio-codec=raw \
    >/dev/null 2>&1 &
  SCRCPY_PID=$!

  # Esperar brevemente para detectar fallo inmediato
  sleep 2
  if ! kill -0 "$SCRCPY_PID" 2>/dev/null; then
    err "scrcpy falló al iniciar. Verifica conexión USB y permisos de cámara."
    exit 1
  fi

  ok "scrcpy corriendo (PID: $SCRCPY_PID)"
else
  warn "Iniciando SIN cámara Android (--no-camera)."
fi

# === Infraestructura y apps ===
echo ""
log "Levantando infraestructura..."
bun run infra:up

echo ""
log "Iniciando aplicaciones..."
bun run dev:apps
