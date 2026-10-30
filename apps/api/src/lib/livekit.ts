import {
  AccessToken,
  RoomServiceClient,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  AudioCodec,
  S3Upload,
  WebhookReceiver,
  TrackSource,
} from 'livekit-server-sdk';
import { env } from './env';

// ──────────────────────────────────────────────
// LiveKit Server Integration — Audio Judicial Exclusivo
// ──────────────────────────────────────────────

const livekitHost = env.LIVEKIT_URL.replace('ws://', 'http://').replace('wss://', 'https://');

export const roomService = new RoomServiceClient(
  livekitHost,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
);

export const egressClient = new EgressClient(
  livekitHost,
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
);

export const webhookReceiver = new WebhookReceiver(
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
);

/**
 * Token de LiveKit restringido estrictamente a audio (micrófono). Cero cámara ni screen share.
 */
export async function crearTokenLivekitAudio(
  roomName: string,
  participantIdentity: string,
  participantName: string,
  options?: {
    canPublish?: boolean;
    canSubscribe?: boolean;
    metadata?: Record<string, unknown>;
  },
): Promise<string> {
  const at = new AccessToken(env.LIVEKIT_API_KEY, env.LIVEKIT_API_SECRET, {
    identity: participantIdentity,
    name: participantName,
    metadata: options?.metadata ? JSON.stringify(options.metadata) : undefined,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: options?.canPublish ?? true,
    canSubscribe: options?.canSubscribe ?? true,
    canPublishData: true,
    canPublishSources: [TrackSource.MICROPHONE],
  });

  return await at.toJwt();
}

/**
 * Inicia grabación compuesta de audio exclusiva en OGG / Opus hacia MinIO.
 */
export async function iniciarEgressAudio(roomName: string, s3Filepath: string) {
  const s3Output = new S3Upload({
    accessKey: env.MINIO_ACCESS_KEY,
    secret: env.MINIO_SECRET_KEY,
    endpoint: `http://${env.MINIO_INTERNAL_ENDPOINT}:${env.MINIO_PORT}`,
    bucket: env.MINIO_BUCKET_AUDIENCIAS,
    forcePathStyle: true,
  });

  const fileOutput = new EncodedFileOutput({
    fileType: EncodedFileType.OGG,
    filepath: s3Filepath,
    output: { case: 's3', value: s3Output },
  });

  return await egressClient.startRoomCompositeEgress(
    roomName,
    {
      file: fileOutput,
    },
    {
      audioOnly: true,
      customBaseUrl: undefined,
    },
  );
}

export async function detenerEgress(egressId: string) {
  return await egressClient.stopEgress(egressId);
}
