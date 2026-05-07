import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { createRoomBody, roomIdParam } from '@zoom-out/validators'
import { requireRole } from '@api/middleware/requireRole'
import { db } from '@api/lib/db'
import { createLivekitToken } from '@api/lib/livekit'
import { rooms } from '@db/schema'

// ──────────────────────────────────────────────
// Módulo de Salas — Rutas protegidas
// ──────────────────────────────────────────────

export const roomsModule = new Elysia({ prefix: '/rooms' })
  .use(requireRole('admin', 'host', 'viewer'))

  // Listar todas las salas
  .get('/', async () => {
    const allRooms = await db.select().from(rooms).orderBy(rooms.createdAt)
    return { data: allRooms }
  })

  // Crear una sala (usa el usuario del guard)
  .post(
    '/',
    async ({ body, user }) => {
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

  // Unirse a una sala — devuelve un token de LiveKit
  .post(
    '/:id/join',
    async ({ params, user, set }) => {
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
