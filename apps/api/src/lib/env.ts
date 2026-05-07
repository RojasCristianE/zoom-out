// ──────────────────────────────────────────────
// Validación de Entorno — Error inmediato si está mal configurado
// ──────────────────────────────────────────────

const requiredVars = [
  'DATABASE_URL',
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'MINIO_ENDPOINT',
  'MINIO_PORT',
  'MINIO_ACCESS_KEY',
  'MINIO_SECRET_KEY',
  'MINIO_BUCKET_RECORDINGS',
  'WHISPER_API_URL',
  'JWT_SECRET',
  'WEB_URL',
] as const

const missing = requiredVars.filter((key) => !Bun.env[key])

if (missing.length > 0) {
  console.error('❌ Faltan variables de entorno obligatorias:')
  for (const key of missing) {
    console.error(`   - ${key}`)
  }
  process.exit(1)
}

// Acceso tipado a env tras la validación
function getEnv<T extends string>(key: T): string {
  return Bun.env[key]!
}

export const env = {
  DATABASE_URL: getEnv('DATABASE_URL'),
  LIVEKIT_URL: getEnv('LIVEKIT_URL'),
  LIVEKIT_API_KEY: getEnv('LIVEKIT_API_KEY'),
  LIVEKIT_API_SECRET: getEnv('LIVEKIT_API_SECRET'),
  MINIO_ENDPOINT: getEnv('MINIO_ENDPOINT'),
  MINIO_PORT: getEnv('MINIO_PORT'),
  MINIO_ACCESS_KEY: getEnv('MINIO_ACCESS_KEY'),
  MINIO_SECRET_KEY: getEnv('MINIO_SECRET_KEY'),
  MINIO_BUCKET_RECORDINGS: getEnv('MINIO_BUCKET_RECORDINGS'),
  MINIO_USE_SSL: Bun.env.MINIO_USE_SSL ?? 'false',
  WHISPER_API_URL: getEnv('WHISPER_API_URL'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  WEB_URL: getEnv('WEB_URL'),
  API_PORT: Bun.env.API_PORT ?? '3001',
} as const
