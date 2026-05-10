#!/bin/bash

# Default flag: use camera
USE_CAMERA=1

# Parse arguments
for arg in "$@"; do
  if [ "$arg" == "--no-camera" ]; then
    USE_CAMERA=0
  fi
done

# Cleanup function
cleanup() {
  echo -e "\n🧹 Deteniendo servicios..."
  
  if [ $USE_CAMERA -eq 1 ]; then
    echo "📷 Limpiando configuración de cámara y audio..."
    # Matar scrcpy si está corriendo
    pkill -f "scrcpy.*--video-source=camera" 2>/dev/null
    
    # Descargar módulos de PulseAudio si existen
    if [ -n "$MODULE_REMAP_ID" ]; then
      pactl unload-module "$MODULE_REMAP_ID" 2>/dev/null
    fi
    if [ -n "$MODULE_NULL_ID" ]; then
      pactl unload-module "$MODULE_NULL_ID" 2>/dev/null
    fi
  fi
  
  # Terminar procesos en background iniciados por este script (dev:apps)
  kill $(jobs -p) 2>/dev/null
  wait 2>/dev/null
}

# Trap para limpiar al recibir SIGINT (Ctrl+C) o al salir
trap cleanup EXIT

if [ $USE_CAMERA -eq 1 ]; then
  echo "📱 Iniciando cámara Android por defecto (usa --no-camera para deshabilitar)..."
  
  # Cargar módulos de PulseAudio y guardar sus IDs para limpieza
  MODULE_REMAP_ID=$(pactl load-module module-remap-source master=Mic_Virtual.monitor source_name=Mic_Android_Final source_properties=device.description="Microfono_Samsung_A36")
  MODULE_NULL_ID=$(pactl load-module module-null-sink sink_name=Mic_Virtual sink_properties=device.description="Cable_Virtual_Android")
  
  # Iniciar scrcpy en background enviando el audio al sink virtual
  # Descartamos el output para que no ensucie los logs del servidor
  PULSE_SINK=Mic_Virtual scrcpy --video-source=camera --camera-id=0 --camera-size=1280x720 --v4l2-sink=/dev/video10 --no-video-playback >/dev/null 2>&1 &
  
  echo "✅ Configuración de audio virtual y scrcpy iniciada."
else
  echo "🚫 Iniciando SIN cámara Android (--no-camera detectado)."
fi

echo "🚀 Levantando infraestructura..."
bun run infra:up

echo "🌐 Iniciando aplicaciones..."
# Ejecutamos en primer plano para ver los logs y poder detener con Ctrl+C
bun run dev:apps
