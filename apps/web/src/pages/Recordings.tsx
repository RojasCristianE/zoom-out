import { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@ui/index'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/index'
import { Search, Play, FileText, Calendar as CalendarIcon, X } from 'lucide-react'
import { api } from '@web/api/client'
import TranscriptViewer from '@web/components/video/TranscriptViewer'
import type { TranscriptSegment } from '@zoom-out/shared-types'

// ──────────────────────────────────────────────
// Página de Grabaciones — Datos reales + Transcripciones
// ──────────────────────────────────────────────

interface RecordingData {
  id: string
  roomId: string
  status: string
  videoKey?: string | null
  transcriptionKey?: string | null
  durationSeconds?: number | null
  fileSizeBytes?: number | null
  startedAt: string
  endedAt?: string | null
  createdAt: string
  videoUrl?: string
  transcriptionUrl?: string
}

interface TranscriptData {
  recordingId: string
  language: string
  segments: TranscriptSegment[]
}

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const statusColors: Record<string, string> = {
  recording: 'bg-error/20 text-error border-error/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ready: 'bg-success/20 text-success border-success/30',
  failed: 'bg-error/20 text-error border-error/30',
}

const statusLabels: Record<string, string> = {
  recording: 'Grabando',
  processing: 'Procesando',
  ready: 'Lista',
  failed: 'Error',
}

export default function Recordings() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [recordings, setRecordings] = useState<RecordingData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTranscript, setActiveTranscript] = useState<TranscriptData | null>(null)
  const [loadingTranscript, setLoadingTranscript] = useState(false)

  // Cargar grabaciones
  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true)
      try {
        const { data } = await api.recordings.get({ $query: {} })
        if (data && 'data' in data) {
          setRecordings(data.data as unknown as RecordingData[])
        }
      } catch (err) {
        console.error('Error cargando grabaciones:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecordings()
  }, [])

  // Ver transcripción
  const handleViewTranscript = useCallback(async (recordingId: string) => {
    setLoadingTranscript(true)
    try {
      const { data } = await api.recordings[recordingId].transcript.get()
      if (data && typeof data === 'object' && 'segments' in data) {
        setActiveTranscript(data as unknown as TranscriptData)
      }
    } catch (err) {
      console.error('Error cargando transcripción:', err)
    } finally {
      setLoadingTranscript(false)
    }
  }, [])

  // Filtrar por búsqueda
  const filteredRecordings = recordings.filter((rec) => {
    if (!searchQuery.trim()) return true
    return rec.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grabaciones</h1>
          <p className="text-muted-foreground">Gestiona y revisa el historial de tus sesiones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[350px_1fr]">
        {/* Historial / Calendario */}
        <div className="space-y-6">
          <Card className="border-none bg-accent/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="size-4 text-primary" />
                Historial de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-none bg-transparent"
              />
            </CardContent>
          </Card>

          <div className="rounded-xl border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {recordings.length} grabación{recordings.length !== 1 ? 'es' : ''} en total
            </p>
          </div>
        </div>

        {/* Lista de Grabaciones */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-accent/30 px-3 py-2">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por sala..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-border animate-spin border-t-primary" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRecordings.map((rec) => (
                <Card
                  key={rec.id}
                  className="group overflow-hidden border-none bg-accent/10 transition-all hover:bg-accent/20"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Play className="size-5 fill-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-sm">
                        {rec.videoKey?.split('/').pop() ?? rec.id.slice(0, 8)}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDuration(rec.durationSeconds)}</span>
                        <span>•</span>
                        <span>
                          {new Date(rec.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {rec.fileSizeBytes && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(rec.fileSizeBytes)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Badge de estado */}
                      <span
                        className={`rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${statusColors[rec.status] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {statusLabels[rec.status] ?? rec.status}
                      </span>

                      {/* Botón de transcripción */}
                      {rec.transcriptionKey && rec.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => handleViewTranscript(rec.id)}
                          disabled={loadingTranscript}
                          className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[10px] font-medium uppercase tracking-wider hover:bg-secondary/80 transition-colors"
                        >
                          <FileText className="size-3" />
                          Transcripción
                        </button>
                      )}

                      {/* Botón de video */}
                      {rec.status === 'ready' && rec.videoKey && (
                        <button
                          type="button"
                          onClick={async () => {
                            const { data } = await api.recordings[rec.id].get()
                            if (data && 'videoUrl' in data && data.videoUrl) {
                              window.open(data.videoUrl as string, '_blank')
                            }
                          }}
                          className="rounded-md border border-primary/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                          Abrir
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredRecordings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-accent/20 p-4">
                <CalendarIcon className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Sin grabaciones</h3>
              <p className="text-sm text-muted-foreground">
                No se encontraron sesiones grabadas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Transcripción */}
      {activeTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <button
            type="button"
            onClick={() => setActiveTranscript(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Cerrar transcripción"
          />
          {/* Panel */}
          <div className="relative w-full max-w-2xl mx-4 rounded-xl bg-card border border-border p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTranscript(null)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
            <TranscriptViewer
              segments={activeTranscript.segments}
              language={activeTranscript.language}
              onClose={() => setActiveTranscript(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
