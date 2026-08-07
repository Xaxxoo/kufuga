/* ── Typography tokens ─────────────────────────────────────────────── */

export const fontFamily = {
  display: '"DM Sans", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
} as const;

export const fontFamilyNative = {
  display: 'DMSans-Bold',
  displayMedium: 'DMSans-Medium',
  displayBlack: 'DMSans-Black',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
} as const;

interface TypeStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: string;
  fontFamily: 'display' | 'body';
}

export const typeScale = {
  display: { fontSize: 48, lineHeight: 52, fontWeight: '900', fontFamily: 'display' as const },
  'heading-1': { fontSize: 36, lineHeight: 40, fontWeight: '800', fontFamily: 'display' as const },
  'heading-2': { fontSize: 24, lineHeight: 32, fontWeight: '700', fontFamily: 'display' as const },
  'heading-3': { fontSize: 20, lineHeight: 28, fontWeight: '700', fontFamily: 'display' as const },
  'body-lg': { fontSize: 18, lineHeight: 28, fontWeight: '400', fontFamily: 'body' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', fontFamily: 'body' as const },
  'body-sm': { fontSize: 14, lineHeight: 20, fontWeight: '400', fontFamily: 'body' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', fontFamily: 'body' as const },
} as const;

export const typeScaleMobile = {
  display: { fontSize: 36, lineHeight: 40, fontWeight: '900', fontFamily: 'display' as const },
  'heading-1': { fontSize: 28, lineHeight: 34, fontWeight: '800', fontFamily: 'display' as const },
  'heading-2': { fontSize: 21, lineHeight: 28, fontWeight: '700', fontFamily: 'display' as const },
  'heading-3': { fontSize: 18, lineHeight: 24, fontWeight: '700', fontFamily: 'display' as const },
  'body-lg': { fontSize: 17, lineHeight: 26, fontWeight: '400', fontFamily: 'body' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400', fontFamily: 'body' as const },
  'body-sm': { fontSize: 14, lineHeight: 20, fontWeight: '400', fontFamily: 'body' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', fontFamily: 'body' as const },
} as const;

export type TypeVariant = keyof typeof typeScale;
