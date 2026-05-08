import { Elysia } from 'elysia'
import { eq } from 'drizzle-orm'
import { createRoomBody, roomIdParam } from '@zoom-out/validators'
import { requireRole } from '@api/middleware/requireRole'
import { db } from '@api/lib/db'
import {
  createLivekitToken,
  createLivekitRoom,
  deleteLivekitRoom,
  listLivekitParticipants,
} from '@api/lib/livekit'
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

  // Iniciar una sala — transición waiting → active
  .post(
    '/:id/start',
    async ({ params, set }) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, params.id)).limit(1)

      if (!room) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Sala no encontrada' }
      }

      if (room.status !== 'waiting') {
        set.status = 400
        return {
          code: 'VALIDATION_ERROR',
          message: `No se puede iniciar una sala en estado '${room.status}'. Solo salas en 'waiting' pueden iniciar.`,
        }
      }

      if (!room.livekitRoomName) {
        set.status = 500
        return { code: 'INTERNAL_ERROR', message: 'La sala no tiene mapeo a LiveKit' }
      }

      // Crear la sala en LiveKit
      await createLivekitRoom(room.livekitRoomName, {
        maxParticipants: room.maxParticipants,
      })

      // Actualizar estado en DB
      const [updated] = await db
        .update(rooms)
        .set({
          status: 'active',
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(rooms.id, params.id))
        .returning()

      console.log(`🟢 Sala iniciada: ${room.name} (${room.livekitRoomName})`)
      return updated
    },
    { params: roomIdParam },
  )

  // Finalizar una sala — transición active → ended
  .post(
    '/:id/end',
    async ({ params, set }) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, params.id)).limit(1)

      if (!room) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Sala no encontrada' }
      }

      if (room.status !== 'active') {
        set.status = 400
        return {
          code: 'VALIDATION_ERROR',
          message: `No se puede finalizar una sala en estado '${room.status}'. Solo salas en 'active' pueden finalizar.`,
        }
      }

      // Eliminar la sala de LiveKit (desconecta a todos los participantes)
      if (room.livekitRoomName) {
        try {
          await deleteLivekitRoom(room.livekitRoomName)
        } catch (err) {
          // La sala puede ya no existir en LiveKit si timeout expiró
          console.warn(`⚠️ No se pudo eliminar sala LiveKit: ${err}`)
        }
      }

      // Actualizar estado en DB
      const [updated] = await db
        .update(rooms)
        .set({
          status: 'ended',
          endedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(rooms.id, params.id))
        .returning()

      console.log(`🔴 Sala finalizada: ${room.name}`)
      return updated
    },
    { params: roomIdParam },
  )

  // Obtener participantes activos de una sala
  .get(
    '/:id/participants',
    async ({ params, set }) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, params.id)).limit(1)

      if (!room) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Sala no encontrada' }
      }

      if (room.status !== 'active' || !room.livekitRoomName) {
        return { data: [] }
      }

      try {
        const participants = await listLivekitParticipants(room.livekitRoomName)
        const mapped = participants.map((p) => ({
          identity: p.identity,
          name: p.name,
          joinedAt: p.joinedAt ? new Date(Number(p.joinedAt) * 1000).toISOString() : null,
          isPublishing: (p.tracks?.length ?? 0) > 0,
        }))
        return { data: mapped }
      } catch {
        // Sala puede no existir aún en LiveKit
        return { data: [] }
      }
    },
    { params: roomIdParam },
  )

  // Unirse a una sala — devuelve un token de LiveKit
  .post(
    '/:id/join',
    async ({ params, user, set }) => {
      const [room] = await db.select().from(rooms).where(eq(rooms.id, params.id)).limit(1)

      if (!room) {
        set.status = 404
        return { code: 'NOT_FOUND', message: 'Sala no encontrada' }
      }

      if (room.status !== 'active') {
        set.status = 400
        return {
          code: 'VALIDATION_ERROR',
          message: 'Solo puedes unirte a salas activas',
        }
      }

      if (!room.livekitRoomName) {
        set.status = 500
        return { code: 'INTERNAL_ERROR', message: 'La sala no tiene mapeo a LiveKit' }
      }

      const token = await createLivekitToken(room.livekitRoomName, user.sub, {
        canPublish: user.role !== 'viewer',
        canSubscribe: true,
      })

      return { token, roomName: room.livekitRoomName }
    },
    { params: roomIdParam },
  )
