import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import { audiencias, salas, expedientes, tiposAudiencia, users } from '../../../drizzle/schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import { ProgramarAudienciaSchema } from '@zoom-out/validators';

export const agendaRoutes = new Elysia({ prefix: '/agenda' })
  .use(authPlugin)
  .get(
    '/',
    async ({ query }) => {
      const fecha = (query.fecha as string) || new Date().toISOString().split('T')[0];
      const salaId = query.salaId as string | undefined;

      const condiciones = [eq(audiencias.fechaProgramada, fecha)];
      if (salaId) {
        condiciones.push(eq(audiencias.salaId, salaId));
      }

      return await db
        .select({
          audiencia: audiencias,
          expediente: expedientes,
          sala: salas,
          tipo: tiposAudiencia,
          juez: {
            id: users.id,
            displayName: users.displayName,
          },
        })
        .from(audiencias)
        .innerJoin(expedientes, eq(audiencias.expedienteId, expedientes.id))
        .innerJoin(salas, eq(audiencias.salaId, salas.id))
        .innerJoin(tiposAudiencia, eq(audiencias.tipoAudienciaId, tiposAudiencia.id))
        .innerJoin(users, eq(audiencias.juezId, users.id))
        .where(and(...condiciones))
        .orderBy(audiencias.horaInicioEstimada);
    },
    { requiereAuth: true },
  )
  .post(
    '/',
    async ({ body, set }) => {
      // 1. Validar conflicto de horario en la sala solicitada
      const conflicto = await db
        .select()
        .from(audiencias)
        .where(
          and(
            eq(audiencias.salaId, body.salaId),
            eq(audiencias.fechaProgramada, body.fechaProgramada),
            sql`"estado" IN ('programada', 'en_curso', 'en_pausa')`,
            sql`tsrange(
              (${body.fechaProgramada} || ' ' || ${body.horaInicioEstimada})::timestamp,
              (${body.fechaProgramada} || ' ' || ${body.horaFinEstimada})::timestamp,
              '[)'
            ) && tsrange(
              ("fecha_programada"::text || ' ' || "hora_inicio_estimada"::text)::timestamp,
              ("fecha_programada"::text || ' ' || "hora_fin_estimada"::text)::timestamp,
              '[)'
            )`,
          ),
        )
        .limit(1);

      if (conflicto[0]) {
        set.status = 409;
        return {
          error: 'Conflicto de agenda: La sala ya está ocupada en ese rango horario',
          audienciaConflictoId: conflicto[0].id,
        };
      }

      // 2. Generar nombre de sala LiveKit único
      const [exp] = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.id, body.expedienteId))
        .limit(1);

      const numExpLimpio = (exp?.numero || 'exp').replace(/[^a-zA-Z0-9]/g, '_');
      const livekitRoomName = `aud_${numExpLimpio}_${Date.now().toString(36)}`;

      const [audiencia] = await db
        .insert(audiencias)
        .values({
          ...body,
          livekitRoomName,
        })
        .returning();

      return audiencia;
    },
    {
      body: ProgramarAudienciaSchema,
      requiereRol: ['admin', 'juez', 'secretario', 'operador'],
    },
  );
