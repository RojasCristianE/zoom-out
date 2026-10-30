// ──────────────────────────────────────────────
// Contratos de Dominio Judicial — Nicaragua (CPP / Ley N° 406)
// ──────────────────────────────────────────────

export const ROLES_USUARIO = ['admin', 'juez', 'secretario', 'operador', 'consulta'] as const;
export type RolUsuario = (typeof ROLES_USUARIO)[number];

export const ESTADOS_AUDIENCIA = [
  'programada',
  'en_curso',
  'en_pausa',
  'finalizada',
  'cancelada',
  'reprogramada',
] as const;
export type EstadoAudiencia = (typeof ESTADOS_AUDIENCIA)[number];

export const TRANSICIONES_AUDIENCIA: Record<EstadoAudiencia, readonly EstadoAudiencia[]> = {
  programada: ['en_curso', 'cancelada', 'reprogramada'],
  en_curso: ['en_pausa', 'finalizada'],
  en_pausa: ['en_curso', 'finalizada'],
  finalizada: [],
  cancelada: [],
  reprogramada: ['en_curso', 'cancelada'],
};

export const ROLES_PARTE = [
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
] as const;
export type RolParte = (typeof ROLES_PARTE)[number];

export const TIPOS_MARCADOR = [
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
] as const;
export type TipoMarcador = (typeof TIPOS_MARCADOR)[number];

export const TIPOS_DOCUMENTO = ['acta_integral', 'resumen_simple', 'evaluacion_predictiva', 'reporte_diario'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const ESTADOS_DOCUMENTO = ['borrador', 'aprobado', 'firmado', 'archivado'] as const;
export type EstadoDocumento = (typeof ESTADOS_DOCUMENTO)[number];

export const MATERIAS_CANONICAS = [
  'penal',
  'civil',
  'laboral',
  'familia',
  'contencioso_administrativo',
  'adolescentes',
  'violencia',
] as const;
export type MateriaCanonica = (typeof MATERIAS_CANONICAS)[number];

export interface OrganoJudicialDTO {
  id: string;
  codigo: string; // ej. JPO-MGA-01
  nombre: string; // Juzgado Primero de Distrito Penal de Juicio de Managua
  circunscripcion: string; // Managua
  municipio: string;
  direccion?: string | null;
  activo: boolean;
  createdAt: string;
}

export interface SalaDTO {
  id: string;
  organoJudicialId: string;
  nombre: string; // Sala de Audiencias 3
  capacidad: number;
  ipMicrofono?: string | null;
  activa: boolean;
}

export interface MateriaDTO {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  color?: string | null;
}

export interface TipoAudienciaDTO {
  id: string;
  materiaId: string;
  codigo: string;
  nombre: string;
  duracionEstimadaMinutos: number;
}

export interface ExpedienteDTO {
  id: string;
  numero: string; // 001234-ORM4-2026-PN
  organoJudicialId: string;
  materiaId: string;
  anio: number;
  asunto: string;
  delitoOMotivo?: string | null;
  estado: string;
  createdAt: string;
  partes?: ParteProcesalDTO[];
}

export interface ParteProcesalDTO {
  id: string;
  expedienteId: string;
  audienciaId?: string | null;
  nombre: string;
  cedula?: string | null;
  rol: RolParte;
  institucion?: string | null;
  presente: boolean;
}

export interface AudienciaDTO {
  id: string;
  expedienteId: string;
  salaId: string;
  tipoAudienciaId: string;
  juezId: string;
  secretarioId?: string | null;
  operadorId?: string | null;
  fechaProgramada: string;
  horaInicioEstimada: string;
  horaFinEstimada: string;
  inicioEfectivo?: string | null;
  finEfectivo?: string | null;
  duracionSegundos?: number | null;
  estado: EstadoAudiencia;
  observaciones?: string | null;
  livekitRoomName: string;
  expediente?: ExpedienteDTO;
  sala?: SalaDTO;
  tipoAudiencia?: TipoAudienciaDTO;
  juez?: { id: string; nombre: string };
  partes?: ParteProcesalDTO[];
  grabacion?: GrabacionDTO | null;
  documentos?: DocumentoDTO[];
}

export interface GrabacionDTO {
  id: string;
  audienciaId: string;
  egressId?: string | null;
  s3Key: string;
  s3Bucket: string;
  s3SizeBytes?: number | null;
  sha256?: string | null;
  formato: 'ogg_opus';
  duracionSegundos?: number | null;
  sampleRate: number;
  canales: number;
  estado: 'grabando' | 'procesando' | 'completada' | 'error';
  urlAudio?: string;
  createdAt: string;
}

export interface MarcadorDTO {
  id: string;
  audienciaId: string;
  timestampMs: number;
  tipo: TipoMarcador;
  etiqueta: string;
  descripcion?: string | null;
  creadoPorId?: string | null;
  createdAt: string;
}

export interface TranscripcionSegmentoDTO {
  id: string;
  transcripcionId: string;
  inicioMs: number;
  finMs: number;
  texto: string;
  hablante?: string | null;
  confianza?: number | null;
}

export interface TranscripcionDTO {
  id: string;
  audienciaId: string;
  grabacionId: string;
  idioma: string;
  modelo: string;
  tiempoProcesamientoSegundos?: number | null;
  estado: 'pendiente' | 'procesando' | 'completada' | 'fallida';
  textoCompleto?: string | null;
  segmentos?: TranscripcionSegmentoDTO[];
  createdAt: string;
}

export interface EvaluacionPredictivaDTO {
  hechosClave: string[];
  balanceProbatorio: {
    acusacion: {
      argumentosFuertes: string[];
      debilidades: string[];
      elementosProbatoriosClave: string[];
    };
    defensa: {
      argumentosFuertes: string[];
      debilidades: string[];
      elementosProbatoriosClave: string[];
    };
  };
  pronostico: {
    falloMasProbable: 'condenatorio' | 'absolutorio' | 'mixto' | 'indeterminado';
    probabilidadEstimada: number; // 0..1
    nivelConfianza: 'alto' | 'medio' | 'bajo';
  };
  fundamentacion: string;
  articulosInvocadosOAplicables: string[];
  descargoLegal: string;
}

export interface DocumentoDTO {
  id: string;
  audienciaId: string;
  tipo: TipoDocumento;
  estado: EstadoDocumento;
  titulo: string;
  contenidoJson?: Record<string, unknown> | null;
  contenidoMarkdown?: string | null;
  s3KeyPdf?: string | null;
  sha256Pdf?: string | null;
  urlPdf?: string;
  version: number;
  creadoPorId?: string | null;
  aprobadoPorId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NodoCmsJerarquico {
  id: string;
  etiqueta: string;
  tipo: 'organo' | 'materia' | 'anio' | 'expediente' | 'audiencia' | 'mes' | 'dia' | 'hora';
  contadorHijos: number;
  metadata?: Record<string, unknown>;
  hijos?: NodoCmsJerarquico[];
}

export interface ReporteDiarioDTO {
  id: string;
  organoJudicialId: string;
  salaId?: string | null;
  fecha: string; // YYYY-MM-DD
  totalAudiencias: number;
  audienciasRealizadas: number;
  audienciasSuspendidas: number;
  audienciasCanceladas: number;
  duracionTotalMinutos: number;
  metricasJson: Record<string, unknown>;
  sintesisLlm?: string | null;
  s3KeyPdf?: string | null;
  createdAt: string;
}
