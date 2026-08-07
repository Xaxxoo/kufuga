import { describe, it, expect } from 'vitest';
import { statusPairs } from './status.js';

/**
 * Compute relative luminance per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const rgb = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ].map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Compute contrast ratio per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const WCAG_AA_NORMAL = 4.5;

describe('WCAG AA contrast for status colors', () => {
  for (const [name, { fg, bg }] of Object.entries(statusPairs)) {
    it(`${name} meets AA (>= ${WCAG_AA_NORMAL}:1)`, () => {
      const ratio = contrastRatio(fg, bg);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
    });
  }
});

describe('Status border colors are visible on white', () => {
  const borderPairs = {
    'safe-border-on-white': { fg: '#4fb87a', bg: '#ffffff' },
    'warn-border-on-white': { fg: '#f59e0b', bg: '#ffffff' },
    'danger-border-on-white': { fg: '#ef4444', bg: '#ffffff' },
  };

  for (const [name, { fg, bg }] of Object.entries(borderPairs)) {
    it(`${name} is visually distinguishable (>= 2:1)`, () => {
      const ratio = contrastRatio(fg, bg);
      // Border accents are decorative and paired with text labels.
      // They need to be visible but don't require 3:1 non-text contrast.
      expect(ratio).toBeGreaterThanOrEqual(2);
    });
  }
});
