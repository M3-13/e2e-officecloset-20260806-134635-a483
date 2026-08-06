# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Hollywood-Red-Carpet-Ästhetik: tiefes Schwarz/Dunkelgrau als Samtvorhang-Basis, warmes Burgunderrot für Tiefe, echtes Gold als glamouröser Akzent. Playfair-Display-Serifen für Headlines (Kinoplakat-Feeling), Inter für klare Lesbarkeit. Großzügige Kacheln mit weichem Schattenwurf, dezente Fades, kein Schnickschnack.

## Colors

- `--color-bg`: **#0D0D0D**
- `--color-bg_elevated`: **#1A1A1A**
- `--color-bg_card`: **#222222**
- `--color-fg`: **#F0EDE8**
- `--color-fg_muted`: **#9E9A94**
- `--color-accent`: **#C9A84C**
- `--color-accent_hover`: **#DCBB5A**
- `--color-accent_active`: **#B8942F**
- `--color-burgundy`: **#6B1D2A**
- `--color-burgundy_light`: **#8B2536**
- `--color-burgundy_surface`: **#2D1520**
- `--color-border`: **#333333**
- `--color-border_light`: **#444444**
- `--color-success`: **#4CAF50**
- `--color-error`: **#CF6679**
- `--color-gradient_dark_start`: **#0D0D0D**
- `--color-gradient_dark_end`: **#1A1118**

## Typography

- `font_family`: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- `heading_font_family`: 'Playfair Display', 'Times New Roman', Georgia, serif
- `heading_weight`: 700
- `body_weight`: 400
- `body_size`: 16px
- `heading_size_scale`: h1: 2.5rem; h2: 1.875rem; h3: 1.5rem; h4: 1.25rem

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px
- `--space-7`: 64px
- `--space-8`: 96px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

