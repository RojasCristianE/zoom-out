import { Worker, Queue } from 'bullmq'
import Redis from 'ioredis'
import { processRecordingTranscription } from '@api/services/transcription.service'
import { env } from '@api/lib/env'

// ──────────────────────────────────────────────
// Worker de Transcripción — BullMQ
// ──────────────────────────────────────────────

// Configuración de Redis
const redisConnection = new Redis({
  host: 'localhost', // Docker compose mapea el redis al host en modo dev
  port: 6379,
  maxRetriesPerRequest: null, // Requerido por BullMQ
})

export const QUEUE_NAME = 'transcription-queue'

// Cola para encolar trabajos
export const transcriptionQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
})

let worker: Worker | null = null

export function startTranscriptionWorker() {
  if (worker) return

  console.log('👷 Iniciando worker de transcripciones (BullMQ)...')

  worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { recordingId } = job.data
      console.log(`[Job ${job.id}] Procesando recording: ${recordingId}`)
      await processRecordingTranscription(recordingId)
    },
    {
      connection: redisConnection,
      concurrency: 1, // Procesar 1 a la vez dado que usa CPU y ffmpeg
    },
  )

  worker.on('completed', (job) => {
    console.log(`[Job ${job.id}] Completado exitosamente`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[Job ${job?.id}] Falló con error:`, err)
  })
}

export function stopTranscriptionWorker() {
  if (worker) {
    console.log('Deteniendo worker de transcripciones...')
    worker.close()
    worker = null
  }
}
