import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react'
import { api } from '@web/api/client'
import { useRoomStore } from '@web/store/room'
import RecordingControls from '@web/components/video/RecordingControls'
import '@livekit/components-styles'

// ──────────────────────────────────────────────
// Página de Sala — Videollamada Custom
// ──────────────────────────────────────────────

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || (
  window.location.hostname === 'localhost' 
    ? 'ws://localhost:7880' 
    : `ws://${window.location.hostname}:7880`
)

export default function Room() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { connectionState, token, roomName, error, setConnection, setConnected, setError, reset } =
    useRoomStore()

  // Unirse a la sala al montar
  useEffect(() => {
    if (!id) return

    const joinRoom = async () => {
      try {
        const { data, error: apiError } = await api.rooms[id!].join.post({})

        if (apiError || !data) {
          setError(typeof apiError === 'string' ? apiError : 'Error al unirse a la sala')
          return
        }

        if ('token' in data && 'roomName' in data) {
          setConnection(data.token as string, data.roomName ?? id!)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error de conexión')
      }
    }

    joinRoom()

    return () => {
      reset()
    }
  }, [id, setConnection, setError, reset])

  const handleDisconnected = useCallback(() => {
    reset()
    navigate('/')
  }, [reset, navigate])

  const handleConnected = useCallback(() => {
    setConnected()
  }, [setConnected])

  // Estado: Error
  if (connectionState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="h-16 w-16 rounded-full bg-error/10 border border-error/30 flex items-center justify-center">
          <span className="text-2xl">✕</span>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tighter mb-2 text-error">Error de conexión</h2>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-md bg-muted border border-border hover:bg-muted/80 text-sm font-medium transition-all"
        >
          Volver al Dashboard
        </button>
      </div>
    )
  }

  // Estado: Cargando (sin token aún)
  if (!token || !roomName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-2 border-border animate-spin border-t-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tighter mb-2">Conectando a la sala</h2>
          <p className="text-sm text-muted-foreground">Preparando tu conexión de video...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mx-6 md:-mx-12 -mt-6 md:-mt-12">
      {/* Header con controles de grabación */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
            En vivo
          </span>
        </div>
        {id && <RecordingControls roomId={id} />}
      </div>

      {/* Video Custom UI */}
      <div className="flex-1 bg-black">
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          video={true}
          audio={true}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          data-lk-theme="default"
          style={{ height: '100%' }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    </div>
  )
}

