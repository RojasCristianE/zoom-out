---
name: Zoom-Out
colors:
  bg: "#030303"
  surface: "#0a0a0f"
  surface-glass: "rgba(18, 18, 26, 0.7)"
  border: "rgba(255, 255, 255, 0.08)"
  border-bright: "rgba(255, 255, 255, 0.15)"
  text: "#f4f4f5"
  text-muted: "#a1a1aa"
  primary: "#6366f1"
  primary-glow: "rgba(99, 102, 241, 0.5)"
  primary-hover: "#818cf8"
  danger: "#f43f5e"
  success: "#10b981"
  background-hsl: "hsl(240, 10%, 3.9%)"
  foreground-hsl: "hsl(0, 0%, 98%)"
  card-hsl: "hsl(240, 10%, 3.9%)"
  card-foreground-hsl: "hsl(0, 0%, 98%)"
  popover-hsl: "hsl(240, 10%, 3.9%)"
  popover-foreground-hsl: "hsl(0, 0%, 98%)"
  secondary-hsl: "hsl(240, 3.7%, 15.9%)"
  secondary-foreground-hsl: "hsl(0, 0%, 98%)"
  muted-hsl: "hsl(240, 3.7%, 15.9%)"
  muted-foreground-hsl: "hsl(240, 5%, 64.9%)"
  accent-hsl: "hsl(240, 3.7%, 15.9%)"
  accent-foreground-hsl: "hsl(0, 0%, 98%)"
  destructive-hsl: "hsl(0, 62.8%, 30.6%)"
  destructive-foreground-hsl: "hsl(0, 0%, 98%)"
  ring-hsl: "hsl(240, 4.9%, 83.9%)"
typography:
  font-sans: "'Inter', system-ui, -apple-system, sans-serif"
rounded:
  DEFAULT: "0.5rem"
shadows:
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
components:
  glass:
    backgroundColor: "{colors.surface-glass}"
    backdropFilter: "blur(12px)"
    border: "1px solid {colors.border}"
    rounded: "{rounded.DEFAULT}"
    boxShadow: "{shadows.lg}"
  glass-hover:
    borderColor: "{colors.border-bright}"
    backgroundColor: "rgba(18, 18, 26, 0.8)"
    transition: "all 0.3s ease"
  page-center:
    display: "flex"
    flexDirection: "column"
    alignItems: "center"
    justifyContent: "center"
    minHeight: "100vh"
    gap: "1.5rem"
    padding: "2rem"
---

## Brand & Style
Zoom-Out uses a dark, immersive theme featuring a "Glassmorphism" aesthetic mixed with high-tech radial gradients. The UI aims to convey depth and modernity, suited for a highly interactive and real-time application like a P2P/SFU video system. It balances deep blacks and vibrant neon accents (indigo and emerald) to maintain a dynamic and energetic visual hierarchy.

## Colors
The palette relies heavily on an ultra-dark canvas `#030303` overlaid with subtle glowing radial gradients to create an atmospheric depth.
- **Backgrounds:** Pitch black `#030303` with glowing radial accents (`rgba(99, 102, 241, 0.1)` and `rgba(16, 185, 129, 0.05)`).
- **Surfaces:** Dark grey-blue `#0a0a0f` and translucent glass `rgba(18, 18, 26, 0.7)` give a layered feel.
- **Accents:** Indigo `#6366f1` serves as the primary action color, combined with an ethereal glow `rgba(99, 102, 241, 0.5)`.
- **Text:** High-contrast off-white `#f4f4f5` ensures readability on dark backgrounds, with muted text at `#a1a1aa`.

## Typography
The system uses the modern, geometric sans-serif **Inter** for clean and legible data display.
- **Primary Font:** Inter, falling back to system sans-serif.

## Layout & Spacing
The layout centers its content dynamically, using flexbox for structured, responsive alignment.
- **Rhythm:** `page-center` layout relies on a flex column with a consistent `1.5rem` (24px) gap and `2rem` (32px) padding, ensuring elements are never too clustered.

## Elevation & Depth
Depth is created through glass effects and soft, expansive shadows.
- **Glassmorphism:** Elements use a 12px background blur paired with a translucent background and a 1px subtle white border (`rgba(255, 255, 255, 0.08)`).
- **Shadows:** A large, soft shadow (`0 10px 15px -3px rgba(0, 0, 0, 0.5)`) helps float the glass panels above the radiant background.
- **Interaction:** Hovering over a glass element increases opacity and border brightness (`rgba(255, 255, 255, 0.15)`), giving a tactile, physical response to user input.
