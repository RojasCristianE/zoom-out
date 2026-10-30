#import "base.typ": plantilla-judicial

#let organo = sys.inputs.at("organo", default: "Juzgado de Distrito Penal")
#let expediente = sys.inputs.at("expediente", default: "0000-2026-PN")
#let juez = sys.inputs.at("juez", default: "Juez Titular")
#let secretario = sys.inputs.at("secretario", default: "Secretario de Actuaciones")
#let fecha = sys.inputs.at("fecha", default: "30 de Octubre de 2026")
#let hora-inicio = sys.inputs.at("horaInicio", default: "09:00")
#let hora-fin = sys.inputs.at("horaFin", default: "11:30")
#let asunto = sys.inputs.at("asunto", default: "Causa Penal")
#let contenido = sys.inputs.at("contenido", default: "Desarrollo de la audiencia...")
#let es-borrador = sys.inputs.at("esBorrador", default: "true") == "true"

#show: plantilla-judicial.with(
  titulo: "ACTA DE AUDIENCIA JUDICIAL",
  subtitulo: "En el marco de la Ley N° 406 (Código Procesal Penal de la República de Nicaragua)",
  organo: organo,
  expediente: expediente,
  es-borrador: es-borrador,
)

#block(
  fill: rgb(245, 247, 250),
  inset: 10pt,
  radius: 4pt,
  stroke: 0.5pt + rgb(210, 215, 225),
  [
    *Expediente Judicial Único:* #expediente \
    *Causa:* #asunto \
    *Fecha y Hora:* #fecha, desde las #hora-inicio hasta las #hora-fin horas \
    *Juez que Preside:* #juez \
    *Secretario de Sala:* #secretario
  ]
)

#v(1em)

== I. APERTURA Y COMPARECENCIA
En la ciudad de Managua, República de Nicaragua, en la fecha y hora indicadas, constituido el tribunal en audiencia oral y pública bajo las solemnidades de ley.

== II. DESARROLLO DE LA AUDIENCIA Y ALEGATOS
#eval(contenido, mode: "markup")

== III. CIERRE
No habiendo más asuntos que ventilar, la autoridad judicial da por finalizada la presente sesión, procediéndose a su grabación de audio digital y levantamiento de la presente acta.

#v(2.5cm)

#grid(
  columns: (1fr, 1fr),
  align: center,
  [
    #line(length: 6cm, stroke: 0.5pt)
    #juez \
    *Juez de Distrito Penal*
  ],
  [
    #line(length: 6cm, stroke: 0.5pt)
    #secretario \
    *Secretario Judicial*
  ]
)
