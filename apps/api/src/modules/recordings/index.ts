import { Elysia } from 'elysia'
import { eq, and } from 'drizzle-orm'
import { recordingIdParam, startRecordingBody, listRecordingsQuery } from '@zoom-out/validators'
import { requireRole } from '@api/middleware/requireRole'
import { db } from '@api/lib/db'
import { getPresignedUrl, getObjectBuffer } from '@api/lib/minio'
import { startRoomRecording, stopRecording } from '@api/lib/livekit'
import { env } from '@api/lib/env'
import { recordings, rooms } from '@db/schema'

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
        return { code: 'NOT_FOUND', message: 'Grabación no encontrada' }
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
        urls.transcriptionUrl = await getPresignedUrl('transcriptions', recording.transcriptionKey)
      }

      return { ...recording, ...urls }
    },
    { params: recordingIdParam },
  )

  // Iniciar grabación de una sala
  .post(
    '/start',
    async ({ body, set }) => {
      // Validar que la sala existe y está activa
      const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, body.roomId))
        .limit(1)

      if (!room) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Sala no encontrada' }
      }

      if (room.status !== 'active') {
        set.status = 400
        return { code: 'VALIDATION_ERROR', message: 'Solo puedes grabar salas activas' }
      }

      if (!room.livekitRoomName) {
        set.status = 500
        return { code: 'INTERNAL_ERROR', message: 'La sala no tiene mapeo a LiveKit' }
      }

      // Verificar que no hay grabación activa para esta sala
      const [activeRecording] = await db
        .select()
        .from(recordings)
        .where(
          and(
            eq(recordings.roomId, body.roomId),
            eq(recordings.status, 'recording'),
          ),
        )
        .limit(1)

      if (activeRecording) {
        set.status = 409
        return { code: 'CONFLICT', message: 'Ya existe una grabación activa para esta sala' }
      }

      // Construir filepath para MinIO
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filepath = `${room.livekitRoomName}/${timestamp}.mp4`

      // Iniciar egress en LiveKit
      const egressInfo = await startRoomRecording(room.livekitRoomName, filepath)

      // Crear registro en DB
      const [recording] = await db
        .insert(recordings)
        .values({
          roomId: body.roomId,
          status: 'recording',
          egressId: egressInfo.egressId,
          videoKey: filepath,
        })
        .returning()

      console.log(`🔴 Grabación iniciada: ${recording.id} (egress: ${egressInfo.egressId})`)
      return recording
    },
    { body: startRecordingBody },
  )

  // Detener grabación
  .post(
    '/:id/stop',
    async ({ params, set }) => {
      const [recording] = await db
        .select()
        .from(recordings)
        .where(eq(recordings.id, params.id))
        .limit(1)

      if (!recording) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Grabación no encontrada' }
      }

      if (recording.status !== 'recording') {
        set.status = 400
        return {
          code: 'VALIDATION_ERROR',
          message: `No se puede detener una grabación en estado '${recording.status}'`,
        }
      }

      if (!recording.egressId) {
        set.status = 500
        return { code: 'INTERNAL_ERROR', message: 'La grabación no tiene egressId asociado' }
      }

      // Detener egress en LiveKit
      await stopRecording(recording.egressId)

      // Actualizar estado (el webhook de egress_ended completará el flujo)
      const [updated] = await db
        .update(recordings)
        .set({ status: 'processing' })
        .where(eq(recordings.id, params.id))
        .returning()

      console.log(`⏹️ Grabación detenida: ${recording.id}`)
      return updated
    },
    { params: recordingIdParam },
  )

  // Obtener transcripción de una grabación
  .get(
    '/:id/transcript',
    async ({ params, set }) => {
      const [recording] = await db
        .select()
        .from(recordings)
        .where(eq(recordings.id, params.id))
        .limit(1)

      if (!recording) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Grabación no encontrada' }
      }

      if (!recording.transcriptionKey) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Esta grabación no tiene transcripción disponible' }
      }

      try {
        const buffer = await getObjectBuffer('transcriptions', recording.transcriptionKey)
        const transcript = JSON.parse(buffer.toString('utf-8'))
        return transcript
      } catch {
        set.status = 500
        return { code: 'INTERNAL_ERROR', message: 'Error al leer la transcripción' }
      }
    },
    { params: recordingIdParam },
  )
