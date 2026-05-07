import { t } from 'elysia'

// ──────────────────────────────────────────────
// User Schemas
// ──────────────────────────────────────────────

export const UserRoleSchema = t.Union([
  t.Literal('admin'),
  t.Literal('host'),
  t.Literal('viewer'),
])

export const updateUserRoleBody = t.Object({
  role: UserRoleSchema,
})

export const userIdParam = t.Object({
  id: t.String({ minLength: 1 }),
})
