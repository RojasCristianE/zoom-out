import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { recordingIdParam, listRecordingsQuery } from '@zoom-out/validators'
import { requireRole } from '@api/middleware/requireRole'
import { db } from '@api/lib/db'
import { getPresignedUrl } from '@api/lib/minio'
import { env } from '@api/lib/env'
import { recordings } from '@db/schema'

// ──────────────────────────────────────────────
// Módulo de Grabaciones — Rutas protegidas
// ──────────────────────────────────────────────

export const recordingsModule = new Elysia({ prefix: '/recordings' })
  .use(requireRole('admin', 'host'))

  // Listar grabaciones con filtro opcional por sala
  .get(
    '/',
    async ({ query }) => {
      let q = db.select().from(recordings)

      if (query.roomId) {
        q = q.where(eq(recordings.roomId, query.roomId)) as typeof q
      }

      const data = await q.orderBy(recordings.createdAt)

      return { data }
    },
    { query: listRecordingsQuery },
  )

  // Obtener una grabación individual con URLs de descarga
  .get(
    '/:id',
    async ({ params, set }) => {
      const [recording] = await db
        .select()
        .from(recordings)
        .where(eq(recordings.id, params.id))
        .limit(1)

      if (!recording) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Recording not found' }
      }

      const bucket = env.MINIO_BUCKET_RECORDINGS

      const urls: Record<string, string> = {}
      if (recording.videoKey) {
        urls.videoUrl = await getPresignedUrl(bucket, recording.videoKey)
      }
      if (recording.audioKey) {
        urls.audioUrl = await getPresignedUrl(bucket, recording.audioKey)
      }
      if (recording.transcriptionKey) {
        urls.transcriptionUrl = await getPresignedUrl(bucket, recording.transcriptionKey)
      }

      return { ...recording, ...urls }
    },
    { params: recordingIdParam },
  )
