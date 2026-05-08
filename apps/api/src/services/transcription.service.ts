import { eq } from 'drizzle-orm'
import ffmpeg from 'fluent-ffmpeg'
import { join } from 'path'
import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { createWriteStream } from 'fs'
import { readFile } from 'fs/promises'
import { db } from '@api/lib/db'
import { getObjectBuffer, putObject, statObject } from '@api/lib/minio'
import { transcribeAudio } from '@api/lib/whisper'
import { env } from '@api/lib/env'
import { recordings } from '@db/schema'

// ──────────────────────────────────────────────
// Servicio de Transcripción — Lógica de Procesamiento
// ──────────────────────────────────────────────

/**
 * Extrae el audio de un buffer de video a formato WAV usando ffmpeg.
 */
async function extractAudioFromVideo(videoBuffer: Buffer): Promise<Buffer> {
  const tempDir = await mkdtemp(join(tmpdir(), 'zoomout-transcription-'))
  const inputPath = join(tempDir, 'input.mp4')
  const outputPath = join(tempDir, 'output.wav')

  try {
    // 1. Guardar el buffer de entrada en disco
    await Bun.write(inputPath, videoBuffer)

    // 2. Extraer audio usando ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vn',               // Ignorar video
          '-acodec pcm_s16le', // Formato PCM 16-bit
          '-ar 16000',         // Sample rate a 16kHz (óptimo para Whisper)
          '-ac 1',             // Mono
        ])
        .save(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
    })

    // 3. Leer el audio extraído
    const audioBuffer = await readFile(outputPath)
    return audioBuffer
  } finally {
    // 4. Limpiar temporales
    await rm(tempDir, { recursive: true, force: true }).catch((err) =>
      console.error('Error limpiando tempDir:', err),
    )
  }
}

/**
 * Ejecuta el pipeline de transcripción.
 *
 * Flujo:
 * 1. Descargar video de MinIO (bucket recordings)
 * 2. Extraer audio (.wav) usando ffmpeg local
 * 3. Enviar audio a Faster-Whisper API
 * 4. Guardar transcripción JSON en MinIO (bucket transcriptions)
 * 5. Actualizar DB: transcriptionKey, durationSeconds, fileSizeBytes, status='ready'
 */
export async function processRecordingTranscription(recordingId: string) {
  console.log(`📝 Procesando transcripción para recording: ${recordingId}`)

  try {
    // 1. Obtener datos de la grabación
    const [recording] = await db
      .select()
      .from(recordings)
      .where(eq(recordings.id, recordingId))
      .limit(1)

    if (!recording) {
      console.error(`❌ Recording ${recordingId} no encontrado`)
      return
    }

    if (!recording.videoKey) {
      console.error(`❌ Recording ${recordingId} no tiene videoKey`)
      await markFailed(recordingId)
      return
    }

    // 2. Obtener metadatos del video
    const bucket = env.MINIO_BUCKET_RECORDINGS
    const stat = await statObject(bucket, recording.videoKey)
    const fileSizeBytes = stat.size

    // 3. Descargar video de MinIO
    console.log(`⬇️ Descargando video ${recording.videoKey} (${Math.round(fileSizeBytes / 1024 / 1024)}MB)`)
    const videoBuffer = await getObjectBuffer(bucket, recording.videoKey)

    // 4. Extraer Audio
    console.log(`🎵 Extrayendo audio (ffmpeg)...`)
    const audioBuffer = await extractAudioFromVideo(videoBuffer)
    console.log(`🎵 Audio extraído: ${Math.round(audioBuffer.length / 1024 / 1024)}MB`)

    // 5. Enviar a Whisper para transcripción
    console.log('🎙️ Enviando a Faster-Whisper para transcripción...')
    const { segments, language, duration } = await transcribeAudio(
      audioBuffer,
      'audio.wav', // Nombre genérico para el endpoint
    )

    // 6. Guardar transcripción en MinIO
    const transcriptionKey = `${recording.roomId}/${recording.id}.json`
    const transcriptionData = JSON.stringify({
      recordingId: recording.id,
      language,
      segments,
    })

    await putObject('transcriptions', transcriptionKey, transcriptionData, 'application/json')
    console.log(`💾 Transcripción guardada: transcriptions/${transcriptionKey}`)

    // 7. Actualizar DB
    await db
      .update(recordings)
      .set({
        transcriptionKey,
        durationSeconds: Math.round(duration),
        fileSizeBytes,
        status: 'ready',
        endedAt: new Date(),
      })
      .where(eq(recordings.id, recordingId))

    console.log(`✅ Transcripción completada para recording: ${recordingId} (${segments.length} segmentos)`)
  } catch (error) {
    console.error(`❌ Error en transcripción de recording ${recordingId}:`, error)
    await markFailed(recordingId)
  }
}

async function markFailed(recordingId: string) {
  await db
    .update(recordings)
    .set({ status: 'failed' })
    .where(eq(recordings.id, recordingId))
}
