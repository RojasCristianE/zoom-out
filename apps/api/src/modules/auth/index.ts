import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { loginBody } from '@zoom-out/validators'
import { db } from '@/lib/db'
import { verifyPassword, signJwt } from '@/lib/auth'
import { users } from '@db/schema'

// ──────────────────────────────────────────────
// Auth Module — Public routes (no guard)
// ──────────────────────────────────────────────

export const authModule = new Elysia({ prefix: '/auth' })
  .post(
    '/login',
    async ({ body, set }) => {
      const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)

      if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
        set.status = 401
        return { code: 'UNAUTHORIZED', message: 'Invalid email or password' }
      }

      const accessToken = await signJwt(
        { sub: user.id, email: user.email, role: user.role },
        3600,
      )

      return {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      }
    },
    { body: loginBody },
  )
