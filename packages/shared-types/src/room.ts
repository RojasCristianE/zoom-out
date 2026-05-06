// ──────────────────────────────────────────────
// Room Types
// ──────────────────────────────────────────────

export type RoomStatus = 'waiting' | 'active' | 'ended'

export interface RoomConfig {
  id: string
  name: string
  status: RoomStatus
  maxParticipants: number
  createdBy: string
  scheduledAt?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
  updatedAt: string
}

export interface RoomParticipant {
  userId: string
  displayName: string
  joinedAt: string
  isPublishing: boolean
}

export interface RoomWithParticipants extends RoomConfig {
  participants: RoomParticipant[]
}
