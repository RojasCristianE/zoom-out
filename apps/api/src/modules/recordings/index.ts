import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { recordingIdParam, listRecordingsQuery } from '@zoom-out/validators'
import { requireRole } from '@/middleware/requireRole'
import { db } from '@/lib/db'
import { getPresignedUrl } from '@/lib/minio'
import { env } from '@/lib/env'
import { recordings } from '@db/schema'

// ──────────────────────────────────────────────
// Recordings Module — Protected routes
// ──────────────────────────────────────────────

export const recordingsModule = new Elysia({ prefix: '/recordings' })
  .use(requireRole('admin', 'host'))

  // List recordings with optional room filter
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

  // Get a single recording with download URLs
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
