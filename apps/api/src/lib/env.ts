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
  // Solo lo usa Egress dentro de Docker: 'minio' es siempre correcto en Compose
  MINIO_INTERNAL_ENDPOINT: Bun.env.MINIO_INTERNAL_ENDPOINT ?? 'minio',
  MINIO_PORT: getEnv('MINIO_PORT'),
  MINIO_ACCESS_KEY: getEnv('MINIO_ACCESS_KEY'),
  MINIO_SECRET_KEY: getEnv('MINIO_SECRET_KEY'),
  MINIO_BUCKET_AUDIENCIAS: Bun.env.MINIO_BUCKET_AUDIENCIAS ?? Bun.env.MINIO_BUCKET_RECORDINGS ?? 'audiencias',
  MINIO_USE_SSL: Bun.env.MINIO_USE_SSL ?? 'false',
  REDIS_URL: Bun.env.REDIS_URL ?? 'redis://localhost:6379',
  WHISPER_API_URL: Bun.env.WHISPER_API_URL ?? 'http://localhost:9090',
  WHISPER_MODEL: Bun.env.WHISPER_MODEL ?? 'large-v3-turbo',
  OLLAMA_API_URL: Bun.env.OLLAMA_API_URL ?? 'http://localhost:11434',
  OLLAMA_MODEL: Bun.env.OLLAMA_MODEL ?? 'gemma3:4b',
  IA_EVALUACION_HABILITADA: Bun.env.IA_EVALUACION_HABILITADA === 'true',
  TYPST_BIN: Bun.env.TYPST_BIN ?? 'typst',
  TZ_JUZGADO: Bun.env.TZ_JUZGADO ?? 'America/Managua',
  JURISDICCION_DEFAULT: Bun.env.JURISDICCION_DEFAULT ?? 'Nicaragua',
  JWT_SECRET: getEnv('JWT_SECRET'),
  WEB_URL: getEnv('WEB_URL'),
  API_PORT: Bun.env.API_PORT ?? '3000',
} as const
