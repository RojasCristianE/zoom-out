import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authModule } from './modules/auth';
import { catalogosRoutes } from './modules/catalogos';
import { expedientesRoutes } from './modules/expedientes';
import { agendaRoutes } from './modules/agenda';
import { audienciasRoutes } from './modules/audiencias';
import { marcadoresRoutes } from './modules/marcadores';
import { bibliotecaRoutes } from './modules/biblioteca';
import { documentosRoutes } from './modules/documentos';
import { reportesRoutes } from './modules/reportes';
import { webhooksModule } from './modules/webhooks';
import { usersModule } from './modules/users';
import { iniciarWorkerTranscripcion } from './workers/transcription.worker';
import { iniciarWorkerIa } from './workers/ia.worker';
import { env } from './lib/env';

// ──────────────────────────────────────────────
// API Judicial — Orquestador ElysiaJS
// ──────────────────────────────────────────────

const api = new Elysia()
  .get('/health', () => ({
    status: 'ok',
    sistema: 'Audiencias Judiciales Nicaragua',
    tz: env.TZ_JUZGADO,
    timestamp: new Date().toISOString(),
  }))
  .use(webhooksModule)
  .use(authModule)
  .use(catalogosRoutes)
  .use(expedientesRoutes)
  .use(agendaRoutes)
  .use(audienciasRoutes)
  .use(marcadoresRoutes)
  .use(bibliotecaRoutes)
  .use(documentosRoutes)
  .use(reportesRoutes)
  .use(usersModule);

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  .get('/', () => ({
    message: 'Sistema de Gestión y Automatización IA de Audiencias Judiciales',
    jurisdiccion: env.JURISDICCION_DEFAULT,
    tz: env.TZ_JUZGADO,
    api_base: '/api',
  }))
  .group('/api', (group) => group.use(api))
  .listen({
    port: Number(process.env.API_PORT) || 3000,
    hostname: '0.0.0.0',
  });

console.log(`🏛️ API Judicial corriendo en http://localhost:${app.server?.port}`);

// Iniciar workers en segundo plano
iniciarWorkerTranscripcion();
iniciarWorkerIa();

export type App = typeof api;
