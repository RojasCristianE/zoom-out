import { useState, useCallback } from 'react'
import { api } from '@web/api/client'
import { useRoomStore } from '@web/store/room'
import { useAuthStore } from '@web/store/auth'

// ──────────────────────────────────────────────
// Controles de Grabación — Solo host/admin
// ──────────────────────────────────────────────

interface RecordingControlsProps {
  roomId: string
}

export default function RecordingControls({ roomId }: RecordingControlsProps) {
  const user = useAuthStore((s) => s.user)
  const { isRecording, currentRecordingId, setRecording } = useRoomStore()
  const [loading, setLoading] = useState(false)

  // Solo host/admin pueden grabar
  const canRecord = user?.role === 'admin' || user?.role === 'host'
  if (!canRecord) return null

  const handleStartRecording = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await api.recordings.start.post({ roomId })
      if (error) throw new Error(String(error))
      if (data && 'id' in data) {
        setRecording(true, data.id)
      }
    } catch (err) {
      console.error('Error iniciando grabación:', err)
    } finally {
      setLoading(false)
    }
  }, [roomId, setRecording])

  const handleStopRecording = useCallback(async () => {
    if (!currentRecordingId) return
    setLoading(true)
    try {
      const { error } = await api.recordings[currentRecordingId].stop.post({})
      if (error) throw new Error(String(error))
      setRecording(false, null)
    } catch (err) {
      console.error('Error deteniendo grabación:', err)
    } finally {
      setLoading(false)
    }
  }, [currentRecordingId, setRecording])

  return (
    <div className="flex items-center gap-3">
      {isRecording ? (
        <button
          type="button"
          onClick={handleStopRecording}
          disabled={loading}
          className="group flex items-center gap-2 px-4 py-2 rounded-md bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-all duration-300 disabled:opacity-50"
        >
          {/* Indicador de grabación pulsante */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
          </span>
          <span className="text-xs font-medium tracking-wide uppercase">
            {loading ? 'Deteniendo...' : 'Detener grabación'}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStartRecording}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted border border-border hover:border-error/50 hover:bg-error/5 transition-all duration-300 disabled:opacity-50"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40 group-hover:bg-error transition-colors" />
          <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
            {loading ? 'Iniciando...' : 'Grabar'}
          </span>
        </button>
      )}
    </div>
  )
}
