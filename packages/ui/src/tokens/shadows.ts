/* ── Green-tinted shadow definitions ──────────────────────────────── */

export const shadows = {
  sm: '0 1px 2px 0 rgba(23,107,77,0.05)',
  md: '0 4px 6px -1px rgba(23,107,77,0.08), 0 2px 4px -2px rgba(23,107,77,0.05)',
  lg: '0 10px 15px -3px rgba(23,107,77,0.08), 0 4px 6px -4px rgba(23,107,77,0.04)',
  xl: '0 20px 25px -5px rgba(23,107,77,0.10), 0 8px 10px -6px rgba(23,107,77,0.05)',
} as const;

export const shadowsNative = {
  sm: { shadowColor: '#176b4d', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#176b4d', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  lg: { shadowColor: '#176b4d', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 6 },
  xl: { shadowColor: '#176b4d', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.10, shadowRadius: 25, elevation: 10 },
} as const;

export type ShadowKey = keyof typeof shadows;
