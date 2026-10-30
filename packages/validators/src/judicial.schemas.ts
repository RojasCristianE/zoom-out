import { type Static, t } from 'elysia';

export const RolUsuarioSchema = t.Union([
  t.Literal('admin'),
  t.Literal('juez'),
  t.Literal('secretario'),
  t.Literal('operador'),
  t.Literal('consulta'),
]);

export const EstadoAudienciaSchema = t.Union([
  t.Literal('programada'),
  t.Literal('en_curso'),
  t.Literal('en_pausa'),
  t.Literal('finalizada'),
  t.Literal('cancelada'),
  t.Literal('reprogramada'),
]);

export const RolParteSchema = t.Union([
  t.Literal('juez'),
  t.Literal('secretario'),
  t.Literal('fiscal'),
  t.Literal('defensor'),
  t.Literal('acusado'),
  t.Literal('victima'),
  t.Literal('querellante'),
  t.Literal('testigo'),
  t.Literal('perito'),
  t.Literal('operador'),
]);

export const TipoMarcadorSchema = t.Union([
  t.Literal('apertura'),
  t.Literal('alegato_inicial_acusacion'),
  t.Literal('alegato_inicial_defensa'),
  t.Literal('declaracion_imputado'),
  t.Literal('prueba_testifical'),
  t.Literal('prueba_pericial'),
  t.Literal('prueba_documental'),
  t.Literal('incidente'),
  t.Literal('objecion'),
  t.Literal('receso'),
  t.Literal('alegato_final_acusacion'),
  t.Literal('alegato_final_defensa'),
  t.Literal('derecho_ultima_palabra'),
  t.Literal('fallo'),
  t.Literal('cierre'),
  t.Literal('otro'),
]);

// ── Expedientes ──
export const CrearExpedienteSchema = t.Object({
  numero: t.String({ minLength: 3, maxLength: 64 }),
  organoJudicialId: t.String({ format: 'uuid' }),
  materiaId: t.String({ format: 'uuid' }),
  anio: t.Integer({ minimum: 1990, maximum: 2100 }),
  asunto: t.String({ minLength: 3, maxLength: 500 }),
  delitoOMotivo: t.Optional(t.String({ maxLength: 255 })),
});

export const AgregarParteSchema = t.Object({
  expedienteId: t.String({ format: 'uuid' }),
  audienciaId: t.Optional(t.String({ format: 'uuid' })),
  nombre: t.String({ minLength: 2, maxLength: 255 }),
  cedula: t.Optional(t.String({ maxLength: 32 })),
  rol: RolParteSchema,
  institucion: t.Optional(t.String({ maxLength: 255 })),
  presente: t.Optional(t.Boolean({ default: true })),
});

// ── Audiencias ──
export const ProgramarAudienciaSchema = t.Object({
  expedienteId: t.String({ format: 'uuid' }),
  salaId: t.String({ format: 'uuid' }),
  tipoAudienciaId: t.String({ format: 'uuid' }),
  juezId: t.String({ format: 'uuid' }),
  secretarioId: t.Optional(t.String({ format: 'uuid' })),
  operadorId: t.Optional(t.String({ format: 'uuid' })),
  fechaProgramada: t.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
  horaInicioEstimada: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
  horaFinEstimada: t.String({ pattern: '^\\d{2}:\\d{2}$' }),
  observaciones: t.Optional(t.String({ maxLength: 1000 })),
});

export const CambiarEstadoAudienciaSchema = t.Object({
  nuevoEstado: EstadoAudienciaSchema,
  observaciones: t.Optional(t.String({ maxLength: 500 })),
});

// ── Marcadores ──
export const CrearMarcadorSchema = t.Object({
  audienciaId: t.String({ format: 'uuid' }),
  timestampMs: t.Integer({ minimum: 0 }),
  tipo: TipoMarcadorSchema,
  etiqueta: t.String({ minLength: 1, maxLength: 100 }),
  descripcion: t.Optional(t.String({ maxLength: 500 })),
});

// ── Documentos ──
export const GenerarDocumentoSchema = t.Object({
  audienciaId: t.String({ format: 'uuid' }),
  tipo: t.Union([
    t.Literal('acta_integral'),
    t.Literal('resumen_simple'),
    t.Literal('evaluacion_predictiva'),
  ]),
});

export const AprobarDocumentoSchema = t.Object({
  documentoId: t.String({ format: 'uuid' }),
  observaciones: t.Optional(t.String({ maxLength: 500 })),
});

// ── Búsqueda y Filtros CMS ──
export const BusquedaAudienciasQuerySchema = t.Object({
  organoJudicialId: t.Optional(t.String({ format: 'uuid' })),
  materiaId: t.Optional(t.String({ format: 'uuid' })),
  anio: t.Optional(t.Integer()),
  mes: t.Optional(t.Integer({ minimum: 1, maximum: 12 })),
  dia: t.Optional(t.Integer({ minimum: 1, maximum: 31 })),
  expediente: t.Optional(t.String()),
  q: t.Optional(t.String({ description: 'Término de búsqueda Full-Text Search en transcripciones' })),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100, default: 20 })),
  offset: t.Optional(t.Integer({ minimum: 0, default: 0 })),
});

export type CrearExpedienteInput = Static<typeof CrearExpedienteSchema>;
export type AgregarParteInput = Static<typeof AgregarParteSchema>;
export type ProgramarAudienciaInput = Static<typeof ProgramarAudienciaSchema>;
export type CambiarEstadoAudienciaInput = Static<typeof CambiarEstadoAudienciaSchema>;
export type CrearMarcadorInput = Static<typeof CrearMarcadorSchema>;
export type GenerarDocumentoInput = Static<typeof GenerarDocumentoSchema>;
export type BusquedaAudienciasQuery = Static<typeof BusquedaAudienciasQuerySchema>;
