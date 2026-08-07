# Kufuga Design System

Design tokens and guidelines for the Kufuga poultry-monitoring platform.

## Brand

Warm, trustworthy, agricultural-modern. Kufuga monitors poultry environments -- the visual language should feel reliable, calm in normal operation, and clearly urgent when conditions require attention.

**Typefaces:** DM Sans (headings -- personality, warmth) + Inter (body -- clarity, readability).
**Palette:** Earthy moss green primary, amber for warmth/warning, red for danger. Green-tinted neutrals.

---

## Color Palette

### Green (Primary / Brand)

| Token | Hex | Usage |
|-------|-----|-------|
| green-50 | `#f0faf4` | Lightest backgrounds, safe muted bg |
| green-100 | `#e5f3eb` | Accent backgrounds (mint) |
| green-200 | `#c8e6d4` | Light borders |
| green-300 | `#90d4a8` | Decorative, dark-mode primary hover |
| green-400 | `#4fb87a` | Dark mode primary, status safe border |
| green-500 | `#176b4d` | Primary actions (moss) |
| green-600 | `#145f43` | Hover states |
| green-700 | `#173b2d` | Primary text (ink) |
| green-800 | `#112c21` | Dark backgrounds |
| green-900 | `#0c1f17` | Deepest dark |

### Amber (Warmth / Warning)

| Token | Hex | Usage |
|-------|-----|-------|
| amber-50 | `#fefbf0` | Lightest amber bg, warn muted bg |
| amber-100 | `#fef3c7` | Warning background |
| amber-400 | `#f59e0b` | Warning border accent |
| amber-500 | `#d97706` | Warning icon/text |
| amber-600 | `#b45309` | Warning text (AA compliant) |
| amber-700 | `#92400e` | Warning muted foreground |

### Red (Danger)

| Token | Hex | Usage |
|-------|-----|-------|
| red-50 | `#fef2f2` | Danger muted bg |
| red-100 | `#fee2e2` | Danger background |
| red-400 | `#ef4444` | Danger border accent |
| red-600 | `#c53030` | Danger text/icon |
| red-700 | `#b91c1c` | Danger foreground |
| red-800 | `#991b1b` | Danger muted foreground |

### Neutral (Warm green-tinted grays)

| Token | Hex | Usage |
|-------|-----|-------|
| neutral-50 | `#f6faf8` | Page background |
| neutral-100 | `#eef4f0` | Subtle borders |
| neutral-200 | `#dce9e2` | Borders (line) |
| neutral-300 | `#b9d6c7` | Muted borders |
| neutral-400 | `#8db8a4` | Muted text |
| neutral-500 | `#6b7d74` | Secondary text, safe muted fg |
| neutral-700 | `#3d4a44` | Dark mode borders |
| neutral-800 | `#2a3430` | Dark mode surface |
| neutral-900 | `#1a2420` | Dark mode background |

---

## Semantic Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| bg | neutral-50 | neutral-900 | Page background |
| surface | white | neutral-800 | Card/panel background |
| surfaceHover | green-100 | neutral-700 | Hover state |
| border | neutral-200 | neutral-700 | Card borders |
| borderSubtle | neutral-100 | neutral-800 | Subtle dividers |
| text | green-700 | neutral-100 | Primary text |
| textSecondary | neutral-500 | neutral-400 | Supporting text |
| textMuted | neutral-400 | neutral-500 | De-emphasized text |
| primary | green-500 | green-400 | Buttons, links |
| primaryHover | #12573f | green-300 | Hover state |
| primaryText | white | green-900 | Text on primary |
| accent | green-100 | green-800 | Accent backgrounds |

---

## Status Colors

Three levels: **safe** (normal operation), **warn** (approaching threshold), **danger** (threshold breached / offline).

Each level provides: `fg`, `bg`, `icon`, `border` in both light and dark modes.

| Status | Foreground | Background | Border | Usage |
|--------|-----------|------------|--------|-------|
| Safe | `#146b43` | `#d1f2e0` | `#4fb87a` | Normal readings |
| Warn | `#b45309` | `#fef3c7` | `#f59e0b` | Approaching threshold |
| Danger | `#b91c1c` | `#fee2e2` | `#ef4444` | Threshold breached |

### Muted Variants (Acknowledged States)

| Status | Muted fg | Muted bg | Usage |
|--------|----------|----------|-------|
| Safe | `#6b7d74` | `#f0faf4` | Acknowledged safe alerts |
| Warn | `#92400e` | `#fefbf0` | Acknowledged warnings |
| Danger | `#991b1b` | `#fef2f2` | Acknowledged dangers |

