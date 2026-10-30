#import "base.typ": plantilla-judicial

#let organo = sys.inputs.at("organo", default: "Juzgado de Distrito Penal")
#let expediente = sys.inputs.at("expediente", default: "0000-2026-PN")
#let asunto = sys.inputs.at("asunto", default: "Causa Penal")
#let fallo = sys.inputs.at("fallo", default: "Indeterminado")
#let probabilidad = sys.inputs.at("probabilidad", default: "0.0")
#let confianza = sys.inputs.at("confianza", default: "Media")
#let fundamentacion = sys.inputs.at("fundamentacion", default: "Análisis preliminar.")
#let descargo = sys.inputs.at("descargo", default: "AVISO: Documento orientativo.")

#show: plantilla-judicial.with(
  titulo: "EVALUACIÓN PREDICTIVA ASISTIDA POR IA",
  subtitulo: "Análisis preliminar reservado exclusivamente para la autoridad judicial",
  organo: organo,
  expediente: expediente,
  es-borrador: false,
)

#block(
  fill: rgb(254, 242, 242),
  inset: 10pt,
  radius: 4pt,
  stroke: 1pt + rgb(239, 68, 68),
  [
    #text(weight: "bold", fill: rgb(185, 28, 28))[#descargo]
  ]
)

#v(1em)

== I. PRONÓSTICO DE RESOLUCIÓN MÁS PROBABLE
#grid(
  columns: (1fr, 1fr, 1fr),
  [ *Sentido:* #upper(fallo) ],
  [ *Probabilidad:* #probabilidad ],
  [ *Confianza:* #upper(confianza) ]
)

== II. FUNDAMENTACIÓN TÉCNICO-PROCESAL (LEY N° 406)
#fundamentacion
