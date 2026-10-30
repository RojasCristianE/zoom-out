import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  uuid,
  pgEnum,
  jsonb,
  index,
  date,
  time,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ──────────────────────────────────────────────
// Enums Judiciales
// ──────────────────────────────────────────────

export const rolUsuarioEnum = pgEnum('rol_usuario', [
  'admin',
  'juez',
  'secretario',
  'operador',
  'consulta',
]);

export const estadoAudienciaEnum = pgEnum('estado_audiencia', [
  'programada',
  'en_curso',
  'en_pausa',
  'finalizada',
  'cancelada',
  'reprogramada',
]);

export const rolParteEnum = pgEnum('rol_parte', [
  'juez',
  'secretario',
  'fiscal',
  'defensor',
  'acusado',
  'victima',
  'querellante',
  'testigo',
  'perito',
  'operador',
]);

export const tipoMarcadorEnum = pgEnum('tipo_marcador', [
  'apertura',
  'alegato_inicial_acusacion',
  'alegato_inicial_defensa',
  'declaracion_imputado',
  'prueba_testifical',
  'prueba_pericial',
  'prueba_documental',
  'incidente',
  'objecion',
  'receso',
  'alegato_final_acusacion',
  'alegato_final_defensa',
  'derecho_ultima_palabra',
  'fallo',
  'cierre',
  'otro',
]);

export const tipoDocumentoEnum = pgEnum('tipo_documento', [
  'acta_integral',
  'resumen_simple',
  'evaluacion_predictiva',
  'reporte_diario',
]);

export const estadoDocumentoEnum = pgEnum('estado_documento', [
  'borrador',
  'aprobado',
  'firmado',
  'archivado',
]);

export const estadoGrabacionEnum = pgEnum('estado_grabacion', [
  'grabando',
  'procesando',
  'completada',
  'error',
]);

export const estadoTranscripcionEnum = pgEnum('estado_transcripcion', [
  'pendiente',
  'procesando',
  'completada',
  'fallida',
]);

// ──────────────────────────────────────────────
// Órganos Judiciales y Salas
// ──────────────────────────────────────────────

