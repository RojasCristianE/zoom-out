import { AccessToken, RoomServiceClient } from 'livekit-server-sdk'
import { env } from './env'

// ──────────────────────────────────────────────
// LiveKit Server Integration
// ──────────────────────────────────────────────

const livekitHost = env.LIVEKIT_URL.replace('ws://', 'http://').replace('wss://', 'https://')

export const roomService = new RoomServiceClient(
  livekitHost,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
)

/**
 * Generate a JWT access token for a participant to join a LiveKit room.
 */
export async function createLivekitToken(
  roomName: string,
  participantIdentity: string,
  options?: {
    canPublish?: boolean
    canSubscribe?: boolean
    canPublishData?: boolean
  },
): Promise<string> {
  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: participantIdentity,
  })

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: options?.canPublish ?? true,
    canSubscribe: options?.canSubscribe ?? true,
    canPublishData: options?.canPublishData ?? true,
  })

  return await at.toJwt()
}
