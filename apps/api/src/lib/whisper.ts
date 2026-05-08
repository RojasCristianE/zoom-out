import { env } from './env'
import type { TranscriptSegment } from '@zoom-out/shared-types'

// ──────────────────────────────────────────────
// Faster-Whisper Client (OpenAI-compatible API)
// ──────────────────────────────────────────────

interface WhisperVerboseSegment {
  id: number
  start: number
  end: number
  text: string
  tokens: number[]
  temperature: number
  avg_logprob: number
  compression_ratio: number
  no_speech_prob: number
}

interface WhisperVerboseResponse {
  task: string
  language: string
  duration: number
  text: string
  segments: WhisperVerboseSegment[]
}

/**
 * Envía un archivo de audio/video a Faster-Whisper para transcripción.
 * Usa el endpoint OpenAI-compatible /v1/audio/transcriptions.
 */
export async function transcribeAudio(
  fileBuffer: Buffer,
  filename: string,
  language = 'es',
): Promise<{ segments: TranscriptSegment[]; language: string; duration: number }> {
  const formData = new FormData()

  const blob = new Blob([new Uint8Array(fileBuffer)], { type: 'application/octet-stream' })
  formData.append('file', blob, filename)
  formData.append('response_format', 'verbose_json')
  formData.append('language', language)

  const response = await fetch(`${env.WHISPER_API_URL}/v1/audio/transcriptions`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Whisper API error (${response.status}): ${errorText}`)
  }

  const result = (await response.json()) as WhisperVerboseResponse

  // Mapear segmentos de Whisper a nuestro tipo
  const segments: TranscriptSegment[] = result.segments.map((seg) => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  }))

  return {
    segments,
    language: result.language,
    duration: result.duration,
  }
}
