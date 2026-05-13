import {
  AccessToken,
  RoomServiceClient,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  EncodingOptionsPreset,
  S3Upload,
  WebhookReceiver,
} from 'livekit-server-sdk'
import { env } from './env'

// ──────────────────────────────────────────────
// LiveKit Server Integration
// ──────────────────────────────────────────────

const livekitHost = env.LIVEKIT_URL.replace('ws://', 'http://').replace('wss://', 'https://')

// ──── Clientes ────

export const roomService = new RoomServiceClient(
  livekitHost,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
)

export const egressClient = new EgressClient(
  livekitHost,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
)

export const webhookReceiver = new WebhookReceiver(
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
)

// ──── Tokens ────

/**
 * Genera un JWT access token para que un participante se una a una sala LiveKit.
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

// ──── Room Management ────

/**
 * Crea una sala en el servidor LiveKit.
 */
export async function createLivekitRoom(
  name: string,
  options?: { maxParticipants?: number; emptyTimeout?: number },
) {
  return await roomService.createRoom({
    name,
    maxParticipants: options?.maxParticipants ?? 10,
    emptyTimeout: options?.emptyTimeout ?? 300,
  })
}

/**
 * Elimina una sala del servidor LiveKit.
 */
export async function deleteLivekitRoom(name: string) {
  return await roomService.deleteRoom(name)
}

/**
 * Lista los participantes activos de una sala LiveKit.
 */
export async function listLivekitParticipants(roomName: string) {
  return await roomService.listParticipants(roomName)
}

// ──── Egress (Grabación) ────

/**
 * Inicia la grabación compuesta de una sala (video + audio) y sube a MinIO.
 * Retorna el EgressInfo con el egressId.
 */
export async function startRoomRecording(roomName: string, filepath: string) {
  const s3Output = new S3Upload({
    accessKey: env.MINIO_ACCESS_KEY,
    secret: env.MINIO_SECRET_KEY,
    // Egress corre dentro de Docker: usar hostname interno del servicio MinIO
    endpoint: `http://${env.MINIO_INTERNAL_ENDPOINT}:${env.MINIO_PORT}`,
    bucket: env.MINIO_BUCKET_RECORDINGS,
    forcePathStyle: true,
  })

  const fileOutput = new EncodedFileOutput({
    fileType: EncodedFileType.MP4,
    filepath,
    output: { case: 's3', value: s3Output },
  })

  return await egressClient.startRoomCompositeEgress(roomName, {
    file: fileOutput,
  }, {
    layout: 'speaker-dark',
    encodingOptions: EncodingOptionsPreset.H264_720P_30,
  })
}

/**
 * Detiene una grabación activa por su egressId.
 */
export async function stopRecording(egressId: string) {
  return await egressClient.stopEgress(egressId)
}
