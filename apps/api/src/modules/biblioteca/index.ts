import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import {
  audiencias,
  expedientes,
  salas,
  materias,
  organosJudiciales,
  grabaciones,
  transcripcionSegmentos,
  transcripciones,
} from '../../../drizzle/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import { BusquedaAudienciasQuerySchema } from '@zoom-out/validators';

export const bibliotecaRoutes = new Elysia({ prefix: '/biblioteca' })
  .use(authPlugin)
  // Árbol jerárquico por caso o cronológico
  .get(
    '/arbol',
    async ({ query }) => {
      const modo = (query.modo as string) || 'caso'; // 'caso' | 'cronologico'

      if (modo === 'caso') {
        const registros = await db
          .select({
            organoId: organosJudiciales.id,
            organoNombre: organosJudiciales.nombre,
            organoCodigo: organosJudiciales.codigo,
            materiaId: materias.id,
            materiaNombre: materias.nombre,
            materiaCodigo: materias.codigo,
            anio: expedientes.anio,
            expedienteId: expedientes.id,
            expedienteNumero: expedientes.numero,
            expedienteAsunto: expedientes.asunto,
            audienciaId: audiencias.id,
            audienciaFecha: audiencias.fechaProgramada,
            audienciaHora: audiencias.horaInicioEstimada,
            audienciaEstado: audiencias.estado,
          })
          .from(organosJudiciales)
          .innerJoin(expedientes, eq(organosJudiciales.id, expedientes.organoJudicialId))
          .innerJoin(materias, eq(expedientes.materiaId, materias.id))
          .innerJoin(audiencias, eq(expedientes.id, audiencias.expedienteId))
          .orderBy(
            organosJudiciales.nombre,
            materias.nombre,
            desc(expedientes.anio),
            expedientes.numero,
            desc(audiencias.fechaProgramada),
          );

        return registros;
      }

      // Modo Cronológico: Órgano > Año > Mes > Día > Audiencia
      const cronologicos = await db
        .select({
          organoId: organosJudiciales.id,
          organoNombre: organosJudiciales.nombre,
          audienciaId: audiencias.id,
          fecha: audiencias.fechaProgramada,
          hora: audiencias.horaInicioEstimada,
          estado: audiencias.estado,
          expedienteNumero: expedientes.numero,
        })
        .from(audiencias)
        .innerJoin(expedientes, eq(audiencias.expedienteId, expedientes.id))
        .innerJoin(organosJudiciales, eq(expedientes.organoJudicialId, organosJudiciales.id))
        .orderBy(desc(audiencias.fechaProgramada), audiencias.horaInicioEstimada);

      return cronologicos;
    },
    { requiereAuth: true },
  )
  // Búsqueda Full-Text Search en transcripciones y filtros combinados
  .get(
    '/buscar',
    async ({ query }) => {
      const { q, limit = 20, offset = 0 } = query as {
        q?: string;
        limit?: number;
        offset?: number;
      };

      if (q && q.trim().length > 0) {
        const termino = q.trim();
        const resultadosFts = await db
          .select({
            segmentoId: transcripcionSegmentos.id,
            texto: transcripcionSegmentos.texto,
            inicioMs: transcripcionSegmentos.inicioMs,
            finMs: transcripcionSegmentos.finMs,
            audienciaId: audiencias.id,
            fechaProgramada: audiencias.fechaProgramada,
            expedienteNumero: expedientes.numero,
            asunto: expedientes.asunto,
            rank: sql<number>`ts_rank(to_tsvector('spanish', ${transcripcionSegmentos.texto}), plainto_tsquery('spanish', ${termino}))`,
          })
          .from(transcripcionSegmentos)
          .innerJoin(
            transcripciones,
            eq(transcripcionSegmentos.transcripcionId, transcripciones.id),
          )
          .innerJoin(audiencias, eq(transcripciones.audienciaId, audiencias.id))
          .innerJoin(expedientes, eq(audiencias.expedienteId, expedientes.id))
          .where(
            sql`to_tsvector('spanish', ${transcripcionSegmentos.texto}) @@ plainto_tsquery('spanish', ${termino})`,
          )
          .orderBy(
            desc(
              sql`ts_rank(to_tsvector('spanish', ${transcripcionSegmentos.texto}), plainto_tsquery('spanish', ${termino}))`,
            ),
          )
          .limit(limit)
          .offset(offset);

        return resultadosFts;
      }

      // Búsqueda estándar por expediente o fecha
      return await db
        .select({
          audiencia: audiencias,
          expediente: expedientes,
        })
        .from(audiencias)
        .innerJoin(expedientes, eq(audiencias.expedienteId, expedientes.id))
        .orderBy(desc(audiencias.fechaProgramada))
        .limit(limit)
        .offset(offset);
    },
    {
      query: BusquedaAudienciasQuerySchema,
      requiereAuth: true,
    },
  );
