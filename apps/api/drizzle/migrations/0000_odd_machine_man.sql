CREATE TYPE "public"."estado_audiencia" AS ENUM('programada', 'en_curso', 'en_pausa', 'finalizada', 'cancelada', 'reprogramada');--> statement-breakpoint
CREATE TYPE "public"."estado_documento" AS ENUM('borrador', 'aprobado', 'firmado', 'archivado');--> statement-breakpoint
CREATE TYPE "public"."estado_grabacion" AS ENUM('grabando', 'procesando', 'completada', 'error');--> statement-breakpoint
CREATE TYPE "public"."estado_transcripcion" AS ENUM('pendiente', 'procesando', 'completada', 'fallida');--> statement-breakpoint
CREATE TYPE "public"."rol_parte" AS ENUM('juez', 'secretario', 'fiscal', 'defensor', 'acusado', 'victima', 'querellante', 'testigo', 'perito', 'operador');--> statement-breakpoint
CREATE TYPE "public"."rol_usuario" AS ENUM('admin', 'juez', 'secretario', 'operador', 'consulta');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento" AS ENUM('acta_integral', 'resumen_simple', 'evaluacion_predictiva', 'reporte_diario');--> statement-breakpoint
CREATE TYPE "public"."tipo_marcador" AS ENUM('apertura', 'alegato_inicial_acusacion', 'alegato_inicial_defensa', 'declaracion_imputado', 'prueba_testifical', 'prueba_pericial', 'prueba_documental', 'incidente', 'objecion', 'receso', 'alegato_final_acusacion', 'alegato_final_defensa', 'derecho_ultima_palabra', 'fallo', 'cierre', 'otro');--> statement-breakpoint
CREATE TABLE "audiencias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expediente_id" uuid NOT NULL,
	"sala_id" uuid NOT NULL,
	"tipo_audiencia_id" uuid NOT NULL,
	"juez_id" uuid NOT NULL,
	"secretario_id" uuid,
	"operador_id" uuid,
	"fecha_programada" date NOT NULL,
	"hora_inicio_estimada" time NOT NULL,
	"hora_fin_estimada" time NOT NULL,
	"inicio_efectivo" timestamp with time zone,
	"fin_efectivo" timestamp with time zone,
	"duracion_segundos" integer,
	"estado" "estado_audiencia" DEFAULT 'programada' NOT NULL,
	"observaciones" text,
	"livekit_room_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "audiencias_livekit_room_name_unique" UNIQUE("livekit_room_name")
);
--> statement-breakpoint
CREATE TABLE "auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"accion" text NOT NULL,
	"recurso_tipo" text NOT NULL,
	"recurso_id" uuid NOT NULL,
	"ip_origen" text,
	"user_agent" text,
	"detalles" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audiencia_id" uuid NOT NULL,
	"tipo" "tipo_documento" NOT NULL,
	"estado" "estado_documento" DEFAULT 'borrador' NOT NULL,
	"titulo" text NOT NULL,
	"contenido_json" jsonb,
	"contenido_markdown" text,
	"s3_key_pdf" text,
	"sha256_pdf" text,
	"version" integer DEFAULT 1 NOT NULL,
	"creado_por_id" uuid,
	"aprobado_por_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expedientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" text NOT NULL,
	"organo_judicial_id" uuid NOT NULL,
	"materia_id" uuid NOT NULL,
	"anio" integer NOT NULL,
	"asunto" text NOT NULL,
	"delito_o_motivo" text,
	"estado" text DEFAULT 'activo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expedientes_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "grabaciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audiencia_id" uuid NOT NULL,
	"egress_id" text,
	"s3_key" text NOT NULL,
	"s3_bucket" text DEFAULT 'audiencias' NOT NULL,
	"s3_size_bytes" bigint,
	"sha256" text,
	"formato" text DEFAULT 'ogg_opus' NOT NULL,
	"duracion_segundos" integer,
	"sample_rate" integer DEFAULT 48000 NOT NULL,
	"canales" integer DEFAULT 1 NOT NULL,
	"estado" "estado_grabacion" DEFAULT 'grabando' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "grabaciones_audiencia_id_unique" UNIQUE("audiencia_id")
);
--> statement-breakpoint
CREATE TABLE "marcadores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audiencia_id" uuid NOT NULL,
	"timestamp_ms" integer NOT NULL,
	"tipo" "tipo_marcador" NOT NULL,
	"etiqueta" text NOT NULL,
	"descripcion" text,
	"creado_por_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"color" text DEFAULT '#2563eb',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "materias_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "organos_judiciales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"circunscripcion" text DEFAULT 'Managua' NOT NULL,
	"municipio" text DEFAULT 'Managua' NOT NULL,
	"direccion" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organos_judiciales_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "partes_procesales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expediente_id" uuid NOT NULL,
	"audiencia_id" uuid,
	"nombre" text NOT NULL,
	"cedula" text,
	"rol" "rol_parte" NOT NULL,
	"institucion" text,
	"presente" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "reportes_diarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organo_judicial_id" uuid NOT NULL,
	"sala_id" uuid,
	"fecha" date NOT NULL,
	"total_audiencias" integer DEFAULT 0 NOT NULL,
	"audiencias_realizadas" integer DEFAULT 0 NOT NULL,
	"audiencias_suspendidas" integer DEFAULT 0 NOT NULL,
	"audiencias_canceladas" integer DEFAULT 0 NOT NULL,
	"duracion_total_minutos" integer DEFAULT 0 NOT NULL,
	"metricas_json" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sintesis_llm" text,
	"s3_key_pdf" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "salas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organo_judicial_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"capacidad" integer DEFAULT 20 NOT NULL,
	"ip_microfono" text,
	"activa" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tipos_audiencia" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"materia_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"duracion_estimada_minutos" integer DEFAULT 60 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcripcion_segmentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transcripcion_id" uuid NOT NULL,
	"inicio_ms" integer NOT NULL,
	"fin_ms" integer NOT NULL,
	"texto" text NOT NULL,
	"hablante" text,
	"confianza" integer
);
--> statement-breakpoint
CREATE TABLE "transcripciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audiencia_id" uuid NOT NULL,
	"grabacion_id" uuid NOT NULL,
	"idioma" text DEFAULT 'es' NOT NULL,
	"modelo" text DEFAULT 'large-v3-turbo' NOT NULL,
	"tiempo_procesamiento_segundos" integer,
	"estado" "estado_transcripcion" DEFAULT 'pendiente' NOT NULL,
	"texto_completo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transcripciones_audiencia_id_unique" UNIQUE("audiencia_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organo_judicial_id" uuid,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text NOT NULL,
	"role" "rol_usuario" DEFAULT 'consulta' NOT NULL,
	"avatar_url" text,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_sala_id_salas_id_fk" FOREIGN KEY ("sala_id") REFERENCES "public"."salas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_tipo_audiencia_id_tipos_audiencia_id_fk" FOREIGN KEY ("tipo_audiencia_id") REFERENCES "public"."tipos_audiencia"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_juez_id_users_id_fk" FOREIGN KEY ("juez_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_secretario_id_users_id_fk" FOREIGN KEY ("secretario_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiencias" ADD CONSTRAINT "audiencias_operador_id_users_id_fk" FOREIGN KEY ("operador_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_audiencia_id_audiencias_id_fk" FOREIGN KEY ("audiencia_id") REFERENCES "public"."audiencias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_creado_por_id_users_id_fk" FOREIGN KEY ("creado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_aprobado_por_id_users_id_fk" FOREIGN KEY ("aprobado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_organo_judicial_id_organos_judiciales_id_fk" FOREIGN KEY ("organo_judicial_id") REFERENCES "public"."organos_judiciales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expedientes" ADD CONSTRAINT "expedientes_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grabaciones" ADD CONSTRAINT "grabaciones_audiencia_id_audiencias_id_fk" FOREIGN KEY ("audiencia_id") REFERENCES "public"."audiencias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marcadores" ADD CONSTRAINT "marcadores_audiencia_id_audiencias_id_fk" FOREIGN KEY ("audiencia_id") REFERENCES "public"."audiencias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marcadores" ADD CONSTRAINT "marcadores_creado_por_id_users_id_fk" FOREIGN KEY ("creado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partes_procesales" ADD CONSTRAINT "partes_procesales_expediente_id_expedientes_id_fk" FOREIGN KEY ("expediente_id") REFERENCES "public"."expedientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partes_procesales" ADD CONSTRAINT "partes_procesales_audiencia_id_audiencias_id_fk" FOREIGN KEY ("audiencia_id") REFERENCES "public"."audiencias"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_diarios" ADD CONSTRAINT "reportes_diarios_organo_judicial_id_organos_judiciales_id_fk" FOREIGN KEY ("organo_judicial_id") REFERENCES "public"."organos_judiciales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reportes_diarios" ADD CONSTRAINT "reportes_diarios_sala_id_salas_id_fk" FOREIGN KEY ("sala_id") REFERENCES "public"."salas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "salas" ADD CONSTRAINT "salas_organo_judicial_id_organos_judiciales_id_fk" FOREIGN KEY ("organo_judicial_id") REFERENCES "public"."organos_judiciales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tipos_audiencia" ADD CONSTRAINT "tipos_audiencia_materia_id_materias_id_fk" FOREIGN KEY ("materia_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripcion_segmentos" ADD CONSTRAINT "transcripcion_segmentos_transcripcion_id_transcripciones_id_fk" FOREIGN KEY ("transcripcion_id") REFERENCES "public"."transcripciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripciones" ADD CONSTRAINT "transcripciones_audiencia_id_audiencias_id_fk" FOREIGN KEY ("audiencia_id") REFERENCES "public"."audiencias"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripciones" ADD CONSTRAINT "transcripciones_grabacion_id_grabaciones_id_fk" FOREIGN KEY ("grabacion_id") REFERENCES "public"."grabaciones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organo_judicial_id_organos_judiciales_id_fk" FOREIGN KEY ("organo_judicial_id") REFERENCES "public"."organos_judiciales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audiencias_fecha" ON "audiencias" USING btree ("fecha_programada");--> statement-breakpoint
CREATE INDEX "idx_audiencias_sala" ON "audiencias" USING btree ("sala_id");--> statement-breakpoint
CREATE INDEX "idx_audiencias_juez" ON "audiencias" USING btree ("juez_id");--> statement-breakpoint
CREATE INDEX "idx_auditoria_recurso" ON "auditoria" USING btree ("recurso_tipo","recurso_id");--> statement-breakpoint
CREATE INDEX "idx_auditoria_usuario" ON "auditoria" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_documentos_audiencia" ON "documentos" USING btree ("audiencia_id");--> statement-breakpoint
CREATE INDEX "idx_documentos_tipo" ON "documentos" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "idx_expedientes_anio" ON "expedientes" USING btree ("anio");--> statement-breakpoint
CREATE INDEX "idx_expedientes_organo" ON "expedientes" USING btree ("organo_judicial_id");--> statement-breakpoint
CREATE INDEX "idx_marcadores_audiencia_ts" ON "marcadores" USING btree ("audiencia_id","timestamp_ms");--> statement-breakpoint
CREATE INDEX "idx_partes_expediente" ON "partes_procesales" USING btree ("expediente_id");--> statement-breakpoint
CREATE INDEX "idx_partes_audiencia" ON "partes_procesales" USING btree ("audiencia_id");--> statement-breakpoint
CREATE INDEX "idx_reportes_organo_fecha" ON "reportes_diarios" USING btree ("organo_judicial_id","fecha");--> statement-breakpoint
CREATE INDEX "idx_segmentos_transcripcion" ON "transcripcion_segmentos" USING btree ("transcripcion_id");--> statement-breakpoint
CREATE INDEX "idx_segmentos_fts" ON "transcripcion_segmentos" USING gin (to_tsvector('spanish', "texto"));