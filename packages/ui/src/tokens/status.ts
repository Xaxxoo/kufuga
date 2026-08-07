/* ── Status color helper ───────────────────────────────────────────── */

import type { Mode } from './colors.js';

export type StatusLevel = 'safe' | 'warn' | 'danger';

const statusMap = {
  light: {
    safe:   { fg: '#146b43', bg: '#d1f2e0', icon: '#146b43', border: '#4fb87a' },
    warn:   { fg: '#b45309', bg: '#fef3c7', icon: '#b45309', border: '#f59e0b' },
    danger: { fg: '#b91c1c', bg: '#fee2e2', icon: '#b91c1c', border: '#ef4444' },
  },
  dark: {
    safe:   { fg: '#6ee7b7', bg: '#064e3b', icon: '#6ee7b7', border: '#4fb87a' },
    warn:   { fg: '#fcd34d', bg: '#78350f', icon: '#fcd34d', border: '#f59e0b' },
    danger: { fg: '#fca5a5', bg: '#7f1d1d', icon: '#fca5a5', border: '#ef4444' },
  },
} as const;

/** Muted status colors for acknowledged / dismissed states */
const statusMutedMap = {
  light: {
    safe:   { fg: '#52635b', bg: '#f0faf4' },
    warn:   { fg: '#92400e', bg: '#fefbf0' },
    danger: { fg: '#991b1b', bg: '#fef2f2' },
  },
  dark: {
    safe:   { fg: '#8db8a4', bg: '#112c21' },
    warn:   { fg: '#fde68a', bg: '#5c2d0a' },
    danger: { fg: '#fecaca', bg: '#991b1b' },
  },
} as const;

export function statusColor(status: StatusLevel, mode: Mode = 'light') {
  return statusMap[mode][status];
}

export function statusMutedColor(status: StatusLevel, mode: Mode = 'light') {
  return statusMutedMap[mode][status];
}

/** All status foreground/background pairs for WCAG testing */
export const statusPairs = {
  'safe-fg-on-white': { fg: '#146b43', bg: '#ffffff' },
  'safe-fg-on-safeBg': { fg: '#146b43', bg: '#d1f2e0' },
  'warn-fg-on-white': { fg: '#b45309', bg: '#ffffff' },
  'warn-fg-on-warnBg': { fg: '#b45309', bg: '#fef3c7' },
  'danger-fg-on-white': { fg: '#b91c1c', bg: '#ffffff' },
  'danger-fg-on-dangerBg': { fg: '#b91c1c', bg: '#fee2e2' },
  /* Muted pairs (acknowledged states) */
  'safe-muted-fg-on-mutedBg': { fg: '#52635b', bg: '#f0faf4' },
  'warn-muted-fg-on-mutedBg': { fg: '#92400e', bg: '#fefbf0' },
  'danger-muted-fg-on-mutedBg': { fg: '#991b1b', bg: '#fef2f2' },
} as const;
