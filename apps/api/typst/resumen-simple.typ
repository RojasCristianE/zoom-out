#import "base.typ": plantilla-judicial

#let organo = sys.inputs.at("organo", default: "Juzgado de Distrito Penal")
#let expediente = sys.inputs.at("expediente", default: "0000-2026-PN")
#let fecha = sys.inputs.at("fecha", default: "30 de Octubre de 2026")
#let asunto = sys.inputs.at("asunto", default: "Causa Penal")
#let resumen = sys.inputs.at("resumen", default: "Síntesis no disponible")
#let es-borrador = sys.inputs.at("esBorrador", default: "true") == "true"

#show: plantilla-judicial.with(
  titulo: "SÍNTESIS EJECUTIVA DE AUDIENCIA",
  subtitulo: "Resumen informativo simplificado",
  organo: organo,
  expediente: expediente,
  es-borrador: es-borrador,
)

#block(
  fill: rgb(240, 249, 255),
  inset: 10pt,
  radius: 4pt,
  stroke: 0.5pt + rgb(186, 230, 253),
  [
    *Expediente:* #expediente \
    *Causa:* #asunto \
    *Fecha:* #fecha
  ]
)

#v(1em)

#eval(resumen, mode: "markup")
