import { Client } from 'minio'
import { env } from './env'

// ──────────────────────────────────────────────
// MinIO S3 Client
// ──────────────────────────────────────────────

export const minioClient = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: Number(env.MINIO_PORT),
  useSSL: env.MINIO_USE_SSL === 'true',
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
})

/**
 * Generate a pre-signed URL for downloading an object from MinIO.
 */
export async function getPresignedUrl(
  bucket: string,
  objectKey: string,
  expirySeconds = 3600,
): Promise<string> {
  return await minioClient.presignedGetObject(bucket, objectKey, expirySeconds)
}

/**
 * Ensure a bucket exists, create it if not.
 */
export async function ensureBucket(bucket: string): Promise<void> {
  const exists = await minioClient.bucketExists(bucket)
  if (!exists) {
    await minioClient.makeBucket(bucket)
  }
}
