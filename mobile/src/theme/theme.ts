/**
 * theme.ts — Exact design tokens extracted verbatim from Google Stitch export tailwind.config
 * This file is the SINGLE SOURCE OF TRUTH for all design tokens across the application.
 */

export const colors = {
  // Surfaces
  background: '#0f131c',
  'surface-container-lowest': '#0a0e16',
  'surface-container-low': '#181c24',
  'surface-container': '#1c2028',
  'surface-container-high': '#262a33',
  'surface-container-highest': '#31353e',
  'surface-bright': '#353942',
  'surface-dim': '#0f131c',
  'surface-variant': '#424750',
  'on-surface': '#e0e2ed',
  'on-surface-variant': '#c2c6d2',
  'inverse-surface': '#e0e2ed',
  'inverse-on-surface': '#2c313a',

  // Primary (Electric Amber & Accents)
  primary: '#ffb59d',
  'primary-container': '#ff6b35',
  'on-primary': '#5c1700',
  'on-primary-container': '#380d00',

  // Secondary (Electric Cyan & Accents)
  secondary: '#00eefc',
  'secondary-container': '#00686f',
  'on-secondary': '#00363b',

  // Outlines
  outline: '#8c919d',
  'outline-variant': '#424750',

  // Semantic Status
  error: '#ffb4ab',
  'error-container': '#93000a',
  'on-error': '#690005',
} as const;

export const fonts = {
  headline: 'SpaceGrotesk-SemiBold',
  headlineBold: 'SpaceGrotesk-Bold',
  headlineMedium: 'SpaceGrotesk-Medium',
  body: 'Inter-Regular',
  bodyMedium: 'Inter-Medium',
  bodySemiBold: 'Inter-SemiBold',
  telemetry: 'JetBrainsMono-Medium',
  label: 'JetBrainsMono-SemiBold',
} as const;

export const radii = {
  md: 8, // 0.5rem
  lg: 8, // 0.5rem (small inner icons)
  xl: 12, // 0.75rem (rounded-xl: cards, main player, oversized buttons)
  '2xl': 12, // mapped to 12px for rounded-xl consistency
  full: 9999, // 9999px (rounded-full)
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Typography = {
  displayHeroMobile: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  headlineLg: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
  },
  headlineMd: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
  },
  headlineSm: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  transcriptHighlight: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.16,
  },
  bodyLg: {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    lineHeight: 26,
  },
  bodyMd: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  telemetryData: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
  },
  telemetry: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
  },
  labelCaps: {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    textTransform: 'uppercase' as const,
  },
  // Kebab-case mappings for backwards compatibility
  'display-hero-mobile': {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  'headline-lg': {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
  },
  'headline-md': {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.22,
  },
  'headline-sm': {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  'transcript-highlight': {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.16,
  },
  'body-lg': {
    fontFamily: 'Inter-Regular',
    fontSize: 17,
    lineHeight: 26,
  },
  'body-md': {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  'body-sm': {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  'telemetry-data': {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
  },
  'label-sm': {
    fontFamily: 'JetBrainsMono-SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    textTransform: 'uppercase' as const,
  },
} as const;

export const typography = Typography;

export const LayoutMetrics = {
  headerHeight: 64,
  bottomNavHeight: 64,
  miniPlayerHeight: 48,
  transportPrimaryHeight: 64,
  transportSecondaryHeight: 48,
  waveformHeight: 96,
  waveformBarWidth: 6,
  waveformGap: 3,
  radiusCard: 12,
  radiusButton: 12,
  radiusBadge: 9999,
  gutter: 16,
} as const;

// ── PascalCase Token Bridge for Components ─────────────────────────────────

export const Colors = {
  background: colors.background,
  surface: colors.background,
  surfaceContainerLowest: colors['surface-container-lowest'],
  surfaceContainerLow: colors['surface-container-low'],
  surfaceContainer: colors['surface-container'],
  surfaceContainerHigh: colors['surface-container-high'],
  surfaceContainerHighest: colors['surface-container-highest'],
  surfaceBright: colors['surface-bright'],
  surfaceDim: colors['surface-dim'],
  surfaceVariant: colors['surface-variant'],

  primary: colors.primary,
  primaryContainer: colors['primary-container'],
  onPrimary: colors['on-primary'],
  onPrimaryContainer: colors['on-primary-container'],

  secondary: colors.secondary,
  secondaryContainer: colors['secondary-container'],
  onSecondary: colors['on-secondary'],

  onSurface: colors['on-surface'],
  onSurfaceVariant: colors['on-surface-variant'],
  onSurfaceSubtle: colors.outline,
  outline: colors.outline,
  outlineVariant: colors['outline-variant'],

  error: colors.error,
  errorContainer: colors['error-container'],
  onError: colors['on-error'],
  success: '#34D399',
} as const;

export const Spacing = {
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[4],
  lg: spacing[6],
  xl: spacing[8],
  xxl: spacing[12],
} as const;

export const Radius = {
  sm: radii.md,
  md: radii.lg,
  lg: radii.xl,
  xl: radii['2xl'],
  full: radii.full,
} as const;

export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
export type RadiusToken = keyof typeof radii;
export type SpacingToken = keyof typeof spacing;
export type TypographyToken = keyof typeof Typography;
