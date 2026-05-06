// ──────────────────────────────────────────────
// Recording & Transcription Types
// ──────────────────────────────────────────────

export type RecordingStatus = 'recording' | 'processing' | 'ready' | 'failed'

export interface RecordingMeta {
  id: string
  roomId: string
  status: RecordingStatus
  videoKey?: string // MinIO object key
  audioKey?: string
  transcriptionKey?: string
  durationSeconds?: number
  fileSizeBytes?: number
  startedAt: string
  endedAt?: string
  createdAt: string
}

export interface TranscriptSegment {
  start: number // seconds
  end: number
  text: string
  speaker?: string
}

export interface Transcription {
  recordingId: string
  language: string
  segments: TranscriptSegment[]
}
