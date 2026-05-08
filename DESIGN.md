---
version: 1
theme:
  colors:
    background: "#000000"
    foreground: "#fafafa"
    card: "#0a0a0a"
    card-foreground: "#fafafa"
    primary: "#ffffff"
    primary-foreground: "#000000"
    secondary: "rgba(255, 255, 255, 0.05)"
    secondary-foreground: "#fafafa"
    muted: "#121212"
    muted-foreground: "#a1a1aa"
    border: "rgba(255, 255, 255, 0.08)"
    ring: "rgba(255, 255, 255, 0.15)"
    success: "#10b981"
    error: "#ef4444"
    sidebar: "hsl(240 5.9% 10%)"
    sidebar-foreground: "hsl(240 4.8% 95.9%)"
    sidebar-primary: "hsl(224.3 76.3% 48%)"
    sidebar-primary-foreground: "hsl(0 0% 100%)"
    sidebar-accent: "hsl(240 3.7% 15.9%)"
    sidebar-accent-foreground: "hsl(240 4.8% 95.9%)"
    sidebar-border: "hsl(240 3.7% 15.9%)"
    sidebar-ring: "hsl(217.2 91.2% 59.8%)"
  typography:
    fonts:
      sans: "Inter, system-ui, sans-serif"
    sizes:
      xs: "0.75rem"
      sm: "0.875rem"
      base: "1rem"
      lg: "1.125rem"
      xl: "1.25rem"
      2xl: "1.5rem"
      3xl: "1.875rem"
      4xl: "2.25rem"
      5xl: "3rem"
  spacing:
    1: "0.25rem"
    2: "0.5rem"
    3: "0.75rem"
    4: "1rem"
    6: "1.5rem"
    8: "2rem"
    10: "2.5rem"
    12: "3rem"
    16: "4rem"
  radii:
    sm: "6px"
    md: "12px"
    lg: "16px"
    full: "9999px"
  shadows:
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    glow: "0 0 20px rgba(255, 255, 255, 0.1)"
  motion:
    fast: "150ms ease-in-out"
    normal: "300ms ease-in-out"
    slow: "500ms ease-in-out"
    spotlight: "2s ease .75s 1 forwards"
---

# Zoom-Out "Aether" Design System

The Zoom-Out platform utilizes the "Aether" aesthetic—a premium, highly immersive visual language tailored for modern administrative and video-streaming interfaces. Aether prioritizes deep contrast, spatial hierarchy, and subtle dynamic lighting to guide user focus without causing cognitive overload.

## Visual Identity

Aether is strictly a **dark-mode-first** design system. It avoids harsh lines in favor of depth and dimension, using true black (`#000000`) for foundational backgrounds to make foreground elements visually "float".

- **Contrast & Depth**: Pure white (`#ffffff`) is reserved strictly for primary actions and active text, creating an ultra-high contrast against the pure black canvas. Muted grays (`#121212`) and translucent borders (`rgba(255, 255, 255, 0.08)`) separate structural areas seamlessly.
- **Glassmorphism**: UI layers rely on structural translucency and backdrop blurs to establish hierarchy without drawing solid borders.

## Layout & Spatial Organization

- **Bento Grid Structures**: Information dashboards (like the Control Center) are organized using Bento Grids. This pattern compartmentalizes complex data—such as live SFU network metrics, room states, and user access tables—into digestible, distinct "cards" that conform to a rigid, predictable scale.
- **Fluid Padding & Spacing**: Elements maintain comfortable breathing room. Dense data tables are padded generously, ensuring readability on both high-density desktop displays and mobile viewports.

## Motion & Interaction (Aceternity)

Aether feels "alive" through the strategic use of ambient micro-animations that don't interfere with task execution.

- **Spotlight Effects**: Headers and focal points utilize animated, soft-edge spotlights that draw the eye dynamically upon initial render.
- **Background Beams**: Ambient, slowly shifting gradient beams provide a sense of continuous underlying data flow, reflecting the real-time nature of the P2P/SFU video system.
- **Hover States**: Interactive elements (like Bento Grid items or Sidebar links) feature subtle translations (`translate-x-2` on hover) and refined drop-shadows, ensuring tactile feedback without jarring layout shifts.

## Typography

The system exclusively uses **Inter** (and systemic sans-serif fallbacks). 

- **Headers**: Capitalized, tightly tracked (`tracking-tighter`), and heavily weighted (`font-black`) to exude technical authority.
- **Subtitles & Labels**: Muted colors (`text-muted-foreground/60`), heavily spaced (`tracking-widest`), and uppercase to simulate terminal/dashboard interfaces.
- **Body**: Highly legible, prioritizing readability for dense operational data.

## Color Semantics

- **Primary**: Pure white for maximum visibility on critical paths.
- **Background/Surface**: Pure black for the abyss, dark gray for elevated surfaces (cards, sidebars).
- **Status (Success/Error)**: Standardized semantic colors (`#10b981` / `#ef4444`) applied sparingly for system alerts, network latency indicators, and destructive actions.
