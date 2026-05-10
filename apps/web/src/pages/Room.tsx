import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LiveKitRoom, VideoConference } from '@livekit/components-react'
import { api } from '@web/api/client'
import { useRoomStore } from '@web/store/room'
import RecordingControls from '@web/components/video/RecordingControls'
import '@livekit/components-styles'

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || (
  window.location.hostname === 'localhost'
    ? 'ws://localhost:7880'
    : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:7880`
)

export default function Room() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { connectionState, token, roomName, error, setConnection, setConnected, setError, reset } =
    useRoomStore()

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
    return () => reset()
  }, [id, setConnection, setError, reset])

  const handleDisconnected = useCallback(() => {
    reset()
    navigate('/')
  }, [reset, navigate])

  const handleConnected = useCallback(() => {
    setConnected()
  }, [setConnected])

  if (connectionState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <h2 className="text-xl font-bold text-error">Error de conexión</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button type="button" onClick={() => navigate('/')} className="px-4 py-2 bg-muted rounded-md">Volver</button>
      </div>
    )
  }

  if (!token || !roomName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-16 w-16 rounded-full border-2 border-border animate-spin border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Conectando a la sala...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40">
        <span className="text-xs uppercase">En vivo</span>
        {id && <RecordingControls roomId={id} />}
      </div>
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
