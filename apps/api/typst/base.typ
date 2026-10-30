// Plantilla base para documentos judiciales de la República de Nicaragua
#let plantilla-judicial(
  titulo: "",
  subtitulo: "",
  organo: "",
  expediente: "",
  es-borrador: true,
  cuerpo
) = {
  set document(title: titulo, author: "Poder Judicial de Nicaragua")
  set page(
    paper: "us-letter",
    margin: (x: 2.5cm, top: 3cm, bottom: 2.5cm),
    header: align(center)[
      #text(size: 9pt, weight: "bold", tracking: 0.5pt)[REPÚBLICA DE NICARAGUA] \
      #text(size: 8pt, weight: "medium")[PODER JUDICIAL] \
      #text(size: 8.5pt, style: "italic")[#organo]
      #line(length: 100%, stroke: 0.5pt + luma(120))
    ],
    footer: context [
      #let page-num = counter(page).display()
      #line(length: 100%, stroke: 0.5pt + luma(180))
      #grid(
        columns: (1fr, 1fr),
        align: (left, right),
        text(size: 7.5pt, fill: luma(100))[Expediente: #expediente],
        text(size: 7.5pt, fill: luma(100))[Página #page-num]
      )
    ],
    background: if es-borrador {
      rotate(45deg)[
        #text(size: 55pt, fill: rgb(230, 230, 230, 120), weight: "bold")[
          BORRADOR — IA
        ]
      ]
    } else { none }
  )

  set text(font: "Liberation Serif", size: 10.5pt, lang: "es")
  set par(justify: true, leading: 0.75em, first-line-indent: 1.5em)

  v(0.5cm)
  align(center)[
    #text(size: 13pt, weight: "bold")[#titulo] \
    #if subtitulo != "" {
      text(size: 10.5pt, weight: "medium", style: "italic")[#subtitulo]
    }
  ]
  v(0.5cm)

  cuerpo
}
