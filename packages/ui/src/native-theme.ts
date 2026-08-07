/* ── React Native theme factory ─────────────────────────────────────── */

import { green, amber, red, neutral, semantic, type Mode, type SemanticColors } from './tokens/colors.js';
import { statusColor, statusMutedColor, type StatusLevel } from './tokens/status.js';
import { fontFamilyNative } from './tokens/typography.js';
import { typeScaleMobile } from './tokens/typography.js';
import { spacing } from './tokens/spacing.js';
import { radii } from './tokens/radii.js';
import { shadowsNative } from './tokens/shadows.js';

export type { StatusLevel } from './tokens/status.js';

export interface NativeTheme {
  mode: Mode;
  colors: SemanticColors;
  status: (level: StatusLevel) => { fg: string; bg: string; icon: string; border: string };
  statusMuted: (level: StatusLevel) => { fg: string; bg: string };
  palette: { green: typeof green; amber: typeof amber; red: typeof red; neutral: typeof neutral };
  font: typeof fontFamilyNative;
  type: typeof typeScaleMobile;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadowsNative;
}

export function createTheme(mode: Mode): NativeTheme {
  return {
    mode,
    colors: semantic[mode],
    status: (level: StatusLevel) => statusColor(level, mode),
    statusMuted: (level: StatusLevel) => statusMutedColor(level, mode),
    palette: { green, amber, red, neutral },
    font: fontFamilyNative,
    type: typeScaleMobile,
    spacing,
    radii,
    shadows: shadowsNative,
  };
}

const navFonts = {
  regular: { fontFamily: 'System' as const, fontWeight: '400' as const },
  medium: { fontFamily: 'System' as const, fontWeight: '500' as const },
  bold: { fontFamily: 'System' as const, fontWeight: '600' as const },
  heavy: { fontFamily: 'System' as const, fontWeight: '700' as const },
};

/** React Navigation theme for dark mode */
export const navigationDarkTheme = {
  dark: true as const,
  colors: {
    primary: green[400],
    background: neutral[900],
    card: neutral[800],
    text: neutral[100],
    border: neutral[700],
    notification: red[400],
  },
  fonts: navFonts,
};

/** React Navigation theme for light mode */
export const navigationLightTheme = {
  dark: false as const,
  colors: {
    primary: green[500],
    background: neutral[50],
    card: '#ffffff',
    text: green[700],
    border: neutral[200],
    notification: red[500],
  },
  fonts: navFonts,
};
