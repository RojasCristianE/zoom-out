import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import { reportesDiarios, organosJudiciales, salas, audiencias } from '../../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import { getPresignedUrl } from '../../lib/minio';
import { env } from '../../lib/env';

export const reportesRoutes = new Elysia({ prefix: '/reportes' })
  .use(authPlugin)
  .get(
    '/diario',
    async ({ query }) => {
      const fecha = (query.fecha as string) || new Date().toISOString().split('T')[0];
      const organoId = query.organoJudicialId as string | undefined;

      const condiciones = [eq(reportesDiarios.fecha, fecha)];
      if (organoId) {
        condiciones.push(eq(reportesDiarios.organoJudicialId, organoId));
      }

      const reportes = await db
        .select()
        .from(reportesDiarios)
        .where(and(...condiciones));

      return reportes;
    },
    { requiereAuth: true },
  )
  .post(
    '/diario/generar',
    async ({ body, set }) => {
      const { organoJudicialId, fecha } = body as {
        organoJudicialId: string;
        fecha: string;
      };

      // Calcular métricas agregadas de audiencias del día
      const stats = await db
        .select({
          total: sql<number>`count(*)`,
          realizadas: sql<number>`count(*) filter (where ${audiencias.estado} = 'finalizada')`,
          suspendidas: sql<number>`count(*) filter (where ${audiencias.estado} in ('en_pausa', 'reprogramada'))`,
          canceladas: sql<number>`count(*) filter (where ${audiencias.estado} = 'cancelada')`,
          duracionTotalSegundos: sql<number>`coalesce(sum(${audiencias.duracionSegundos}), 0)`,
        })
        .from(audiencias)
        .where(eq(audiencias.fechaProgramada, fecha));

      const resumen = stats[0] || {
        total: 0,
        realizadas: 0,
        suspendidas: 0,
        canceladas: 0,
        duracionTotalSegundos: 0,
      };

      const [reporte] = await db
        .insert(reportesDiarios)
        .values({
          organoJudicialId,
          fecha,
          totalAudiencias: Number(resumen.total),
          audienciasRealizadas: Number(resumen.realizadas),
          audienciasSuspendidas: Number(resumen.suspendidas),
          audienciasCanceladas: Number(resumen.canceladas),
          duracionTotalMinutos: Math.round(Number(resumen.duracionTotalSegundos) / 60),
          metricasJson: resumen,
          sintesisLlm: `Reporte diario consolidado de sala para el ${fecha}. Actividad global procesada.`,
        })
        .returning();

      return reporte;
    },
    {
      requiereRol: ['admin', 'secretario'],
    },
  );
