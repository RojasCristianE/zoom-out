import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import { marcadores } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import { CrearMarcadorSchema } from '@zoom-out/validators';

export const marcadoresRoutes = new Elysia({ prefix: '/marcadores' })
  .use(authPlugin)
  .post(
    '/',
    async ({ body, usuario }) => {
      const [marcador] = await db
        .insert(marcadores)
        .values({
          ...body,
          creadoPorId: usuario!.sub,
        })
        .returning();

      return marcador;
    },
    {
      body: CrearMarcadorSchema,
      requiereRol: ['admin', 'juez', 'secretario', 'operador'],
    },
  )
  .delete(
    '/:id',
    async ({ params: { id } }) => {
      await db.delete(marcadores).where(eq(marcadores.id, id));
      return { success: true };
    },
    {
      requiereRol: ['admin', 'secretario', 'operador'],
    },
  );