padding 12px 24px, radius md (8px), font-weight 600, letter-spacing 0.02em, min-height 44px (mobile tap target), transition all 0.2s ease. Variants: (1) Primary — bg=accent(#C9A84C), color=bg(#0D0D0D), border none; hover bg=accent_hover(#DCBB5A), transform scale(1.02); active bg=accent_active(#B8942F), scale(0.98); disabled opacity 0.4, cursor not-allowed. (2) Secondary — bg transparent, color=accent(#C9A84C), border 1.5px solid accent; hover bg=accent at 8% opacity; active bg=accent at 14% opacity. (3) Danger — bg=error(#CF6679), color=#FFFFFF; hover bg=#D97F8E; active bg=#BA5768.

### Input

padding 12px 16px, radius md (8px), bg=bg_elevated(#1A1A1A), border 1.5px solid border(#333333), color=fg(#F0EDE8), font-size 16px (prevents iOS zoom), transition border-color 0.2s ease. Focus: border-color=accent(#C9A84C), box-shadow 0 0 0 3px rgba(201,168,76,0.2). Placeholder: color=fg_muted(#9E9A94). Error state: border-color=error(#CF6679). Disabled: opacity 0.5, bg=bg(#0D0D0D). Label: font-size 14px, font-weight 500, color=fg_muted, margin-bottom 6px.

### Card (Kleidungsstück-Kachel)

bg=bg_card(#222222), radius lg(16px), overflow hidden, box-shadow 0 4px 20px rgba(0,0,0,0.5), transition all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94). Hover: box-shadow 0 8px 32px rgba(201,168,76,0.12), transform translateY(-2px), border 1px solid border_light(#444444). Image area: aspect-ratio 3/4, object-fit cover, bg=bg_elevated(#1A1A1A). Meta: padding 12px 16px, name font-weight 600 color fg, category font-size 13px color fg_muted. Delete/Edit overlay icons appear on hover with fade transition.

### Modal / Detailansicht

Overlay: bg rgba(0,0,0,0.75), backdrop-filter blur(4px). Modal panel: bg=bg_card(#222222), radius lg(16px), max-width 720px, padding 32px, box-shadow 0 16px 64px rgba(0,0,0,0.8). Close button: top-right 16px, 44×44px touch target, icon color=fg_muted, hover color=fg. Image: full-width, radius md, max-height 60vh, object-fit contain. Meta section margin-top 24px. Action buttons row: flex row, gap 12px, justify-end.

### Navigation Bar

bg=bg(#0D0D0D), border-bottom 1px solid border(#333333), height 64px, padding 0 32px, display flex, align-items center, position sticky top 0, z-index 100. Logo/App-Name: font-family heading, font-size 1.5rem, color=accent(#C9A84C), letter-spacing 0.03em. Nav-Links: display flex, gap 24px, color=fg_muted, font-weight 500, font-size 15px. Active link: color=accent, subtle gold underline (2px, animated from left). User-Menu: avatar circle 36px, dropdown on click with logout option.

### Outfit-Creator Layout

Two-column grid: left panel 320px (flexible min 280px), right panel fr 1. Gap 24px. Left panel (Wardrobe Picker): bg=bg_elevated(#1A1A1A), radius lg, padding 20px, max-height calc(100vh - 96px), overflow-y auto. Category headers: font-family heading, font-size 1.1rem, color=accent, margin 16px 0 8px. Item rows: flex row, gap 8px, each thumbnail 64×64px, radius md, border 2px transparent, cursor pointer, selected border-color=accent, hover border-color=border_light. Right panel (Outfit Stage): bg subtle radial gradient from bg_card to bg, radius lg, padding 32px, min-height 500px, display flex, flex-direction column, align-items center, justify-content center. Silhouette/Placeholder area: dashed border 2px border, radius md, padding 48px, color=fg_muted. Added items stack vertically with 8px gap, each 120px tall with thumbnail + name label. Save button: anchored bottom-right.

### Login / Register Card

Full-page centered layout. Background: linear-gradient(160deg, #0D0D0D 0%, #1A1118 50%, #2D1520 100%), optional subtle noise/grain overlay at 3% opacity. Card: bg=bg_card(#222222), radius lg(16px), padding 48px 40px, max-width 440px, width 90vw, box-shadow 0 24px 80px rgba(0,0,0,0.7), border 1px solid border(#333333). App name at top: heading font, 2rem, color=accent, text-align center, letter-spacing 0.04em. Subtitle: color=fg_muted, text-align center, margin-bottom 32px. Input fields: stacked with 20px gap. Submit button: full-width, margin-top 24px. Switch-mode link: text-align center, margin-top 20px, color=fg_muted, link color=accent.

### Filter / Tab Bar (Garderobe)

display flex, gap 4px, padding 4px, bg=bg_elevated(#1A1A1A), radius pill(999px), width fit-content, margin-bottom 24px. Individual tab: padding 8px 20px, radius pill, font-size 14px, font-weight 500, color=fg_muted, cursor pointer, transition all 0.2s ease. Active tab: bg=accent(#C9A84C), color=bg(#0D0D0D). Hover (inactive): bg=rgba(255,255,255,0.06). Count badge: font-size 12px, bg=burgundy, color=fg, radius pill, padding 2px 8px, margin-left 6px.

### Empty State

display flex, flex-direction column, align-items center, justify-content center, padding 64px 32px, color=fg_muted. Icon: 64×64px, opacity 0.3, margin-bottom 16px (e.g. elegant outlined hanger or wardrobe icon). Heading: font-family heading, font-size 1.5rem, color=fg_muted. Description text: font-size 16px, max-width 360px, text-align center, margin-bottom 24px. CTA button: primary variant.

### Toast / Notification

position fixed, bottom 24px, right 24px, padding 14px 20px, radius md, font-size 14px, font-weight 500, box-shadow 0 8px 24px rgba(0,0,0,0.6), z-index 1000, animation fadeInUp 0.3s ease. Success: bg=#1B3A1B, border 1px solid success(#4CAF50), color=#A5D6A7. Error: bg=#3A1B1B, border 1px solid error(#CF6679), color=#EF9A9A. Info: bg=#1A2A3A, border 1px solid accent(#C9A84C), color=#FFE082.

## Layout Principles

- Container max-width: 1280px, centered with auto margins, horizontal padding 24px (16px on tablet).
- Breakpoints: Desktop ≥1024px, Tablet 768–1023px (nav collapses, two-column stacks), Mobile <768px (single column, full-width cards, reduced padding 16px).
- Grid system: CSS Grid for card galleries — auto-fill mit minmax(220px, 1fr), gap 24px (Desktop), 16px (Tablet).
- Vertical rhythm: sections separated by 48px (Desktop) / 32px (Tablet). Card lists use 24px gap.
- Typography hierarchy: Page titles h1 (heading font, 2.5rem, color=accent). Section headers h2 (heading font, 1.875rem, color=fg). Card titles 16px semi-bold. Body text 16px/1.6 line-height.
- Page structure: Sticky Nav (top) → Main content (padding-top 32px, min-height calc(100vh - 64px)) → optional subtle footer.
- Animations: Page transitions — fade 0.25s ease. Card hover — 0.3s cubic-bezier. Modal open/close — scale+fade 0.2s ease-out. Subtle, never distracting.
- Accessibility: All interactive elements ≥44px touch target. Focus-visible ring 3px accent on all focusable elements. Color contrast ratios ≥4.5:1 for body text, ≥3:1 for large text.
