import { env } from './env';
import { Value } from '@sinclair/typebox/value';
import { EvaluacionPredictivaSchema, type EvaluacionPredictivaInput } from '@zoom-out/validators';

export const DESCARGO_LEGAL_EVALUACION =
  'AVISO JUDICIAL: Este documento constituye un análisis preliminar emitido por asistencia computacional basado exclusivamente en la transcripción de la audiencia. No tiene valor vinculante ni sustituye el arbitrio, criterio ni convicción del Juez. Su consulta está restringida estrictamente a fines de orientación judicial.';

export interface GenerarEvaluacionPredictivaParams {
  numeroExpediente: string;
  asunto: string;
  materia: string;
  transcripcion: string;
}

export async function generarEvaluacionPredictivaLLM(
  params: GenerarEvaluacionPredictivaParams,
): Promise<EvaluacionPredictivaInput> {
  const promptSistema = `Sos un Asistente Judicial de Alta Especialización en Derecho Procesal Penal y Normativa Judicial de Nicaragua (Código Procesal Penal - Ley N° 406).
Analizá minuciosamente la transcripción de la audiencia penal y generá una evaluación técnica estructurada.
Debes responder ESTRICTAMENTE en formato JSON válido conforme al siguiente esquema, sin comentarios, sin markdown de triple backtick ni explicaciones fuera del JSON:
{
  "hechosClave": ["string"],
  "balanceProbatorio": {
    "acusacion": {
      "argumentosFuertes": ["string"],
      "debilidades": ["string"],
      "elementosProbatoriosClave": ["string"]
    },
    "defensa": {
      "argumentosFuertes": ["string"],
      "debilidades": ["string"],
      "elementosProbatoriosClave": ["string"]
    }
  },
  "pronostico": {
    "falloMasProbable": "condenatorio" | "absolutorio" | "mixto" | "indeterminado",
    "probabilidadEstimada": 0.0 a 1.0,
    "nivelConfianza": "alto" | "medio" | "bajo"
  },
  "fundamentacion": "string",
  "articulosInvocadosOAplicables": ["string"],
  "descargoLegal": "${DESCARGO_LEGAL_EVALUACION}"
}`;

  const promptUsuario = `EXPEDIENTE: ${params.numeroExpediente}
MATERIA: ${params.materia}
ASUNTO: ${params.asunto}

TRANSCRIPCIÓN COMPLETA DE LA AUDIENCIA:
"""
${params.transcripcion.slice(0, 32000)}
"""

Generá ahora el objeto JSON con la evaluación:`;

  const respuesta = await fetch(`${env.OLLAMA_API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      system: promptSistema,
      prompt: promptUsuario,
      format: 'json',
      stream: false,
      options: {
        temperature: 0.1,
      },
    }),
  });

  if (!respuesta.ok) {
    const errorTxt = await respuesta.text();
    throw new Error(`Error en Ollama (${respuesta.status}): ${errorTxt}`);
  }

  const respuestaJson = (await respuesta.json()) as { response: string };
  let parsed: unknown;
  try {
    parsed = JSON.parse(respuestaJson.response);
  } catch (err) {
    throw new Error(`Ollama no retornó un JSON válido: ${respuestaJson.response}`);
  }

  // Garantizar descargo legal inmutable
  if (typeof parsed === 'object' && parsed !== null) {
    (parsed as Record<string, unknown>).descargoLegal = DESCARGO_LEGAL_EVALUACION;
  }

  if (!Value.Check(EvaluacionPredictivaSchema, parsed)) {
    const errors = [...Value.Errors(EvaluacionPredictivaSchema, parsed)];
    console.warn('⚠️ La salida del LLM tuvo inconsistencias de esquema:', errors);
    // Intentar arreglar campos mínimos
    const saneado = Value.Cast(EvaluacionPredictivaSchema, parsed);
    saneado.descargoLegal = DESCARGO_LEGAL_EVALUACION;
    return saneado;
  }

  return parsed as EvaluacionPredictivaInput;
}

export async function generarResumenSimpleLLM(transcripcion: string): Promise<string> {
  const promptSistema =
    'Sos un comunicador judicial que traduce audiencias complejas a un resumen ejecutivo en lenguaje claro, conciso y comprensible para cualquier ciudadano, preservando con total fidelidad los puntos tratados, resoluciones tomadas y próximos pasos procesales.';

  const respuesta = await fetch(`${env.OLLAMA_API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OLLAMA_MODEL,
      system: promptSistema,
      prompt: `TRANSCRIPCIÓN:\n${transcripcion.slice(0, 32000)}\n\nGenerá el resumen simple en Markdown:`,
      stream: false,
      options: {
        temperature: 0.2,
      },
    }),
  });

  const data = (await respuesta.json()) as { response: string };
  return data.response.trim();
}
