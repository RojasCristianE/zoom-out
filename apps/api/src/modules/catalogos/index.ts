import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import { organosJudiciales, salas, materias, tiposAudiencia } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';

export const catalogosRoutes = new Elysia({ prefix: '/catalogos' })
  .use(authPlugin)
  .get(
    '/organos',
    async () => {
      return await db.select().from(organosJudiciales).where(eq(organosJudiciales.activo, true));
    },
    { requiereAuth: true },
  )
  .get(
    '/salas',
    async ({ query }) => {
      if (query.organoJudicialId) {
        return await db
          .select()
          .from(salas)
          .where(eq(salas.organoJudicialId, query.organoJudicialId as string));
      }
      return await db.select().from(salas).where(eq(salas.activa, true));
    },
    { requiereAuth: true },
  )
  .get(
    '/materias',
    async () => {
      return await db.select().from(materias);
    },
    { requiereAuth: true },
  )
  .get(
    '/tipos-audiencia',
    async ({ query }) => {
      if (query.materiaId) {
        return await db
          .select()
          .from(tiposAudiencia)
          .where(eq(tiposAudiencia.materiaId, query.materiaId as string));
      }
      return await db.select().from(tiposAudiencia);
    },
    { requiereAuth: true },
  );
