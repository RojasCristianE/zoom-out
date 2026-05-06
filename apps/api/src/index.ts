import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authModule } from './modules/auth'
import { roomsModule } from './modules/rooms'
import { recordingsModule } from './modules/recordings'
import { usersModule } from './modules/users'
import { env } from './lib/env'

// ──────────────────────────────────────────────
// Zoom-Out API — ElysiaJS Orchestrator
// ──────────────────────────────────────────────

const app = new Elysia()
  .use(cors({ origin: true }))
  .get('/', () => ({ 
    message: 'Zoom-Out API is running', 
    web_app: 'http://localhost:5173',
    api_base: '/api' 
  }))
  .group('/api', app => app
    .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
    .use(authModule)
    .use(roomsModule)
    .use(recordingsModule)
    .use(usersModule)
  )
  .listen(Number(env.API_PORT) || 3001)

console.log(`🚀 Zoom-Out API running at http://localhost:${app.server?.port}`)

// ⚡ Export the type — this IS the API contract for Eden Treaty
export type App = typeof app
