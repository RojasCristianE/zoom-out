import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@api/lib/env';
import { db } from '@api/lib/db';
import {
  audiencias,
  expedientes,
  organosJudiciales,
  materias,
  users,
  documentos,
  transcripciones,
} from '@db/schema';
import { eq } from 'drizzle-orm';
import {
  generarEvaluacionPredictivaLLM,
  generarResumenSimpleLLM,
} from '@api/lib/ollama';
import { compilarTypstPdf } from '@api/lib/typst';
import { putObject } from '@api/lib/minio';
import {
  keyActaIntegralPdf,
  keyResumenSimplePdf,
  keyEvaluacionPredictivaPdf,
} from '@api/lib/storage-keys';
import { join } from 'path';

const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const COLA_DOCUMENTOS_IA = 'documentos-ia-judicial';

export const colaDocumentosIa = new Queue(COLA_DOCUMENTOS_IA, {
  connection: redisConnection,
});

let worker: Worker | null = null;

export function iniciarWorkerIa() {
  if (worker) return;

  console.log('🤖 Iniciando Worker IA y Typst (Ollama + Typst)...');

  worker = new Worker(
    COLA_DOCUMENTOS_IA,
    async (job) => {
      const { audienciaId, tipo } = job.data as {
        audienciaId: string;
        tipo: 'acta_integral' | 'resumen_simple' | 'evaluacion_predictiva';
      };

      console.log(`[Job IA ${job.id}] Generando ${tipo} para audiencia: ${audienciaId}`);
      await generarDocumentoAudiencia(audienciaId, tipo);
    },
    {
      connection: redisConnection,
      concurrency: 1, // CPU intensivo
    },
  );

  worker.on('completed', (job) => {
    console.log(`[Job IA ${job.id}] Finalizado exitosamente.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Job IA ${job?.id}] Falló:`, err);
  });
}

async function generarDocumentoAudiencia(
  audienciaId: string,
  tipo: 'acta_integral' | 'resumen_simple' | 'evaluacion_predictiva',
) {
  const [aud] = await db
    .select()
    .from(audiencias)
    .where(eq(audiencias.id, audienciaId))
    .limit(1);

  if (!aud) throw new Error(`Audiencia no encontrada: ${audienciaId}`);

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
  const [juez] = await db
    .select()
    .from(users)
    .where(eq(users.id, aud.juezId))
    .limit(1);
  const [secretario] = aud.secretarioId
    ? await db.select().from(users).where(eq(users.id, aud.secretarioId)).limit(1)
    : [null];

  const [trans] = await db
    .select()
    .from(transcripciones)
    .where(eq(transcripciones.audienciaId, aud.id))
    .limit(1);

  const textoTranscripcion = trans?.textoCompleto || 'Sin transcripción registrada.';

  const typstDir = join(process.cwd(), 'apps/api/typst');
  const storageParams = {
    organoCodigo: org?.codigo || 'ORG',
    materiaCodigo: mat?.codigo || 'GEN',
    anioExpediente: exp?.anio || 2026,
    numeroExpediente: exp?.numero || 'EXP',
    fechaProgramada: aud.fechaProgramada,
    horaInicioEstimada: aud.horaInicioEstimada,
    audienciaId: aud.id,
  };

  if (tipo === 'evaluacion_predictiva') {
    if (!env.IA_EVALUACION_HABILITADA) {
      console.log('ℹ️ Evaluación IA deshabilitada por configuración.');
      return;
    }

    const evaluacionJson = await generarEvaluacionPredictivaLLM({
      numeroExpediente: exp.numero,
      asunto: exp.asunto,
      materia: mat?.nombre || 'Penal',
      transcripcion: textoTranscripcion,
    });

    const pdfBuffer = await compilarTypstPdf(join(typstDir, 'evaluacion-predictiva.typ'), {
      inputs: {
        organo: org?.nombre || 'Poder Judicial',
        expediente: exp.numero,
        asunto: exp.asunto,
        fallo: evaluacionJson.pronostico.falloMasProbable,
        probabilidad: String(evaluacionJson.pronostico.probabilidadEstimada),
        confianza: evaluacionJson.pronostico.nivelConfianza,
        fundamentacion: evaluacionJson.fundamentacion,
        descargo: evaluacionJson.descargoLegal,
      },
    });

    const s3Key = keyEvaluacionPredictivaPdf(storageParams);
    await putObject(env.MINIO_BUCKET_AUDIENCIAS, s3Key, pdfBuffer, 'application/pdf');

    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(pdfBuffer);
    const sha256Pdf = hasher.digest('hex');

    await db.insert(documentos).values({
      audienciaId: aud.id,
      tipo: 'evaluacion_predictiva',
      estado: 'borrador',
      titulo: `Evaluación Predictiva IA — ${exp.numero}`,
      contenidoJson: evaluacionJson as unknown as Record<string, unknown>,
      s3KeyPdf: s3Key,
      sha256Pdf,
    });
  } else if (tipo === 'resumen_simple') {
    const resumenMd = await generarResumenSimpleLLM(textoTranscripcion);

    const pdfBuffer = await compilarTypstPdf(join(typstDir, 'resumen-simple.typ'), {
      inputs: {
        organo: org?.nombre || 'Poder Judicial',
        expediente: exp.numero,
        fecha: aud.fechaProgramada,
        asunto: exp.asunto,
        resumen: resumenMd,
        esBorrador: 'true',
      },
    });

    const s3Key = keyResumenSimplePdf(storageParams);
    await putObject(env.MINIO_BUCKET_AUDIENCIAS, s3Key, pdfBuffer, 'application/pdf');

    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(pdfBuffer);
    const sha256Pdf = hasher.digest('hex');

    await db.insert(documentos).values({
      audienciaId: aud.id,
      tipo: 'resumen_simple',
      estado: 'borrador',
      titulo: `Resumen Simple — ${exp.numero}`,
      contenidoMarkdown: resumenMd,
      s3KeyPdf: s3Key,
      sha256Pdf,
    });
  } else if (tipo === 'acta_integral') {
    const pdfBuffer = await compilarTypstPdf(join(typstDir, 'acta-integral.typ'), {
      inputs: {
        organo: org?.nombre || 'Poder Judicial',
        expediente: exp.numero,
        juez: juez?.displayName || 'Juez de Distrito',
        secretario: secretario?.displayName || 'Secretario Judicial',
        fecha: aud.fechaProgramada,
        horaInicio: aud.horaInicioEstimada,
        horaFin: aud.horaFinEstimada,
        asunto: exp.asunto,
        contenido: textoTranscripcion.slice(0, 10000),
        esBorrador: 'true',
      },
    });

    const s3Key = keyActaIntegralPdf(storageParams);
    await putObject(env.MINIO_BUCKET_AUDIENCIAS, s3Key, pdfBuffer, 'application/pdf');

    const hasher = new Bun.CryptoHasher('sha256');
    hasher.update(pdfBuffer);
    const sha256Pdf = hasher.digest('hex');

    await db.insert(documentos).values({
      audienciaId: aud.id,
      tipo: 'acta_integral',
      estado: 'borrador',
      titulo: `Acta Integral de Audiencia — ${exp.numero}`,
      s3KeyPdf: s3Key,
      sha256Pdf,
    });
  }
}
