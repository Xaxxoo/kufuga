/* ── Tailwind preset for Kufuga ─────────────────────────────────────── */

import { green, amber, red, neutral } from './tokens/colors.js';
import { shadows } from './tokens/shadows.js';
import { fontFamily } from './tokens/typography.js';

/**
 * CSS custom-property-based color function for dark-mode switching.
 * Colors reference `var(--color-xxx)` so `.dark` class swaps values.
 */
function cssVar(name: string) {
  return `var(--color-${name})`;
}

const preset = {
  darkMode: 'class' as const,
  theme: {
    extend: {
      colors: {
        /* Palette scales */
        green,
        amber,
        red,
        neutral,
        /* Semantic (CSS custom property references) */
        bg: cssVar('bg'),
        surface: cssVar('surface'),
        'surface-hover': cssVar('surface-hover'),
        border: cssVar('border'),
        'border-subtle': cssVar('border-subtle'),
        ink: cssVar('text'),
        'text-secondary': cssVar('text-secondary'),
        'text-muted': cssVar('text-muted'),
        moss: cssVar('primary'),
        'primary-hover': cssVar('primary-hover'),
        mint: cssVar('accent'),
        line: cssVar('border'),
        /* Status semantic colors */
        'status-safe': cssVar('status-safe'),
        'status-safe-bg': cssVar('status-safe-bg'),
        'status-safe-border': cssVar('status-safe-border'),
        'status-warn': cssVar('status-warn'),
        'status-warn-bg': cssVar('status-warn-bg'),
        'status-warn-border': cssVar('status-warn-border'),
        'status-danger': cssVar('status-danger'),
        'status-danger-bg': cssVar('status-danger-bg'),
        'status-danger-border': cssVar('status-danger-border'),
        /* Status muted (acknowledged) */
        'status-safe-muted': cssVar('status-safe-muted'),
        'status-safe-muted-bg': cssVar('status-safe-muted-bg'),
        'status-warn-muted': cssVar('status-warn-muted'),
        'status-warn-muted-bg': cssVar('status-warn-muted-bg'),
        'status-danger-muted': cssVar('status-danger-muted'),
        'status-danger-muted-bg': cssVar('status-danger-muted-bg'),
      },
      fontFamily: {
        display: [fontFamily.display],
        body: [fontFamily.body],
      },
      boxShadow: {
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      ringColor: {
        DEFAULT: cssVar('primary'),
      },
      outlineColor: {
        DEFAULT: cssVar('primary'),
      },
    },
  },
};

export default preset;

/** CSS custom property declarations for :root (light) and .dark */
export const cssVariables = {
  light: {
    '--color-bg': neutral[50],
    '--color-surface': '#ffffff',
    '--color-surface-hover': green[100],
    '--color-border': neutral[200],
    '--color-border-subtle': neutral[100],
    '--color-text': green[700],
    '--color-text-secondary': neutral[500],
    '--color-text-muted': neutral[400],
    '--color-primary': green[500],
    '--color-primary-hover': '#12573f',
    '--color-accent': green[100],
    '--color-status-safe': '#146b43',
    '--color-status-safe-bg': '#d1f2e0',
    '--color-status-safe-border': '#4fb87a',
    '--color-status-warn': '#b45309',
    '--color-status-warn-bg': '#fef3c7',
    '--color-status-warn-border': '#f59e0b',
    '--color-status-danger': '#b91c1c',
    '--color-status-danger-bg': '#fee2e2',
    '--color-status-danger-border': '#ef4444',
    '--color-status-safe-muted': '#52635b',
    '--color-status-safe-muted-bg': '#f0faf4',
    '--color-status-warn-muted': '#92400e',
    '--color-status-warn-muted-bg': '#fefbf0',
    '--color-status-danger-muted': '#991b1b',
    '--color-status-danger-muted-bg': '#fef2f2',
  },
  dark: {
    '--color-bg': neutral[900],
    '--color-surface': neutral[800],
    '--color-surface-hover': neutral[700],
    '--color-border': neutral[700],
    '--color-border-subtle': neutral[800],
    '--color-text': neutral[100],
    '--color-text-secondary': neutral[400],
    '--color-text-muted': neutral[500],
    '--color-primary': green[400],
    '--color-primary-hover': green[300],
    '--color-accent': green[800],
    '--color-status-safe': '#6ee7b7',
    '--color-status-safe-bg': '#064e3b',
    '--color-status-safe-border': '#4fb87a',
    '--color-status-warn': '#fcd34d',
    '--color-status-warn-bg': '#78350f',
    '--color-status-warn-border': '#f59e0b',
    '--color-status-danger': '#fca5a5',
    '--color-status-danger-bg': '#7f1d1d',
    '--color-status-danger-border': '#ef4444',
    '--color-status-safe-muted': '#8db8a4',
    '--color-status-safe-muted-bg': '#112c21',
    '--color-status-warn-muted': '#fde68a',
    '--color-status-warn-muted-bg': '#5c2d0a',
    '--color-status-danger-muted': '#fecaca',
    '--color-status-danger-muted-bg': '#991b1b',
  },
} as const;
