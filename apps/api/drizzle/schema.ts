import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
  pgEnum,
} from 'drizzle-orm/pg-core'

// ──────────────────────────────────────────────
// Enums
// ──────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'host', 'viewer'])
export const roomStatusEnum = pgEnum('room_status', ['waiting', 'active', 'ended'])
export const recordingStatusEnum = pgEnum('recording_status', [
  'recording',
  'processing',
  'ready',
  'failed',
])

// ──────────────────────────────────────────────
// Users
// ──────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: userRoleEnum('role').notNull().default('viewer'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ──────────────────────────────────────────────
// Rooms
// ──────────────────────────────────────────────

export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  status: roomStatusEnum('status').notNull().default('waiting'),
  maxParticipants: integer('max_participants').notNull().default(10),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  livekitRoomName: text('livekit_room_name').unique(),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ──────────────────────────────────────────────
// Recordings
// ──────────────────────────────────────────────

export const recordings = pgTable('recordings', {
  id: uuid('id').primaryKey().defaultRandom(),
  roomId: uuid('room_id')
    .notNull()
    .references(() => rooms.id),
  status: recordingStatusEnum('status').notNull().default('recording'),
  egressId: text('egress_id'), // LiveKit Egress ID
  videoKey: text('video_key'), // MinIO object key
  audioKey: text('audio_key'),
  transcriptionKey: text('transcription_key'),
  durationSeconds: integer('duration_seconds'),
  fileSizeBytes: integer('file_size_bytes'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ──────────────────────────────────────────────
// Refresh Tokens
// ──────────────────────────────────────────────

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked: boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
