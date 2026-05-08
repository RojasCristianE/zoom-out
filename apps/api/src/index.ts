import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authModule } from './modules/auth'
import { roomsModule } from './modules/rooms'
import { recordingsModule } from './modules/recordings'
import { usersModule } from './modules/users'
import { webhooksModule } from './modules/webhooks'
import { startTranscriptionWorker } from './workers/transcription.worker'
import { env } from './lib/env'

// ──────────────────────────────────────────────
// API Zoom-Out — Orquestador ElysiaJS
// ──────────────────────────────────────────────

const api = new Elysia()
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  .use(webhooksModule) // Webhooks ANTES de auth (ruta pública con validación por firma)
  .use(authModule)
  .use(roomsModule)
  .use(recordingsModule)
  .use(usersModule)

const app = new Elysia()
  .use(cors({ origin: env.WEB_URL }))
  .get('/', () => ({ 
    message: 'Zoom-Out API is running', 
    web_app: env.WEB_URL,
    api_base: '/api' 
  }))
  .group('/api', app => app.use(api))
  .listen(Number(env.API_PORT) || 3001)

console.log(`🚀 Zoom-Out API running at http://localhost:${app.server?.port}`)

// Iniciar worker de transcripciones
startTranscriptionWorker()

// ⚡ Exportar el tipo — este ES el contrato de la API para Eden Treaty
export type App = typeof api
