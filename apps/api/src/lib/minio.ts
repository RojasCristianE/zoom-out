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
 * Genera una URL pre-firmada para descargar un objeto de MinIO.
 */
export async function getPresignedUrl(
  bucket: string,
  objectKey: string,
  expirySeconds = 3600,
): Promise<string> {
  return await minioClient.presignedGetObject(bucket, objectKey, expirySeconds)
}

/**
 * Asegura que un bucket exista, creándolo si es necesario.
 */
export async function ensureBucket(bucket: string): Promise<void> {
  const exists = await minioClient.bucketExists(bucket)
  if (!exists) {
    await minioClient.makeBucket(bucket)
  }
}

/**
 * Descarga un objeto de MinIO como Buffer.
 */
export async function getObjectBuffer(bucket: string, objectKey: string): Promise<Buffer> {
  const stream = await minioClient.getObject(bucket, objectKey)
  const chunks: Uint8Array[] = []

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
  })
}

/**
 * Sube un objeto a MinIO.
 */
export async function putObject(
  bucket: string,
  objectKey: string,
  data: Buffer | string,
  contentType = 'application/octet-stream',
): Promise<void> {
  const buffer = typeof data === 'string' ? Buffer.from(data) : data
  await minioClient.putObject(bucket, objectKey, buffer, buffer.length, {
    'Content-Type': contentType,
  })
}

/**
 * Obtiene metadatos (tamaño, etc.) de un objeto en MinIO.
 */
export async function statObject(bucket: string, objectKey: string) {
  return await minioClient.statObject(bucket, objectKey)
}
