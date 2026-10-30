-- Habilitar extensión btree_gist para soportar exclusión de rangos temporales y llaves foráneas
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint

-- Evitar solapamiento de audiencias en la misma sala para audiencias activas o programadas
-- Construye una marca temporal aproximada combinando fecha_programada con hora_inicio y hora_fin
ALTER TABLE "audiencias"
ADD CONSTRAINT "no_solape_audiencia_sala"
EXCLUDE USING gist (
  "sala_id" WITH =,
  tsrange(
    ("fecha_programada"::text || ' ' || "hora_inicio_estimada"::text)::timestamp,
    ("fecha_programada"::text || ' ' || "hora_fin_estimada"::text)::timestamp,
    '[)'
  ) WITH &&
)
WHERE ("estado" IN ('programada', 'en_curso', 'en_pausa'));
