import { Elysia } from 'elysia';
import { eq } from 'drizzle-orm';
import { webhookReceiver } from '@api/lib/livekit';
import { db } from '@api/lib/db';
import { audiencias, grabaciones } from '@db/schema';
import { colaTranscripciones } from '@api/workers/transcription.worker';
import type { WebhookEvent } from 'livekit-server-sdk';

export const webhooksModule = new Elysia({ prefix: '/webhooks' })
  .post('/livekit', async ({ request, set }) => {
    try {
      const rawBody = await request.text();
      const authHeader = request.headers.get('authorization') ?? '';

      const event: WebhookEvent = await webhookReceiver.receive(rawBody, authHeader);
      console.log(`📡 LiveKit webhook: ${event.event}`);

      switch (event.event) {
        case 'egress_ended':
          await manejarEgressTerminado(event);
          break;

        case 'room_started':
          if (event.room?.name) {
            await db
              .update(audiencias)
              .set({
                estado: 'en_curso',
                inicioEfectivo: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(audiencias.livekitRoomName, event.room.name));
          }
          break;

        case 'room_finished':
          if (event.room?.name) {
            await db
              .update(audiencias)
              .set({
                estado: 'finalizada',
                finEfectivo: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(audiencias.livekitRoomName, event.room.name));
          }
          break;

        default:
          break;
      }

      return { received: true };
    } catch (error) {
      console.error('❌ Error webhook LiveKit:', error);
      set.status = 400;
      return { error: 'Invalid webhook' };
    }
  });

async function manejarEgressTerminado(event: WebhookEvent) {
  const egressInfo = event.egressInfo;
  if (!egressInfo) return;

  const egressId = egressInfo.egressId;
  console.log(`🎬 Egress de audio finalizado: ${egressId}`);

  const [grab] = await db
    .select()
    .from(grabaciones)
    .where(eq(grabaciones.egressId, egressId))
    .limit(1);

  if (!grab) {
    console.warn(`⚠️ Grabación no encontrada para egress: ${egressId}`);
    return;
  }

  const s3Key = egressInfo.fileResults?.[0]?.filename ?? grab.s3Key;

  await db
    .update(grabaciones)
    .set({
      estado: 'procesando',
      s3Key,
      updatedAt: new Date(),
    })
    .where(eq(grabaciones.id, grab.id));

  // Encolar trabajo en BullMQ
  await colaTranscripciones.add(
    'transcribir-audio',
    { grabacionId: grab.id },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  );

  console.log(`📥 Grabación encolada para transcripción: ${grab.id}`);
}
