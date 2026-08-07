/* ── Kufuga color palette ───────────────────────────────────────────── */

export const green = {
  50: '#f0faf4',
  100: '#e5f3eb',
  200: '#c8e6d4',
  300: '#90d4a8',
  400: '#4fb87a',
  500: '#176b4d',
  600: '#145f43',
  700: '#173b2d',
  800: '#112c21',
  900: '#0c1f17',
} as const;

export const amber = {
  50: '#fefbf0',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#f59e0b',
  500: '#d97706',
  600: '#b45309',
  700: '#92400e',
  800: '#78350f',
  900: '#5c2d0a',
} as const;

export const red = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#ef4444',
  500: '#dc2626',
  600: '#c53030',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
} as const;

export const neutral = {
  50: '#f6faf8',
  100: '#eef4f0',
  200: '#dce9e2',
  300: '#b9d6c7',
  400: '#8db8a4',
  500: '#6b7d74',
  600: '#52635b',
  700: '#3d4a44',
  800: '#2a3430',
  900: '#1a2420',
} as const;

/* ── Semantic mappings ─────────────────────────────────────────────── */

export type Mode = 'light' | 'dark';

export const semantic = {
  light: {
    bg: neutral[50],
    surface: '#ffffff',
    surfaceHover: green[100],
    border: neutral[200],
    borderSubtle: neutral[100],
    text: green[700],
    textSecondary: neutral[500],
    textMuted: neutral[400],
    primary: green[500],
    primaryHover: '#12573f',
    primaryText: '#ffffff',
    accent: green[100],
  },
  dark: {
    bg: neutral[900],
    surface: neutral[800],
    surfaceHover: neutral[700],
    border: neutral[700],
    borderSubtle: neutral[800],
    text: neutral[100],
    textSecondary: neutral[400],
    textMuted: neutral[500],
    primary: green[400],
    primaryHover: green[300],
    primaryText: green[900],
    accent: green[800],
  },
} as const;

export type SemanticColors = { [K in keyof (typeof semantic)['light']]: string };
