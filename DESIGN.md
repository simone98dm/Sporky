---
name: Sonic Depth
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc2d5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#988d9f'
  outline-variant: '#4c4353'
  surface-tint: '#ddb8ff'
  primary: '#ddb8ff'
  on-primary: '#490081'
  primary-container: '#711eba'
  on-primary-container: '#dab2ff'
  inverse-primary: '#8133ca'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c8c6c6'
  on-tertiary: '#303030'
  tertiary-container: '#505050'
  on-tertiary-container: '#c4c2c2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb8ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6709b0'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c8c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#474747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  card-gap: 24px
  section-margin: 48px
---

## Brand & Style

The design system is centered on a "Premium Dark Mode" aesthetic, designed to evoke the immersive feeling of a high-end audio studio. It targets music enthusiasts and data-driven listeners who value both aesthetic beauty and analytical depth.

The style merges **Minimalism** with **Glassmorphism**. It utilizes a deep, layered "Void" background strategy where depth is communicated through subtle shifts in dark values rather than heavy shadows. High-quality artist photography is treated as a primary UI element, often influencing the atmosphere through background blurs and tinted overlays. The emotional response is one of sophistication, focus, and rhythmic energy.

## Colors

The palette is built on a foundation of "absolute blacks" and "rich grays" to ensure the vibrant primary purple remains the undisputed focal point.

- **Primary Purple (#711EBA):** Reserved for high-intent actions, active states, and critical success indicators. It should never be used for large surfaces, only as an accent or interactive signal.
- **Surface Strategy:** The `background_canvas` (#121212) serves as the base layer. Interactive cards and containers use `surface_card` (#181818) to create subtle separation.
- **Glassmorphism:** Use semi-transparent versions of the secondary color (e.g., `#FFFFFF0D`) for glass overlays, paired with a heavy backdrop blur (20px+) to maintain legibility over vibrant album art.

## Typography

The system uses **Inter** for its systematic, clean, and highly legible characteristics. The type hierarchy relies on significant weight contrast to guide the eye.

- **Display Text:** Uses extra-bold weights and tighter letter spacing for a punchy, editorial feel on dashboards.
- **Labels:** Use uppercase for utility labels (e.g., "TOP GENRES" or time periods) to distinguish them from content.
- **Body Text:** Uses a slightly muted white (#B3B3B3) to reduce eye strain in high-contrast dark environments, while headlines remain pure white (#FFFFFF).

## Layout & Spacing

This design system utilizes a **Fluid Grid** approach with strict 8px incremental spacing to maintain rhythmic consistency.

- **Desktop:** 12-column grid with 24px gutters. Side navigation is fixed at 280px, with the main dashboard content flowing in the remaining space.
- **Mobile:** Single column with 16px margins.
- **Sectioning:** Content blocks are separated by 48px or 64px vertical margins to create "breathing room," emphasizing the premium, uncluttered nature of the app.

## Elevation & Depth

Elevation is achieved through color luminosity and **Glassmorphism** rather than traditional drop shadows.

- **Layer 0 (Canvas):** #121212.
- **Layer 1 (Cards):** #181818. Subtle 1px inner border (#FFFFFF1A) to define edges against the canvas.
- **Layer 2 (Floating/Glass):** Surfaces that float over content (like track detail modals or player bars) use a 60% opacity white fill with a `backdrop-filter: blur(24px)`.
- **Gradients:** Use soft, radial gradients (Primary Purple at 10% opacity) in the top-left corner of the canvas to suggest an ambient light source.

## Shapes

A "Rounded" shape language is used to soften the technical nature of data visualization.

- **Base Radius:** 8px for small components like buttons and inputs.
- **Large Radius:** 16px (rounded-lg) for content cards and imagery containers.
- **Extra Large Radius:** 24px (rounded-xl) for major container sections and modal wrappers.
- **Imagery:** Album art should always maintain a minimum 4px radius to avoid "sharp" corners that conflict with the overall UI.

## Iconography

Material Symbols Outlined, self-hosted as a subset (`scripts/icons.json`, regenerate with `yarn icons:subset`). Weight 400; `.fill` switches to the filled style for active and playback states. Size follows the text an icon sits beside, never the container:

- **16px (`text-base`):** inline with `body-sm` text: chart movement, legends, stat labels, inline confirmations.
- **20px (`text-xl`):** inside controls carrying 16px text: back links, text buttons, inputs, radio markers, small avatars.
- **24px (default):** navigation, standalone icon buttons, the brand mark, primary playback pills.
- **36px → 48px (`text-4xl md:text-5xl`):** empty states and illustrative panels; smaller on mobile so they don't outweigh the heading.

Sizes are the same on mobile and desktop below the display tier; touch comfort comes from the 44px minimum hit area, not a larger glyph.

## Components

- **Track Cards:** Utilize a vertical stack. Image at the top (16px radius), followed by title and artist. On hover, the background shifts to #282828 and a floating "Play" button (Primary Purple) appears.
- **Tabs (Time-Period Switchers):** Pill-shaped containers. Active state uses a #333333 background with white text; inactive uses transparent background with secondary text. No borders.
- **Primary Buttons:** High-contrast Purple (#711EBA) with white text, bold weight, and fully rounded (pill) ends.
- **Glassmorphic Player Bar:** Fixed to the bottom. Uses the backdrop-blur treatment. Controls are centered, with a progress bar that uses a subtle 2px height, turning purple on interaction.
- **Authentication States:** User profile images are circular (fully rounded) with a small purple status dot for "Online/Active" states.
- **Data Visualizations:** Charts should use Primary Purple for data lines/bars, with #535353 for grid lines to keep the focus on the metrics.
