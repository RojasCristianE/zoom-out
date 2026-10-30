import { Elysia, t } from 'elysia';
import { db } from '../../lib/db';
import { expedientes, partesProcesales, audiencias } from '../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import { CrearExpedienteSchema, AgregarParteSchema } from '@zoom-out/validators';

export const expedientesRoutes = new Elysia({ prefix: '/expedientes' })
  .use(authPlugin)
  .get(
    '/',
    async ({ query }) => {
      let queryBuilder = db.select().from(expedientes).$dynamic();
      if (query.organoJudicialId) {
        queryBuilder = queryBuilder.where(
          eq(expedientes.organoJudicialId, query.organoJudicialId as string),
        );
      }
      return await queryBuilder.orderBy(desc(expedientes.createdAt)).limit(50);
    },
    { requiereAuth: true },
  )
  .get(
    '/:id',
    async ({ params: { id }, set }) => {
      const exp = await db.select().from(expedientes).where(eq(expedientes.id, id)).limit(1);
      if (!exp[0]) {
        set.status = 404;
        return { error: 'Expediente no encontrado' };
      }

      const partes = await db
        .select()
        .from(partesProcesales)
        .where(eq(partesProcesales.expedienteId, id));

      const listaAudiencias = await db
        .select()
        .from(audiencias)
        .where(eq(audiencias.expedienteId, id))
        .orderBy(desc(audiencias.fechaProgramada));

      return {
        ...exp[0],
        partes,
        audiencias: listaAudiencias,
      };
    },
    { requiereAuth: true },
  )
  .post(
    '/',
    async ({ body, set }) => {
      const existe = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.numero, body.numero))
        .limit(1);

      if (existe[0]) {
        set.status = 409;
        return { error: 'El número de expediente ya está registrado' };
      }

      const [creado] = await db.insert(expedientes).values(body).returning();
      return creado;
    },
    {
      body: CrearExpedienteSchema,
      requiereRol: ['admin', 'secretario', 'operador'],
    },
  )
  .post(
    '/:id/partes',
    async ({ params: { id }, body }) => {
      const [parte] = await db
        .insert(partesProcesales)
        .values({
          ...body,
          expedienteId: id,
        })
        .returning();
      return parte;
    },
    {
      body: AgregarParteSchema,
      requiereRol: ['admin', 'secretario', 'operador'],
    },
  );
