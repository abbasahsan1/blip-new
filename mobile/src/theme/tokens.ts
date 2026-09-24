export const Colors = {
  // Surfaces
  background: '#0F131C',
  surface: '#0F131C',
  surfaceContainerLowest: '#0A0E16',
  surfaceContainerLow: '#181C24',
  surfaceContainer: '#1C2028',
  surfaceContainerHigh: '#262A33',
  surfaceContainerHighest: '#31353E',
  surfaceBright: '#353942',

  // Primary (Played / Dominant Action / Amber)
  primary: '#FFB59D',
  primaryContainer: '#FF6B35',
  onPrimary: '#5D1900',
  onPrimaryContainer: '#FFFFFF',

  // Secondary (Remaining / Realtime Sync / Cyan)
  secondary: '#D3FBFF',
  secondaryContainer: '#00EEFC',
  onSecondary: '#00363A',
  onSecondaryContainer: '#00686F',

  // Text / Typography
  onSurface: '#DFE2EE',
  onSurfaceVariant: '#94A3B8', // readable muted text
  onSurfaceSubtle: '#64748B',

  // Outlines / Borders
  outline: '#3E4759',
  outlineVariant: '#262A33',

  // Semantic Status
  error: '#FFB4AB',
  errorContainer: '#93000A',
  onError: '#690005',
  success: '#34D399',
} as const;

export const Typography = {
  headlineLg: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  headlineMd: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  headlineSm: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodyLg: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyMd: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  bodySm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  labelCaps: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
  },
  telemetry: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
