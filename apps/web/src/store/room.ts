import { create } from 'zustand'

// ──────────────────────────────────────────────
// Estado de Sala — Zustand Store
// ──────────────────────────────────────────────

interface RoomState {
  // Conexión
  connectionState: 'idle' | 'loading' | 'connected' | 'error'
  token: string | null
  roomName: string | null
  error: string | null

  // Grabación
  isRecording: boolean
  currentRecordingId: string | null

  // Acciones
  setConnection: (token: string, roomName: string) => void
  setConnected: () => void
  setError: (error: string) => void
  setRecording: (isRecording: boolean, recordingId?: string | null) => void
  reset: () => void
}

const initialState = {
  connectionState: 'idle' as const,
  token: null,
  roomName: null,
  error: null,
  isRecording: false,
  currentRecordingId: null,
}

export const useRoomStore = create<RoomState>()((set) => ({
  ...initialState,

  setConnection: (token, roomName) =>
    set({ token, roomName, connectionState: 'loading', error: null }),

  setConnected: () =>
    set({ connectionState: 'connected' }),

  setError: (error) =>
    set({ connectionState: 'error', error }),

  setRecording: (isRecording, recordingId = null) =>
    set({ isRecording, currentRecordingId: recordingId }),

  reset: () => set(initialState),
}))
