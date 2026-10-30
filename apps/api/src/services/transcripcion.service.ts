import { db } from '../lib/db';
import {
  grabaciones,
  transcripciones,
  transcripcionSegmentos,
  partesProcesales,
  audiencias,
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getObjectBuffer, putObject } from '../lib/minio';
import { transcribirAudioJudicial } from '../lib/whisper';
import { env } from '../lib/env';

/**
 * Procesa la transcripción de una grabación de audio judicial.
 */
export async function procesarTranscripcionGrabacion(grabacionId: string) {
  const [grab] = await db
    .select()
    .from(grabaciones)
    .where(eq(grabaciones.id, grabacionId))
    .limit(1);

  if (!grab) {
    throw new Error(`Grabación no encontrada: ${grabacionId}`);
  }

  // Obtener nombres de partes procesales y juez para inyectar como prompt léxico a Whisper
  const partes = await db
    .select()
    .from(partesProcesales)
    .innerJoin(audiencias, eq(partesProcesales.expedienteId, audiencias.expedienteId))
    .where(eq(audiencias.id, grab.audienciaId));

  const nombres = partes.map((p) => p.partes_procesales.nombre).filter(Boolean);
  const promptNombres = [
    'Juzgado',
    'Audiencia',
    'Código Procesal Penal',
    'Fiscalía',
    'Defensa',
    ...nombres,
  ].join(', ');

  console.log(`🎙️ Descargando audio de MinIO: ${grab.s3Key} (bucket: ${grab.s3Bucket})`);
  const audioBuffer = await getObjectBuffer(grab.s3Bucket, grab.s3Key);

  // Calcular SHA-256 para integridad de la grabación
  const hasher = new Bun.CryptoHasher('sha256');
  hasher.update(audioBuffer);
  const sha256 = hasher.digest('hex');

  // Registrar transcripción en estado 'procesando'
  let [transcripcion] = await db
    .select()
    .from(transcripciones)
    .where(eq(transcripciones.grabacionId, grab.id))
    .limit(1);

  if (!transcripcion) {
    const [nueva] = await db
      .insert(transcripciones)
      .values({
        audienciaId: grab.audienciaId,
        grabacionId: grab.id,
        estado: 'procesando',
      })
      .returning();
    transcripcion = nueva;
  } else {
    await db
      .update(transcripciones)
      .set({ estado: 'procesando' })
      .where(eq(transcripciones.id, transcripcion.id));
  }

  const tiempoInicio = Date.now();

  try {
    const resultado = await transcribirAudioJudicial(audioBuffer, 'audio.ogg', {
      language: 'es',
      promptNombres,
    });

    const tiempoProcesamientoSegundos = Math.round((Date.now() - tiempoInicio) / 1000);

    // Guardar JSON de transcripción en MinIO
    const jsonKey = grab.s3Key.replace(/\.ogg$/, '.json');
    const jsonBuffer = Buffer.from(JSON.stringify(resultado, null, 2), 'utf-8');
    await putObject(grab.s3Bucket, jsonKey, jsonBuffer, 'application/json');

    // Actualizar transcripción en DB
    await db
      .update(transcripciones)
      .set({
        estado: 'completada',
        textoCompleto: resultado.textoCompleto,
        tiempoProcesamientoSegundos,
        idioma: resultado.idioma,
        updatedAt: new Date(),
      })
      .where(eq(transcripciones.id, transcripcion.id));

    // Insertar segmentos
    if (resultado.segmentos.length > 0) {
      await db.insert(transcripcionSegmentos).values(
        resultado.segmentos.map((s) => ({
          transcripcionId: transcripcion.id,
          inicioMs: s.inicioMs,
          finMs: s.finMs,
          texto: s.texto,
          confianza: s.confianza,
        })),
      );
    }

    // Actualizar metadata de la grabación
    await db
      .update(grabaciones)
      .set({
        estado: 'completada',
        s3SizeBytes: audioBuffer.length,
        sha256,
        duracionSegundos: resultado.duracionSegundos,
        updatedAt: new Date(),
      })
      .where(eq(grabaciones.id, grab.id));

    console.log(`✅ Transcripción completada exitosamente: ${transcripcion.id}`);
    return transcripcion;
  } catch (error) {
    console.error(`❌ Error transcribiendo grabación ${grab.id}:`, error);
    await db
      .update(transcripciones)
      .set({ estado: 'fallida', updatedAt: new Date() })
      .where(eq(transcripciones.id, transcripcion.id));

    await db
      .update(grabaciones)
      .set({ estado: 'error', updatedAt: new Date() })
      .where(eq(grabaciones.id, grab.id));

    throw error;
  }
}
