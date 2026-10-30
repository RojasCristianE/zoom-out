import { describe, expect, it } from 'bun:test';
import {
  generarRutaBaseAudiencia,
  keyGrabacionAudio,
  keyTranscripcionJson,
  keyActaIntegralPdf,
  keyResumenSimplePdf,
  keyEvaluacionPredictivaPdf,
} from '../src/lib/storage-keys';
import { TRANSICIONES_AUDIENCIA, type EstadoAudiencia } from '@zoom-out/shared-types';

describe('Storage Keys Judiciales', () => {
  const params = {
    organoCodigo: 'JPO-MGA-01',
    materiaCodigo: 'penal',
    anioExpediente: 2026,
    numeroExpediente: '001234-ORM4-2026-PN',
    fechaProgramada: '2026-10-30',
    horaInicioEstimada: '09:00:00',
    audienciaId: '123e4567-e89b-12d3-a456-426614174000',
  };

  it('debe generar la ruta canónica jerárquica esperada', () => {
    const ruta = generarRutaBaseAudiencia(params);
    expect(ruta).toBe(
      'JPO-MGA-01/penal/2026/001234-ORM4-2026-PN/2026-10/30/0900_123e4567',
    );
  });

  it('debe generar keys deterministas para audio, json y pdfs', () => {
    expect(keyGrabacionAudio(params)).toContain('audio.ogg');
    expect(keyTranscripcionJson(params)).toContain('transcripcion.json');
    expect(keyActaIntegralPdf(params)).toContain('acta_integral.pdf');
    expect(keyResumenSimplePdf(params)).toContain('resumen_simple.pdf');
    expect(keyEvaluacionPredictivaPdf(params)).toContain('evaluacion_predictiva.pdf');
  });
});

describe('Máquina de Estados de Audiencia', () => {
  it('programada solo puede pasar a en_curso, cancelada o reprogramada', () => {
    expect(TRANSICIONES_AUDIENCIA.programada).toEqual([
      'en_curso',
      'cancelada',
      'reprogramada',
    ]);
  });

  it('finalizada es estado terminal sin transiciones', () => {
    expect(TRANSICIONES_AUDIENCIA.finalizada).toEqual([]);
  });

  it('en_curso solo puede pasar a en_pausa o finalizada', () => {
    expect(TRANSICIONES_AUDIENCIA.en_curso).toEqual(['en_pausa', 'finalizada']);
  });
});