### Usage Rules
- **Border treatment:** Use `border` for left-border card accents (4px solid) to indicate status at a glance.
- **Badges:** `bg` + `fg` for inline status chips.
- **Muted:** Use for acknowledged alerts that remain visible but de-emphasized.
- Cards: white background + colored left border. Don't fill entire card with status color.
- `statusColor('safe' | 'warn' | 'danger', 'light' | 'dark')` returns `{ fg, bg, icon, border }`.
- `statusMutedColor('safe' | 'warn' | 'danger', 'light' | 'dark')` returns `{ fg, bg }`.

---

## Typography

### Fonts

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Display | DM Sans | 500-900 | Headings, logos, hero text |
| Body | Inter | 400-700 | Body text, UI labels |

### Scale (Web / Mobile)

| Variant | Web Size | Mobile Size | Weight | Font |
|---------|----------|-------------|--------|------|
| display | 48px | 36px | 900 | Display |
| heading-1 | 36px | 28px | 800 | Display |
| heading-2 | 24px | 21px | 700 | Display |
| heading-3 | 20px | 18px | 700 | Display |
| body-lg | 18px | 17px | 400 | Body |
| body | 16px | 16px | 400 | Body |
| body-sm | 14px | 14px | 400 | Body |
| caption | 12px | 12px | 500 | Body |

Minimum body text: 16px for sunlight readability on mobile.

**Web:** Loaded via `next/font/google` in layout.tsx.
**Mobile:** Loaded via `expo-font` in App.tsx.

---

## Spacing

4px base unit. Scale: 0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96px.

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 6px | Small pills, badges |
| md | 8px | Buttons, inputs |
| lg | 12px | Cards, containers |
| xl | 16px | Large cards |
| 2xl | 20px | Hero elements |
| 3xl | 24px | Dashboard cards |
| full | 9999px | Circular elements, pills |

---

## Shadows

Green-tinted shadows using `rgba(23,107,77,...)`:

| Token | Usage |
|-------|-------|
| sm | Subtle card elevation |
| md | Default card shadow |
| lg | Elevated cards, dropdowns |
| xl | Modals, hero elements |

---

## Dark Mode

### Web (CSS Custom Properties)

Light values on `:root`, dark on `.dark`. Tailwind colors reference `var(--color-xxx)` so utility classes auto-adapt. Toggle via `darkMode: 'class'` in Tailwind config. Toggle stored in `localStorage`.

### Mobile (React Context)

`useColorScheme()` detects system preference. User override stored in settings Zustand store. `ThemeProvider` calls `createTheme('light'|'dark')` and provides via context. Screens access via `useTheme()` hook.

React Navigation themes provided by `navigationLightTheme` and `navigationDarkTheme` exports.

---

## Accessibility

- All status text/background pairs verified WCAG AA (>= 4.5:1), including muted variants
- Minimum touch target: 44px (mobile), 48px for primary actions
- Minimum body text: 16px (mobile)
- `focus-visible` rings on all interactive web elements referencing `--color-primary`
- `accessibilityLabel` on all mobile pressables
- `accessibilityRole` on mobile buttons
- `aria-label` on web icon buttons
- `role="status"` on live-updating badge counts
- Charts include accessible text summaries

---

## Shared Formatters

Import from `@kufuga/ui/format`:

| Function | Example Output |
|----------|---------------|
| `formatTemp(28.4)` | `28.4°C` |
| `formatHumidity(63)` | `63%` |
| `formatPpm(18)` | `18 ppm` |
| `formatPercent(94.2)` | `94.2%` |
| `formatRelativeTime(ts)` | `2 min ago` |
| `formatDate(ts)` | `4 Aug 2026` |
| `formatDateTime(ts)` | `4 Aug 2026, 14:30` |

All screens should import these instead of using inline `.toFixed()` or `toLocaleString()`.

---

## Component Patterns

### Cards
- White/surface background with subtle border
- Status indicated via 4px colored left border (not background fill)
- `shadow-sm` default, `shadow-md` on hover
- `border-radius: lg` (12px)

### Buttons
- Primary: moss green bg, white text, `border-radius: md`
- Pressed: opacity 0.85
- Loading: spinner replaces text
- Focus: `focus-visible` ring using primary color
- Destructive: red outline variant

### Badges
- Rounded pill with status bg + fg colors
- Muted variant for acknowledged states
- Icons: checkmark (safe), triangle (warn), circle-x (danger)

### Empty States
- Centered icon + title + subtitle + optional action button
- Calm, helpful tone ("No houses monitored yet")

### Error States
- Error icon + message + retry button
- Brief, actionable language

### Skeleton Loaders
- Animated opacity pulse (0.3 -> 1.0)
- Three variants: card, chart, row
