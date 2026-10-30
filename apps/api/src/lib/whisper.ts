import { env } from './env';
import type { TranscripcionSegmentoDTO } from '@zoom-out/shared-types';

export interface TranscribirAudioOptions {
  language?: string;
  promptNombres?: string; // Vocabulario inicial (juez, partes, términos CPP)
}

export interface TranscripcionResultado {
  textoCompleto: string;
  duracionSegundos: number;
  idioma: string;
  segmentos: Array<{
    inicioMs: number;
    finMs: number;
    texto: string;
    confianza?: number;
  }>;
}

/**
 * Transcribe un buffer de audio directamente a través de Faster-Whisper.
 * No requiere extracción de video (el input ya es audio puro OGG/Opus o WAV).
 */
export async function transcribirAudioJudicial(
  audioBuffer: Buffer,
  filename = 'audio.ogg',
  options?: TranscribirAudioOptions,
): Promise<TranscripcionResultado> {
  const formData = new FormData();

  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/ogg' });
  formData.append('file', blob, filename);
  formData.append('response_format', 'verbose_json');
  formData.append('language', options?.language ?? 'es');

  if (options?.promptNombres) {
    formData.append('prompt', options.promptNombres);
  }

  const response = await fetch(`${env.WHISPER_API_URL}/v1/audio/transcriptions`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error de Faster-Whisper (${response.status} ${response.statusText}): ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    text: string;
    duration: number;
    language: string;
    segments: Array<{
      id: number;
      start: number; // segundos
      end: number; // segundos
      text: string;
      avg_logprob?: number;
    }>;
  };

  const segmentos = (data.segments || []).map((s) => ({
    inicioMs: Math.round(s.start * 1000),
    finMs: Math.round(s.end * 1000),
    texto: s.text.trim(),
    confianza: s.avg_logprob ? Math.round(Math.min(100, Math.max(0, (s.avg_logprob + 1) * 100))) : undefined,
  }));

  return {
    textoCompleto: data.text.trim(),
    duracionSegundos: Math.round(data.duration || 0),
    idioma: data.language || 'es',
    segmentos,
  };
}
