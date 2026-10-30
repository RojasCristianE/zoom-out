import { type Static, t } from 'elysia';

export const EvaluacionPredictivaSchema = t.Object({
  hechosClave: t.Array(t.String(), {
    description: 'Lista sucinta de hechos acreditados o alegados durante la audiencia',
  }),
  balanceProbatorio: t.Object({
    acusacion: t.Object({
      argumentosFuertes: t.Array(t.String()),
      debilidades: t.Array(t.String()),
      elementosProbatoriosClave: t.Array(t.String()),
    }),
    defensa: t.Object({
      argumentosFuertes: t.Array(t.String()),
      debilidades: t.Array(t.String()),
      elementosProbatoriosClave: t.Array(t.String()),
    }),
  }),
  pronostico: t.Object({
    falloMasProbable: t.Union([
      t.Literal('condenatorio'),
      t.Literal('absolutorio'),
      t.Literal('mixto'),
      t.Literal('indeterminado'),
    ]),
    probabilidadEstimada: t.Number({ minimum: 0, maximum: 1 }),
    nivelConfianza: t.Union([
      t.Literal('alto'),
      t.Literal('medio'),
      t.Literal('bajo'),
    ]),
  }),
  fundamentacion: t.String({
    description: 'Análisis jurídico dogmático y procesal resumido conforme CPP Nicaragua',
  }),
  articulosInvocadosOAplicables: t.Array(t.String(), {
    description: 'Artículos de la Ley N° 406 u otras leyes pertinentes',
  }),
  descargoLegal: t.String({
    description: 'Advertencia legal obligatoria de uso auxiliar y no vinculante',
  }),
});

export type EvaluacionPredictivaInput = Static<typeof EvaluacionPredictivaSchema>;
