import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import {
  audiencias,
  expedientes,
  salas,
  tiposAudiencia,
  users,
  partesProcesales,
  grabaciones,
  marcadores,
  documentos,
  transcripciones,
  organosJudiciales,
  materias,
} from '../../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import {
  crearTokenLivekitAudio,
  iniciarEgressAudio,
  detenerEgress,
} from '../../lib/livekit';
import { keyGrabacionAudio } from '../../lib/storage-keys';
import { env } from '../../lib/env';
import { TRANSICIONES_AUDIENCIA, type EstadoAudiencia } from '@zoom-out/shared-types';
import { CambiarEstadoAudienciaSchema } from '@zoom-out/validators';

export const audienciasRoutes = new Elysia({ prefix: '/audiencias' })
  .use(authPlugin)
  .get(
    '/:id',
    async ({ params: { id }, set }) => {
      const [aud] = await db
        .select()
        .from(audiencias)
        .where(eq(audiencias.id, id))
        .limit(1);

      if (!aud) {
        set.status = 404;
        return { error: 'Audiencia no encontrada' };
      }

      const [exp] = await db
        .select()
        .from(expedientes)
        .where(eq(expedientes.id, aud.expedienteId))
        .limit(1);
      const [sala] = await db.select().from(salas).where(eq(salas.id, aud.salaId)).limit(1);
      const [tipo] = await db
        .select()
        .from(tiposAudiencia)
        .where(eq(tiposAudiencia.id, aud.tipoAudienciaId))
        .limit(1);
      const [juez] = await db
        .select({ id: users.id, displayName: users.displayName })
        .from(users)
        .where(eq(users.id, aud.juezId))
        .limit(1);

      const partes = await db
        .select()
        .from(partesProcesales)
        .where(eq(partesProcesales.expedienteId, aud.expedienteId));

      const [grabacion] = await db
        .select()
        .from(grabaciones)
        .where(eq(grabaciones.audienciaId, id))
        .limit(1);

      const listaMarcadores = await db
        .select()
        .from(marcadores)
        .where(eq(marcadores.audienciaId, id))
        .orderBy(marcadores.timestampMs);

      const listaDocumentos = await db
        .select()
        .from(documentos)
        .where(eq(documentos.audienciaId, id));

      const documentosConUrl = listaDocumentos.map((doc) => ({
        ...doc,
        urlPdf: doc.s3KeyPdf ? `/api/documentos/${doc.id}/pdf` : null,
      }));

      const [transcripcion] = await db
        .select()
        .from(transcripciones)
        .where(eq(transcripciones.audienciaId, id))
        .limit(1);

      return {
        ...aud,
        expediente: exp,
        sala,
        tipoAudiencia: tipo,
        juez,
        partes,
        grabacion,
        marcadores: listaMarcadores,
        documentos: documentosConUrl,
        transcripcion,
      };
    },
    { requiereAuth: true },
  )
  .post(
    '/:id/token',
    async ({ params: { id }, usuario, set }) => {
      const [aud] = await db
        .select()
        .from(audiencias)
        .where(eq(audiencias.id, id))
        .limit(1);

      if (!aud) {
        set.status = 404;
        return { error: 'Audiencia no encontrada' };
      }

      const token = await crearTokenLivekitAudio(
        aud.livekitRoomName,
        usuario!.sub,
        usuario!.email,
        {
          canPublish: ['admin', 'juez', 'secretario', 'operador'].includes(usuario!.role),
          canSubscribe: true,
          metadata: { rol: usuario!.role, organoJudicialId: usuario!.organoJudicialId },
        },
      );

      return {
        token,
        livekitUrl: env.LIVEKIT_URL,
        roomName: aud.livekitRoomName,
      };
    },
    { requiereAuth: true },
  )
  .post(
    '/:id/estado',
    async ({ params: { id }, body, usuario, set }) => {
      const [aud] = await db
        .select()
        .from(audiencias)
        .where(eq(audiencias.id, id))
        .limit(1);

      if (!aud) {
        set.status = 404;
        return { error: 'Audiencia no encontrada' };
      }

      const estadoActual = aud.estado as EstadoAudiencia;
      const transicionesPermitidas = TRANSICIONES_AUDIENCIA[estadoActual];

      if (!transicionesPermitidas.includes(body.nuevoEstado as EstadoAudiencia)) {
        set.status = 400;
        return {
          error: `Transición no válida de '${estadoActual}' a '${body.nuevoEstado}'`,
        };
      }

      const actualizaciones: Record<string, unknown> = {
        estado: body.nuevoEstado,
        updatedAt: new Date(),
      };

      if (body.nuevoEstado === 'en_curso' && !aud.inicioEfectivo) {
        actualizaciones.inicioEfectivo = new Date();

        // Iniciar grabación de audio automática si no existe
        const [exp] = await db
          .select()
          .from(expedientes)
          .where(eq(expedientes.id, aud.expedienteId))
          .limit(1);
        const [org] = await db
          .select()
          .from(organosJudiciales)
          .where(eq(organosJudiciales.id, exp.organoJudicialId))
          .limit(1);
        const [mat] = await db
          .select()
          .from(materias)
          .where(eq(materias.id, exp.materiaId))
          .limit(1);

        const s3Key = keyGrabacionAudio({
          organoCodigo: org?.codigo || 'ORG',
          materiaCodigo: mat?.codigo || 'GEN',
          anioExpediente: exp?.anio || 2026,
          numeroExpediente: exp?.numero || 'EXP',
          fechaProgramada: aud.fechaProgramada,
          horaInicioEstimada: aud.horaInicioEstimada,
          audienciaId: aud.id,
        });

        try {
          const egressInfo = await iniciarEgressAudio(aud.livekitRoomName, s3Key);
          await db.insert(grabaciones).values({
            audienciaId: aud.id,
            egressId: egressInfo.egressId,
            s3Key,
            s3Bucket: env.MINIO_BUCKET_AUDIENCIAS,
            formato: 'ogg_opus',
            estado: 'grabando',
          });
        } catch (err) {
          console.error('Error al iniciar Egress de audio:', err);
        }
      }

      if (body.nuevoEstado === 'finalizada') {
        const ahora = new Date();
        actualizaciones.finEfectivo = ahora;
        if (aud.inicioEfectivo) {
          const duracion = Math.floor(
            (ahora.getTime() - new Date(aud.inicioEfectivo).getTime()) / 1000,
          );
          actualizaciones.duracionSegundos = duracion;
        }

        // Detener egress si hay uno activo
        const [grab] = await db
          .select()
          .from(grabaciones)
          .where(eq(grabaciones.audienciaId, aud.id))
          .limit(1);

        if (grab?.egressId && grab.estado === 'grabando') {
          try {
            await detenerEgress(grab.egressId);
            await db
              .update(grabaciones)
              .set({ estado: 'procesando' })
              .where(eq(grabaciones.id, grab.id));
          } catch (err) {
            console.error('Error al detener egress:', err);
          }
        }
      }

      const [actualizada] = await db
        .update(audiencias)
        .set(actualizaciones)
        .where(eq(audiencias.id, id))
        .returning();

      return actualizada;
    },
    {
      body: CambiarEstadoAudienciaSchema,
      requiereRol: ['admin', 'juez', 'secretario', 'operador'],
    },
  );
