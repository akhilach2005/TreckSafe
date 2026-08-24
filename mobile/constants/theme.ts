/**
 * TrailSafe Design Tokens
 * Central theme configuration for consistent styling.
 */

export const COLORS = {
  // Backgrounds
  background:     '#0f172a',   // slate-900 — main screen background
  surface:        '#1e293b',   // slate-800 — card/panel background
  surfaceAlt:     '#293548',   // slightly lighter card variant
  border:         '#334155',   // slate-700 — subtle borders

  // Text
  textPrimary:    '#f8fafc',   // slate-50
  textSecondary:  '#94a3b8',   // slate-400
  textMuted:      '#64748b',   // slate-500

  // Accent
  accent:         '#6366f1',   // indigo-500
  accentLight:    '#818cf8',   // indigo-400

  // Risk level colours
  low:            '#22c55e',   // green-500
  lowBg:          '#14532d',   // green-900
  moderate:       '#f59e0b',   // amber-500
  moderateBg:     '#78350f',   // amber-900
  high:           '#ef4444',   // red-500
  highBg:         '#7f1d1d',   // red-900
  veryHigh:       '#dc2626',   // red-600
  veryHighBg:     '#450a0a',   // even darker red

  // Utility
  white:          '#ffffff',
  error:          '#f87171',   // red-400
  success:        '#4ade80',   // green-400
};

export const FONTS = {
  regular:  'System',
  medium:   'System',
  bold:     'System',
};

export const SPACING = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
};

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const TYPOGRAPHY = {
  hero:    { fontSize: 48, fontWeight: '800' as const, letterSpacing: -1 },
  h1:      { fontSize: 28, fontWeight: '700' as const },
  h2:      { fontSize: 22, fontWeight: '700' as const },
  h3:      { fontSize: 18, fontWeight: '600' as const },
  body:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd:  { fontSize: 15, fontWeight: '400' as const },
  label:   { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0.5 },
  caption: { fontSize: 12, fontWeight: '400' as const },
};

/**
 * Returns the colour set for a given risk level.
 */
export function getRiskColors(riskLevel: string): { text: string; bg: string } {
  switch (riskLevel) {
    case 'LOW':       return { text: COLORS.low,      bg: COLORS.lowBg };
    case 'MODERATE':  return { text: COLORS.moderate,  bg: COLORS.moderateBg };
    case 'HIGH':      return { text: COLORS.high,      bg: COLORS.highBg };
    case 'VERY_HIGH': return { text: COLORS.veryHigh,  bg: COLORS.veryHighBg };
    default:          return { text: COLORS.textMuted, bg: COLORS.surface };
  }
}

export function getRiskLabel(riskLevel: string): string {
  switch (riskLevel) {
    case 'LOW':       return 'LOW';
    case 'MODERATE':  return 'MODERATE';
    case 'HIGH':      return 'HIGH';
    case 'VERY_HIGH': return 'VERY HIGH';
    default:          return riskLevel;
  }
}