export const organosJudiciales = pgTable('organos_judiciales', {
  id: uuid('id').primaryKey().defaultRandom(),
  codigo: text('codigo').notNull().unique(), // e.g. JPO-MGA-01
  nombre: text('nombre').notNull(),
  circunscripcion: text('circunscripcion').notNull().default('Managua'),
  municipio: text('municipio').notNull().default('Managua'),
  direccion: text('direccion'),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const salas = pgTable('salas', {
  id: uuid('id').primaryKey().defaultRandom(),
  organoJudicialId: uuid('organo_judicial_id')
    .notNull()
    .references(() => organosJudiciales.id, { onDelete: 'cascade' }),
  nombre: text('nombre').notNull(), // e.g. Sala de Audiencias 3
  capacidad: integer('capacidad').notNull().default(20),
  ipMicrofono: text('ip_microfono'),
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const materias = pgTable('materias', {
  id: uuid('id').primaryKey().defaultRandom(),
  codigo: text('codigo').notNull().unique(), // e.g. penal, civil, laboral
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  color: text('color').default('#2563eb'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tiposAudiencia = pgTable('tipos_audiencia', {
  id: uuid('id').primaryKey().defaultRandom(),
  materiaId: uuid('materia_id')
    .notNull()
    .references(() => materias.id, { onDelete: 'cascade' }),
  codigo: text('codigo').notNull(), // e.g. preliminar, inicial, juicio
  nombre: text('nombre').notNull(),
  duracionEstimadaMinutos: integer('duracion_estimada_minutos').notNull().default(60),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────
// Usuarios y Sesiones
// ──────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  organoJudicialId: uuid('organo_judicial_id').references(() => organosJudiciales.id),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: rolUsuarioEnum('role').notNull().default('consulta'),
  avatarUrl: text('avatar_url'),
  activo: boolean('activo').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revoked: boolean('revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────
// Expedientes y Partes Procesales
// ──────────────────────────────────────────────

export const expedientes = pgTable(
  'expedientes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    numero: text('numero').notNull().unique(), // e.g. 001234-ORM4-2026-PN
    organoJudicialId: uuid('organo_judicial_id')
      .notNull()
      .references(() => organosJudiciales.id),
    materiaId: uuid('materia_id')
      .notNull()
      .references(() => materias.id),
    anio: integer('anio').notNull(),
    asunto: text('asunto').notNull(),
    delitoOMotivo: text('delito_o_motivo'),
    estado: text('estado').notNull().default('activo'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_expedientes_anio').on(table.anio),
    index('idx_expedientes_organo').on(table.organoJudicialId),
  ],
);

// ──────────────────────────────────────────────
// Audiencias
// ──────────────────────────────────────────────

export const audiencias = pgTable(
  'audiencias',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    expedienteId: uuid('expediente_id')
      .notNull()
      .references(() => expedientes.id, { onDelete: 'cascade' }),
    salaId: uuid('sala_id')
      .notNull()
      .references(() => salas.id),
    tipoAudienciaId: uuid('tipo_audiencia_id')
      .notNull()
      .references(() => tiposAudiencia.id),
    juezId: uuid('juez_id')
      .notNull()
      .references(() => users.id),
    secretarioId: uuid('secretario_id').references(() => users.id),
    operadorId: uuid('operador_id').references(() => users.id),

    fechaProgramada: date('fecha_programada').notNull(),
    horaInicioEstimada: time('hora_inicio_estimada').notNull(),
    horaFinEstimada: time('hora_fin_estimada').notNull(),

    inicioEfectivo: timestamp('inicio_efectivo', { withTimezone: true }),
    finEfectivo: timestamp('fin_efectivo', { withTimezone: true }),
    duracionSegundos: integer('duracion_segundos'),

    estado: estadoAudienciaEnum('estado').notNull().default('programada'),
    observaciones: text('observaciones'),
    livekitRoomName: text('livekit_room_name').notNull().unique(),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audiencias_fecha').on(table.fechaProgramada),
    index('idx_audiencias_sala').on(table.salaId),
    index('idx_audiencias_juez').on(table.juezId),
  ],
);

export const partesProcesales = pgTable(
  'partes_procesales',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    expedienteId: uuid('expediente_id')
      .notNull()
      .references(() => expedientes.id, { onDelete: 'cascade' }),
    audienciaId: uuid('audiencia_id').references(() => audiencias.id, { onDelete: 'set null' }),
    nombre: text('nombre').notNull(),
    cedula: text('cedula'),
    rol: rolParteEnum('rol').notNull(),
    institucion: text('institucion'),
    presente: boolean('presente').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_partes_expediente').on(table.expedienteId),
    index('idx_partes_audiencia').on(table.audienciaId),
  ],
);

// ──────────────────────────────────────────────
// Grabaciones (Audio Exclusivo OGG/Opus)
// ──────────────────────────────────────────────

export const grabaciones = pgTable('grabaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  audienciaId: uuid('audiencia_id')
    .notNull()
    .unique()
    .references(() => audiencias.id, { onDelete: 'cascade' }),
  egressId: text('egress_id'),
  s3Key: text('s3_key').notNull(),
  s3Bucket: text('s3_bucket').notNull().default('audiencias'),
  s3SizeBytes: bigint('s3_size_bytes', { mode: 'number' }),
  sha256: text('sha256'),
  formato: text('formato').notNull().default('ogg_opus'),
  duracionSegundos: integer('duracion_segundos'),
  sampleRate: integer('sample_rate').notNull().default(48000),
  canales: integer('canales').notNull().default(1),
  estado: estadoGrabacionEnum('estado').notNull().default('grabando'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────
// Marcadores de Tiempo en Vivo
// ──────────────────────────────────────────────

export const marcadores = pgTable(
  'marcadores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    audienciaId: uuid('audiencia_id')
      .notNull()
      .references(() => audiencias.id, { onDelete: 'cascade' }),
    timestampMs: integer('timestamp_ms').notNull(),
    tipo: tipoMarcadorEnum('tipo').notNull(),
    etiqueta: text('etiqueta').notNull(),
    descripcion: text('descripcion'),
    creadoPorId: uuid('creado_por_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_marcadores_audiencia_ts').on(table.audienciaId, table.timestampMs),
  ],
);

// ──────────────────────────────────────────────
// Transcripciones y Segmentos con FTS
// ──────────────────────────────────────────────

export const transcripciones = pgTable('transcripciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  audienciaId: uuid('audiencia_id')
    .notNull()
    .unique()
    .references(() => audiencias.id, { onDelete: 'cascade' }),
  grabacionId: uuid('grabacion_id')
    .notNull()
    .references(() => grabaciones.id, { onDelete: 'cascade' }),
  idioma: text('idioma').notNull().default('es'),
  modelo: text('modelo').notNull().default('large-v3-turbo'),
  tiempoProcesamientoSegundos: integer('tiempo_procesamiento_segundos'),
  estado: estadoTranscripcionEnum('estado').notNull().default('pendiente'),
  textoCompleto: text('texto_completo'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const transcripcionSegmentos = pgTable(
  'transcripcion_segmentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    transcripcionId: uuid('transcripcion_id')
      .notNull()
      .references(() => transcripciones.id, { onDelete: 'cascade' }),
    inicioMs: integer('inicio_ms').notNull(),
    finMs: integer('fin_ms').notNull(),
    texto: text('texto').notNull(),
    hablante: text('hablante'),
    confianza: integer('confianza'), // 0..100
  },
  (table) => [
    index('idx_segmentos_transcripcion').on(table.transcripcionId),
    index('idx_segmentos_fts').using(
      'gin',
      sql`to_tsvector('spanish', ${table.texto})`,
    ),
  ],
);

// ──────────────────────────────────────────────
// Documentos Generados (Typst / Actas / IA)
// ──────────────────────────────────────────────

export const documentos = pgTable(
  'documentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    audienciaId: uuid('audiencia_id')
      .notNull()
      .references(() => audiencias.id, { onDelete: 'cascade' }),
    tipo: tipoDocumentoEnum('tipo').notNull(),
    estado: estadoDocumentoEnum('estado').notNull().default('borrador'),
    titulo: text('titulo').notNull(),
    contenidoJson: jsonb('contenido_json'),
    contenidoMarkdown: text('contenido_markdown'),
    s3KeyPdf: text('s3_key_pdf'),
    sha256Pdf: text('sha256_pdf'),
    version: integer('version').notNull().default(1),
    creadoPorId: uuid('creado_por_id').references(() => users.id),
    aprobadoPorId: uuid('aprobado_por_id').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_documentos_audiencia').on(table.audienciaId),
    index('idx_documentos_tipo').on(table.tipo),
  ],
);

// ──────────────────────────────────────────────
// Reportes Diarios de Salas
// ──────────────────────────────────────────────

export const reportesDiarios = pgTable(
  'reportes_diarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organoJudicialId: uuid('organo_judicial_id')
      .notNull()
      .references(() => organosJudiciales.id),
    salaId: uuid('sala_id').references(() => salas.id),
    fecha: date('fecha').notNull(),
    totalAudiencias: integer('total_audiencias').notNull().default(0),
    audienciasRealizadas: integer('audiencias_realizadas').notNull().default(0),
    audienciasSuspendidas: integer('audiencias_suspendidas').notNull().default(0),
    audienciasCanceladas: integer('audiencias_canceladas').notNull().default(0),
    duracionTotalMinutos: integer('duracion_total_minutos').notNull().default(0),
    metricasJson: jsonb('metricas_json').notNull().default({}),
    sintesisLlm: text('sintesis_llm'),
    s3KeyPdf: text('s3_key_pdf'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_reportes_organo_fecha').on(table.organoJudicialId, table.fecha),
  ],
);

// ──────────────────────────────────────────────
// Auditoría de Seguridad Judicial
// ──────────────────────────────────────────────

export const auditoria = pgTable(
  'auditoria',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    usuarioId: uuid('usuario_id').references(() => users.id),
    accion: text('accion').notNull(), // ej. ver_evaluacion_ia, aprobar_acta, descargar_audio
    recursoTipo: text('recurso_tipo').notNull(), // audiencia, documento, grabacion
    recursoId: uuid('recurso_id').notNull(),
    ipOrigen: text('ip_origen'),
    userAgent: text('user_agent'),
    detalles: jsonb('detalles'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_auditoria_recurso').on(table.recursoTipo, table.recursoId),
    index('idx_auditoria_usuario').on(table.usuarioId),
  ],
);
