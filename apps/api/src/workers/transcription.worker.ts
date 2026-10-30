import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@api/lib/env';
import { procesarTranscripcionGrabacion } from '@api/services/transcripcion.service';

const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const COLA_TRANSCRIPCIONES = 'transcripciones-judiciales';

export const colaTranscripciones = new Queue(COLA_TRANSCRIPCIONES, {
  connection: redisConnection,
});

let worker: Worker | null = null;

export function iniciarWorkerTranscripcion() {
  if (worker) return;

  console.log('👷 Iniciando Worker de Transcripción Judicial (Faster-Whisper)...');

  worker = new Worker(
    COLA_TRANSCRIPCIONES,
    async (job) => {
      const { grabacionId } = job.data;
      console.log(`[Job ${job.id}] Transcribiendo grabación: ${grabacionId}`);
      await procesarTranscripcionGrabacion(grabacionId);
    },
    {
      connection: redisConnection,
      concurrency: 1, // CPU intensivo en Whisper
    },
  );

  worker.on('completed', (job) => {
    console.log(`[Job ${job.id}] Transcripción finalizada exitosamente.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Job ${job?.id}] Transcripción fallida:`, err);
  });
}
