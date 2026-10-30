import { Elysia } from 'elysia';
import { db } from '../../lib/db';
import { documentos, audiencias, auditoria } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { authPlugin } from '../../plugins/auth';
import { getPresignedUrl } from '../../lib/minio';
import { env } from '../../lib/env';
import { GenerarDocumentoSchema, AprobarDocumentoSchema } from '@zoom-out/validators';
import { colaDocumentosIa } from '../../workers/ia.worker';

export const documentosRoutes = new Elysia({ prefix: '/documentos' })
  .use(authPlugin)
  .get(
    '/:id',
    async ({ params: { id }, usuario, set, request }) => {
      const [doc] = await db
        .select()
        .from(documentos)
        .where(eq(documentos.id, id))
        .limit(1);

      if (!doc) {
        set.status = 404;
        return { error: 'Documento no encontrado' };
      }

      // Restricción estricta de evaluación predictiva (solo juez y admin)
      if (
        doc.tipo === 'evaluacion_predictiva' &&
        !['admin', 'juez'].includes(usuario!.role)
      ) {
        set.status = 403;
        return { error: 'Acceso restringido: documento reservado exclusivamente al Juez' };
      }

      // Auditoría de acceso si es evaluación predictiva
      if (doc.tipo === 'evaluacion_predictiva') {
        await db.insert(auditoria).values({
          usuarioId: usuario!.sub,
          accion: 'ver_evaluacion_ia',
          recursoTipo: 'documento',
          recursoId: doc.id,
          ipOrigen: request.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: request.headers.get('user-agent'),
        });
      }

      let urlPdf: string | undefined;
      if (doc.s3KeyPdf) {
        urlPdf = await getPresignedUrl(env.MINIO_BUCKET_AUDIENCIAS, doc.s3KeyPdf);
      }

      return {
        ...doc,
        urlPdf,
      };
    },
    { requiereAuth: true },
  )
  .post(
    '/generar',
    async ({ body, usuario, set }) => {
      if (
        body.tipo === 'evaluacion_predictiva' &&
        !['admin', 'juez'].includes(usuario!.role)
      ) {
        set.status = 403;
        return { error: 'Solo el Juez o Administrador pueden solicitar la evaluación predictiva' };
      }

      await colaDocumentosIa.add('generar-documento', {
        audienciaId: body.audienciaId,
        tipo: body.tipo,
      });

      return { encolado: true, mensaje: `Generación de ${body.tipo} iniciada` };
    },
    {
      body: GenerarDocumentoSchema,
      requiereRol: ['admin', 'juez', 'secretario'],
    },
  )
  .post(
    '/aprobar',
    async ({ body, usuario, set }) => {
      const [doc] = await db
        .select()
        .from(documentos)
        .where(eq(documentos.id, body.documentoId))
        .limit(1);

      if (!doc) {
        set.status = 404;
        return { error: 'Documento no encontrado' };
      }

      const [actualizado] = await db
        .update(documentos)
        .set({
          estado: 'aprobado',
          aprobadoPorId: usuario!.sub,
          updatedAt: new Date(),
        })
        .where(eq(documentos.id, doc.id))
        .returning();

      return actualizado;
    },
    {
      body: AprobarDocumentoSchema,
      requiereRol: ['admin', 'juez', 'secretario'],
    },
  );
