import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LiveKitRoom, PreJoin } from '@livekit/components-react'
import type { LocalUserChoices } from '@livekit/components-react'
import { api } from '@web/api/client'
import { useRoomStore } from '@web/store/room'
import RoomLayout from '@web/components/video/RoomLayout'
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

  // PreJoin → usuario confirma dispositivos antes de conectar
  const [preJoinDone, setPreJoinDone] = useState(false)
  const [userChoices, setUserChoices] = useState<LocalUserChoices | null>(null)

  // Obtener token al montar
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

  const handlePreJoinSubmit = useCallback((choices: LocalUserChoices) => {
    setUserChoices(choices)
    setPreJoinDone(true)
  }, [])

  const handlePreJoinError = useCallback((err: Error) => {
    console.warn('⚠️ PreJoin error (permisos de dispositivo):', err.message)
    // No bloquear — permitir unirse sin cámara/micrófono
  }, [])

  const handleDisconnected = useCallback(() => {
    // Solo navegar si ya estaba conectado (desconexión voluntaria)
    // Si nunca conectó → es error de conexión, mostrar estado error
    if (connectionState === 'connected') {
      reset()
      navigate('/')
    } else {
      setError('No se pudo establecer la conexión con la sala')
    }
  }, [connectionState, reset, navigate, setError])

  const handleConnected = useCallback(() => {
    setConnected()
  }, [setConnected])

  // ── Estado: Error ──
  if (connectionState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="h-16 w-16 rounded-full border-4 border-destructive/30 flex items-center justify-center bg-destructive/10">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-destructive">Error de conexión</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              reset()
              setPreJoinDone(false)
              setUserChoices(null)
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  // ── Estado: Obteniendo token ──
  if (!token || !roomName) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-16 w-16 rounded-full border-2 border-border animate-spin border-t-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Conectando a la sala...</p>
      </div>
    )
  }

  // ── Estado: PreJoin — usuario selecciona dispositivos ──
  if (!preJoinDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Configurar dispositivos</h2>
        <p className="text-sm text-muted-foreground mb-2">
          Selecciona tu cámara y micrófono antes de unirte
        </p>
        <div className="w-full max-w-lg">
          <PreJoin
            onSubmit={handlePreJoinSubmit}
            onError={handlePreJoinError}
            defaults={{
              videoEnabled: true,
              audioEnabled: true,
            }}
            joinLabel="Unirse a la sala"
            micLabel="Micrófono"
            camLabel="Cámara"
            userLabel="Nombre"
            data-lk-theme="default"
          />
        </div>
      </div>
    )
  }

  // ── Estado: Conectado a LiveKit ──
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
          video={userChoices?.videoEnabled ?? false}
          audio={userChoices?.audioEnabled ?? false}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          data-lk-theme="default"
          style={{ height: '100%' }}
        >
          <RoomLayout />
        </LiveKitRoom>
      </div>
    </div>
  )
}
