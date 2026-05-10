import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { webhookReceiver } from '@api/lib/livekit'
import { db } from '@api/lib/db'
import { recordings, rooms } from '@db/schema'
import { transcriptionQueue } from '@api/workers/transcription.worker'
import type { WebhookEvent } from 'livekit-server-sdk'

// ──────────────────────────────────────────────
// Módulo de Webhooks — LiveKit Events
// ──────────────────────────────────────────────
// Ruta PÚBLICA (sin auth JWT). Validación por firma LiveKit.

export const webhooksModule = new Elysia({ prefix: '/webhooks' })
  .post('/livekit', async ({ request, set }) => {
    try {
      // LiveKit envía el body como application/webhook+json
      // Necesitamos el raw body para validar la firma
      const rawBody = await request.text()
      const authHeader = request.headers.get('authorization') ?? ''

      const event: WebhookEvent = await webhookReceiver.receive(rawBody, authHeader)

      console.log(`📡 LiveKit webhook: ${event.event}`)

      switch (event.event) {
        case 'egress_ended':
          await handleEgressEnded(event)
          break

        case 'egress_started':
          console.log(`🔴 Egress iniciado: ${event.egressInfo?.egressId}`)
          break

        case 'room_started':
          console.log(`🏠 Sala iniciada en LiveKit: ${event.room?.name}`)
          break

        case 'room_finished':
          console.log(`🏠 Sala finalizada en LiveKit: ${event.room?.name}`)
          await handleRoomFinished(event)
          break

        case 'participant_joined':
          console.log(`👤 Participante unido: ${event.participant?.identity} → ${event.room?.name}`)
          break

        case 'participant_left':
          console.log(`👤 Participante salió: ${event.participant?.identity} → ${event.room?.name}`)
          break

        default:
          console.log(`ℹ️ Evento no manejado: ${event.event}`)
      }

      return { received: true }
    } catch (error) {
      console.error('❌ Error procesando webhook LiveKit:', error)
      set.status = 400
      return { error: 'Invalid webhook' }
    }
  })

// ──── Handlers ────

async function handleEgressEnded(event: WebhookEvent) {
  const egressInfo = event.egressInfo
  if (!egressInfo) {
    console.error('❌ egress_ended sin egressInfo')
    return
  }

  const egressId = egressInfo.egressId
  console.log(`🎬 Egress finalizado: ${egressId}`)

  // Buscar la grabación asociada a este egress
  const [recording] = await db
    .select()
    .from(recordings)
    .where(eq(recordings.egressId, egressId))
    .limit(1)

  if (!recording) {
    console.error(`❌ No se encontró recording para egress: ${egressId}`)
    return
  }

  // Extraer la ruta del archivo generado por el egress
  // El egress guarda los resultados en fileResults
  const fileResults = egressInfo.fileResults
  let videoKey: string | undefined

  if (fileResults && fileResults.length > 0) {
    // El filepath del egress corresponde al object key en MinIO
    videoKey = fileResults[0].filename
    console.log(`📁 Archivo de egress: ${videoKey}`)
  }

  // Actualizar recording con la info del egress
  await db
    .update(recordings)
    .set({
      status: 'processing',
      videoKey: videoKey ?? recording.videoKey,
      endedAt: new Date(),
    })
    .where(eq(recordings.id, recording.id))

  // Lanzar pipeline de transcripción en BullMQ
  await transcriptionQueue.add('transcribe-recording', {
    recordingId: recording.id,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  })
  
  console.log(`📥 Trabajo de transcripción encolado para: ${recording.id}`)
}

/**
 * Sincroniza el estado de la sala en DB cuando LiveKit la cierra
 * (por timeout, manualmente, etc.)
 */
async function handleRoomFinished(event: WebhookEvent) {
  const roomName = event.room?.name
  if (!roomName) {
    console.error('❌ room_finished sin room name')
    return
  }

  const [updated] = await db
    .update(rooms)
    .set({
      status: 'ended',
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(rooms.livekitRoomName, roomName))
    .returning()

  if (updated) {
    console.log(`🔄 Sala sincronizada: ${updated.name} → ended`)
  } else {
    console.warn(`⚠️ No se encontró sala con livekitRoomName: ${roomName}`)
  }
}
