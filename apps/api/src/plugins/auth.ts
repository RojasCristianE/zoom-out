import { Elysia } from 'elysia';
import { verifyJwt } from '../lib/auth';
import type { AuthTokenPayload, RolUsuario } from '@zoom-out/shared-types';

export const authPlugin = new Elysia({ name: 'plugin.auth' })
  .derive({ as: 'scoped' }, async ({ request, set }) => {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { usuario: null };
    }

    const token = authHeader.slice(7);
    const payload = await verifyJwt<AuthTokenPayload>(token);
    if (!payload) {
      set.status = 401;
      return { usuario: null };
    }

    return { usuario: payload };
  })
  .macro(({ onBeforeHandle }) => ({
    requiereAuth(requerido: boolean) {
      if (!requerido) return;
      onBeforeHandle((context: any) => {
        if (!context.usuario) {
          context.set.status = 401;
          throw new Error('No autorizado: sesión requerida');
        }
      });
    },
    requiereRol(rolesPermitidos: RolUsuario[]) {
      onBeforeHandle((context: any) => {
        if (!context.usuario) {
          context.set.status = 401;
          throw new Error('No autorizado: sesión requerida');
        }
        if (!rolesPermitidos.includes(context.usuario.role)) {
          context.set.status = 403;
          throw new Error(`Acceso denegado: rol ${context.usuario.role} no autorizado`);
        }
      });
    },
  }));
