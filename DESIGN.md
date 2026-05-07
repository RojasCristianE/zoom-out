---
name: Zoom-Out "Aether"
colors:
  canvas: "#000000"
  surface: "#0A0A0A"
  surface-hover: "#121212"
  border: "rgba(255, 255, 255, 0.08)"
  border-highlight: "rgba(255, 255, 255, 0.15)"
  text-primary: "#FAFAFA"
  text-secondary: "#A1A1AA"
  action-primary: "#FFFFFF"
  action-primary-text: "#000000"
  action-secondary: "rgba(255, 255, 255, 0.05)"
  error: "#ef4444"
shadows:
  inner-light: "inset 0 1px 0 rgba(255, 255, 255, 0.05)"
  glow-subtle: "0 0 40px rgba(255, 255, 255, 0.03)"
  elevated: "0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
typography:
  font-sans: "'Inter', system-ui, sans-serif"
  display:
    letterSpacing: "-0.04em"
    fontWeight: "600"
  body:
    letterSpacing: "normal"
    fontWeight: "400"
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  full: "9999px"
---

# Zoom-Out: Lenguaje de Diseño "Aether"

Este lenguaje de diseño abandona las convenciones estándar de "botones azules" y "paneles grises" para abrazar una estética verdaderamente moderna, táctil y de alta gama. Inspirado en el diseño de software de vanguardia, "Aether" utiliza la ausencia de color y la precisión de la luz para crear una experiencia profundamente inmersiva y elegante.

## Filosofía: Lujo Monocromático y Mecanizado
- **Ausencia de Ruido**: El lienzo es negro puro (`#000000`). Esto no es solo "modo oscuro"; es un vacío intencional que hace que el contenido del video parezca flotar sin límites.
- **Luz Direccional**: En lugar de depender de sombras oscuras (que no se ven sobre fondo negro), usamos "luces internas" (`inset shadows`) para simular que los componentes tienen bordes biselados capturando la luz desde arriba.
- **Alto Contraste Monocromático**: Las acciones primarias no son de colores brillantes; son blancas puras con texto negro. Esto crea un nivel de sofisticación y urgencia visual que el azul clásico (estilo Bootstrap) no puede lograr.

## Componentes Clave

### El Lienzo y las Superficies
El fondo de la aplicación es `canvas` (#000000). Las tarjetas y modales no flotan visiblemente a través de sombras de caída, sino que se diferencian por estar ligeramente "levantadas" mediante un fondo de `#0A0A0A`, un borde ultrafino de `rgba(255, 255, 255, 0.08)`, y una luz cenital de `inset 0 1px 0 rgba(255, 255, 255, 0.05)`.

### Tipografía Refinada
El texto no es simplemente blanco. Los títulos principales usan un tracking ajustado (`-0.04em`) y el texto primario es `#FAFAFA`. El texto secundario cae significativamente en contraste a `#A1A1AA` (Zinc 400) para crear una jerarquía indiscutible. La tipografía ajustada es el sello de un producto digital premium.

### Acciones (Botones)
- **Primaria**: Un bloque sólido de luz. Fondo `#FFFFFF`, texto `#000000`, sin bordes. Hover: reducción mínima de opacidad.
- **Secundaria / Fantasma**: Fondo transparente o extremadamente sutil (`rgba(255, 255, 255, 0.05)`), dependiente del borde sutil y un brillo interno al interactuar.

## Emoción
"Aether" se siente profesional, definitivo, costoso y rápido. Al remover el azul genérico y los grises medios lavados, la interfaz se siente menos como una "página web corporativa" y más como una herramienta profesional de nivel de hardware, perfecta para infraestructura de video.
