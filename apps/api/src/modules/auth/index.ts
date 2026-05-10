import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { loginBody, signupBody } from '@zoom-out/validators'
import { db } from '@api/lib/db'
import { verifyPassword, hashPassword, signJwt } from '@api/lib/auth'
import { users } from '@db/schema'

// ──────────────────────────────────────────────
// Módulo de Autenticación — Rutas públicas (sin guard)
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
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      }
    },
    { body: loginBody },
  )
  .post(
    '/signup',
    async ({ body, set }) => {
      // Verificar si el usuario ya existe
      const [existingUser] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
      if (existingUser) {
        set.status = 409
        return { code: 'CONFLICT', message: 'User already exists' }
      }

      const passwordHash = await hashPassword(body.password)
      
      const [user] = await db.insert(users).values({
        email: body.email,
        passwordHash,
        displayName: body.displayName,
        role: 'viewer' // Por defecto rol viewer
      }).returning()

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
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      }
    },
    { body: signupBody }
  )
