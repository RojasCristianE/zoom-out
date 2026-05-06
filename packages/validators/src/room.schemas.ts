import { t } from 'elysia'

// ──────────────────────────────────────────────
// Room Schemas
// ──────────────────────────────────────────────

export const createRoomBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  maxParticipants: t.Optional(t.Number({ minimum: 2, maximum: 50, default: 10 })),
  scheduledAt: t.Optional(t.String({ format: 'date-time' })),
})

export const roomIdParam = t.Object({
  id: t.String({ minLength: 1 }),
})

export const updateRoomBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
  maxParticipants: t.Optional(t.Number({ minimum: 2, maximum: 50 })),
  scheduledAt: t.Optional(t.String({ format: 'date-time' })),
})
