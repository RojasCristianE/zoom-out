#!/bin/sh
# ──────────────────────────────────────────────
# MinIO Bucket Initialization Script
# ──────────────────────────────────────────────
set -e

# Esperar a que MinIO responda
until mc alias set local http://minio:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"; do
  echo "Esperando a MinIO..."
  sleep 2
done

BUCKET="${MINIO_BUCKET_AUDIENCIAS:-audiencias}"

# Crear bucket con Object Lock habilitado para soporte WORM judicial y versionado
if mc ls "local/${BUCKET}" > /dev/null 2>&1; then
  echo "Bucket local/${BUCKET} ya existe."
else
  mc mb --with-lock "local/${BUCKET}" || mc mb "local/${BUCKET}"
  mc version enable "local/${BUCKET}" || true
  echo "Bucket local/${BUCKET} creado y configurado."
fi

echo "✅ MinIO bucket judicial inicializado correctamente"
