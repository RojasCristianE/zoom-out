import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { requireRole } from '@/middleware/requireRole'
import { db } from '@/lib/db'
import { users } from '@db/schema'
import type { UserRole } from '@zoom-out/shared-types'
import { signupBody } from '@zoom-out/validators'
import { hashPassword } from '@/lib/auth'

// ──────────────────────────────────────────────
// Users Module — Admin-only management
// ──────────────────────────────────────────────

export const usersModule = new Elysia({ prefix: '/users' })
  .use(requireRole('admin'))

  // Create new user (Admin only)
  .post(
    '/',
    async ({ body, set }) => {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, body.email))
        .limit(1)

      if (existing) {
        set.status = 409
        return { code: 'CONFLICT', message: 'Email already registered' }
      }

      const passwordHash = await hashPassword(body.password)
      const [user] = await db
        .insert(users)
        .values({
          email: body.email,
          passwordHash,
          displayName: body.displayName,
          role: body.role as UserRole || 'viewer',
        })
        .returning()

      return {
        data: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        }
      }
    },
    { body: t.Intersect([signupBody, t.Object({ role: t.Optional(t.String()) })]) }
  )

  // List all users
  .get('/', async () => {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt)

    return { data: allUsers }
  })

  // Update a user's role
  .patch(
    '/:id/role',
    async ({ params, body, set }) => {
      const [user] = await db.select().from(users).where(eq(users.id, params.id)).limit(1)

      if (!user) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'User not found' }
      }

      const [updated] = await db
        .update(users)
        .set({ role: body.role as UserRole, updatedAt: new Date() })
        .where(eq(users.id, params.id))
        .returning({
          id: users.id,
          email: users.email,
          displayName: users.displayName,
          role: users.role,
        })

      return updated
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        role: t.Union([t.Literal('admin'), t.Literal('host'), t.Literal('viewer')]),
      }),
    },
  )
