export interface StorageKeyParams {
  organoCodigo: string; // ej. JPO-MGA-01
  materiaCodigo: string; // ej. penal
  anioExpediente: number | string; // ej. 2026
  numeroExpediente: string; // ej. 001234-ORM4-2026-PN
  fechaProgramada: string; // ej. 2026-10-30
  horaInicioEstimada: string; // ej. 09:00:00 o 09:00
  audienciaId: string; // uuid
}

function sanitizarSegmento(seg: string): string {
  return seg.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Genera la ruta canónica del caso en MinIO.
 * Formato: {organo}/{materia}/{anioExpediente}/{expediente}/{yyyy-mm}/{dd}/{HHmm}_{id8}/
 */
export function generarRutaBaseAudiencia(params: StorageKeyParams): string {
  const organo = sanitizarSegmento(params.organoCodigo);
  const materia = sanitizarSegmento(params.materiaCodigo);
  const anio = sanitizarSegmento(String(params.anioExpediente));
  const exp = sanitizarSegmento(params.numeroExpediente);

  const [yyyy, mm, dd] = params.fechaProgramada.split('-');
  const partesHora = params.horaInicioEstimada.split(':');
  const hhmm = `${partesHora[0]}${partesHora[1]}`;
  const id8 = params.audienciaId.replace(/-/g, '').slice(0, 8);

  return `${organo}/${materia}/${anio}/${exp}/${yyyy}-${mm}/${dd}/${hhmm}_${id8}`;
}

export function keyGrabacionAudio(params: StorageKeyParams): string {
  const base = generarRutaBaseAudiencia(params);
  return `${base}/audio.ogg`;
}

export function keyTranscripcionJson(params: StorageKeyParams): string {
  const base = generarRutaBaseAudiencia(params);
  return `${base}/transcripcion.json`;
}

export function keyActaIntegralPdf(params: StorageKeyParams): string {
  const base = generarRutaBaseAudiencia(params);
  return `${base}/acta_integral.pdf`;
}

export function keyResumenSimplePdf(params: StorageKeyParams): string {
  const base = generarRutaBaseAudiencia(params);
  return `${base}/resumen_simple.pdf`;
}

export function keyEvaluacionPredictivaPdf(params: StorageKeyParams): string {
  const base = generarRutaBaseAudiencia(params);
  return `${base}/evaluacion_predictiva.pdf`;
}

export function keyReporteDiarioPdf(organoCodigo: string, fechaYmd: string, salaNombre?: string): string {
  const organo = sanitizarSegmento(organoCodigo);
  const [yyyy, mm, dd] = fechaYmd.split('-');
  const sala = salaNombre ? `_${sanitizarSegmento(salaNombre)}` : '';
  return `${organo}/reportes/${yyyy}/${mm}/${dd}/reporte_diario${sala}.pdf`;
}
