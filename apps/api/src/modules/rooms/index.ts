import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { createRoomBody, roomIdParam } from '@zoom-out/validators'
import { requireRole } from '@/middleware/requireRole'
import { db } from '@/lib/db'
import { createLivekitToken } from '@/lib/livekit'
import { rooms } from '@db/schema'

// ──────────────────────────────────────────────
// Rooms Module — Protected routes
// ──────────────────────────────────────────────

export const roomsModule = new Elysia({ prefix: '/rooms' })
  .use(requireRole('admin', 'host', 'viewer'))

  // List all rooms
  .get('/', async () => {
    const allRooms = await db.select().from(rooms).orderBy(rooms.createdAt)
    return { data: allRooms }
  })

  // Create a room (uses user from guard)
  .post(
    '/',
    async ({ body, user }: any) => {
      const livekitRoomName = `room-${crypto.randomUUID().slice(0, 8)}`

      const [room] = await db
        .insert(rooms)
        .values({
          name: body.name,
          maxParticipants: body.maxParticipants ?? 10,
          scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
          createdBy: user.sub,
          livekitRoomName,
        })
        .returning()

      return room
    },
    { body: createRoomBody },
  )

  // Join a room — returns a LiveKit token
  .post(
    '/:id/join',
    async ({ params, user, set }: any) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, params.id)).limit(1)

      if (!room) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Room not found' }
      }

      if (!room.livekitRoomName) {
        set.status = 500
        return { code: 'INTERNAL_ERROR', message: 'Room has no LiveKit mapping' }
      }

      const token = await createLivekitToken(room.livekitRoomName, user.sub, {
        canPublish: user.role !== 'viewer',
        canSubscribe: true,
      })

      return { token, roomName: room.livekitRoomName }
    },
    { params: roomIdParam },
  )
