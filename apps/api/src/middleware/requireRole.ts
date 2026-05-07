import { Elysia } from 'elysia'
import { verifyJwt } from '@api/lib/auth'
import type { UserRole, AuthTokenPayload } from '@zoom-out/shared-types'

// ──────────────────────────────────────────────
// Role-Based Access Guard
// ──────────────────────────────────────────────

/**
 * Middleware that extracts and verifies the JWT from the Authorization header,
 * then checks if the user has one of the allowed roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) => (app: Elysia) =>
  app.derive(
    async ({ headers, set }) => {
      const authHeader = headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        throw new Error('Missing or invalid token')
      }

      const token = authHeader.slice(7)
      const payload = await verifyJwt<AuthTokenPayload>(token)

      if (!payload) {
        set.status = 401
        throw new Error('Invalid or expired token')
      }

      if (!allowedRoles.includes(payload.role)) {
        set.status = 403
        throw new Error(
          `Role '${payload.role}' is not authorized. Required: ${allowedRoles.join(', ')}`,
        )
      }

      return { user: payload }
    },
  )
