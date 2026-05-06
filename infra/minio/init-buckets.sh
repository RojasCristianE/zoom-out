#!/bin/sh
# ──────────────────────────────────────────────
# MinIO Bucket Initialization Script
# ──────────────────────────────────────────────
# This script is run by the minio-init container to create
# the required buckets on first startup.

set -e

mc alias set local http://minio:9000 "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"

mc mb --ignore-existing local/"${MINIO_BUCKET_RECORDINGS:-recordings}"
mc mb --ignore-existing local/transcriptions

echo "✅ MinIO buckets initialized successfully"
