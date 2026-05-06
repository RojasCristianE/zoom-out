import { t } from 'elysia'

// ──────────────────────────────────────────────
// Recording Schemas
// ──────────────────────────────────────────────

export const recordingIdParam = t.Object({
  id: t.String({ minLength: 1 }),
})

export const startRecordingBody = t.Object({
  roomId: t.String({ minLength: 1 }),
  audioOnly: t.Optional(t.Boolean({ default: false })),
})

export const listRecordingsQuery = t.Object({
  roomId: t.Optional(t.String()),
  page: t.Optional(t.Number({ minimum: 1, default: 1 })),
  pageSize: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 20 })),
})
