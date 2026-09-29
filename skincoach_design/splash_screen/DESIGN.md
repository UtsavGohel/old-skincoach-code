---
name: Organic Vitality
colors:
  surface: '#f9faf7'
  surface-dim: '#d9dad8'
  surface-bright: '#f9faf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f1'
  surface-container: '#edeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#404845'
  inverse-surface: '#2e3130'
  inverse-on-surface: '#f0f1ef'
  outline: '#717975'
  outline-variant: '#c0c8c4'
  surface-tint: '#3a675b'
  primary: '#386458'
  on-primary: '#ffffff'
  primary-container: '#507d70'
  on-primary-container: '#f4fffa'
  inverse-primary: '#a1d0c1'
  secondary: '#3f665b'
  on-secondary: '#ffffff'
  secondary-container: '#c1ecde'
  on-secondary-container: '#456c61'
  tertiary: '#46615b'
  on-tertiary: '#ffffff'
  tertiary-container: '#5f7a73'
  on-tertiary-container: '#f4fffa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bdeddd'
  primary-fixed-dim: '#a1d0c1'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#214e43'
  secondary-fixed: '#c1ecde'
  secondary-fixed-dim: '#a6cfc2'
  on-secondary-fixed: '#002019'
  on-secondary-fixed-variant: '#274e44'
  tertiary-fixed: '#cbe9e0'
  tertiary-fixed-dim: '#afcdc5'
  on-tertiary-fixed: '#04201b'
  on-tertiary-fixed-variant: '#314c46'
  background: '#f9faf7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e0'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
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
  container-margin-mobile: 20px
  container-margin-desktop: 40px
  gutter: 16px
  section-gap: 48px
  card-padding: 24px
---

## Brand & Style
The design system is rooted in **Organic Minimalism**, a style that bridges the gap between high-end skincare boutiques and advanced biometric technology. It avoids the cold, sterile aesthetic of clinical apps in favor of a warm, human-centric experience. 

The target audience seeks a premium, ritualistic approach to their skin health. The UI must evoke a sense of calm, clarity, and "digital breathability." Influenced by the editorial layouts of premium wellness brands, the design prioritizes high-quality lifestyle imagery over technical charts. Every interaction should feel intentional and serene, utilizing "Airy" whitespace to prevent cognitive load. The emotional response is one of being cared for by a sophisticated, quiet companion rather than a diagnostic tool.

## Colors
The palette is a curated selection of botanical greens and mineral tones.
- **Primary Sage (#5E8B7E)**: Used for key actions and brand presence. It represents growth and balance.
- **Primary Dark (#456C61)**: Reserved for high-contrast typography and deep emphasis to ensure legibility without using pure blacks.
- **Soft Sage & Mint**: These function as background washes for chips, progress indicators, and subtle highlights.
- **Warm Cream & Secondary Background**: These provide the "canvas." Pure white is reserved exclusively for elevated floating cards to create a sense of physical layering and depth.

## Typography
The typography system uses a pairing of **Plus Jakarta Sans** for headlines to provide a soft, modern geometric feel, and **Manrope** for body text to maintain high legibility and a refined, professional tone. 

- **Titles**: Use `display-lg` for welcome screens and `headline-lg` for primary views. Headlines should use "Primary Dark" for maximum authority.
- **Hierarchy**: Emphasize hierarchy through generous line heights (1.5x for body) and wide letter spacing on labels to create an "editorial" look.
- **Mobile scaling**: Large display titles should scale down on mobile to ensure content remains above the fold.

## Layout & Spacing
The layout follows a **Fluid-Fixed Hybrid** model. On mobile, a standard 4-column grid is used with 20px side margins. On desktop, content is constrained to a maximum width of 1200px to maintain a premium "magazine" feel.

- **Vertical Rhythm**: Use 48px or 64px gaps between major sections to emphasize the "airy" quality.
- **Padding**: Internal card padding is generous (24px) to ensure content never feels cramped.
- **Alignment**: Center-align display content for onboarding and "hero" moments; use left-alignment for data-heavy health tracking views.

## Elevation & Depth
The design system employs **Tonal Layering** combined with **Ambient Shadows**. 
- **Level 0 (Background)**: Warm Cream (#FBFAF7) acts as the base.
- **Level 1 (Secondary Background)**: F6F4EF is used for inset areas or grouping secondary content.
- **Level 2 (Cards)**: Pure White (#FFFFFF) cards float above the background.
- **Shadows**: Use very soft, long-spread shadows (Blur: 30px, Y-Offset: 10px) at low opacity (4-6% black or primary-dark tint). Avoid harsh borders; the depth should be perceived through the subtle contrast between white surfaces and cream backgrounds.

## Shapes
The shape language is defined by significant **roundedness (24px)**, creating a friendly and approachable feel. 
- **Cards & Containers**: Apply 24px (`rounded-xl`) consistently to all main surface containers.
- **Buttons**: Use large, pill-shaped buttons for primary actions to make them feel "squishy" and touch-friendly.
- **Images**: Lifestyle photography should also feature rounded corners to match the UI elements, maintaining the soft visual narrative.

## Components
- **Primary Buttons**: Pill-shaped, Primary Sage background with White text. Height should be 56px for a premium feel.
- **Floating Cards**: Pure White, 24px corner radius, subtle ambient shadow. Used for health metrics and AI insights.
- **Input Fields**: Soft Sage (#A7C4BC) borders at 1px, or filled with Accent Soft Mint (#DDEEE8) at low opacity. Never use harsh black borders.
- **Progress Rings**: Use the Primary Sage for the "active" path and Accent Soft Mint for the "track," with rounded caps to mirror the shape language.
- **Icons**: Thin-stroke (1.5pt to 2pt) rounded outline icons. Avoid solid fills unless an icon is in an "active" state in the navigation bar.
- **Lifestyle Media**: Use "Natural Lighting" photography. Images should have a slight warmth to match the Warm Cream background.
- **Chips**: Small, pill-shaped tags using the Accent Soft Mint background and Primary Dark text for categorization (e.g., "Oily," "Morning Routine").