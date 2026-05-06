import { t } from 'elysia'

// ──────────────────────────────────────────────
// Auth Schemas
// ──────────────────────────────────────────────

export const loginBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
})

export const signupBody = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
  displayName: t.String({ minLength: 1, maxLength: 100 }),
})

export const refreshBody = t.Object({
  refreshToken: t.String(),
})
