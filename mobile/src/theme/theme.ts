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
  headline: 'SpaceGrotesk_600SemiBold',
  headlineBold: 'SpaceGrotesk_700Bold',
  headlineMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  telemetry: 'JetBrainsMono_500Medium',
  label: 'JetBrainsMono_600SemiBold',
} as const;

export const radii = {
  md: 8, // 0.5rem
  lg: 12, // 0.75rem
  xl: 16, // 1rem
  '2xl': 20, // 1.25rem
  full: 9999, // 9999px
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

export const typography = {
  'display-lg': {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.64,
    fontFamily: fonts.headlineBold,
  },
  'headline-lg': {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.56,
    fontFamily: fonts.headline,
  },
  'headline-md': {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    fontFamily: fonts.headlineBold,
  },
  'headline-sm': {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.18,
    fontFamily: fonts.headline,
  },
  'body-lg': {
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: 0,
    fontFamily: fonts.body,
  },
  'body-md': {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: fonts.body,
  },
  'body-sm': {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    fontFamily: fonts.body,
  },
  'label-sm': {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
    fontFamily: fonts.label,
  },
  'telemetry-data': {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    fontFamily: fonts.telemetry,
  },
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

export const Typography = {
  headlineLg: typography['headline-lg'],
  headlineMd: typography['headline-md'],
  headlineSm: typography['headline-sm'],
  bodyLg: typography['body-lg'],
  bodyMd: typography['body-md'],
  bodySm: typography['body-sm'],
  labelCaps: typography['label-sm'],
  telemetry: typography['telemetry-data'],
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
export type TypographyToken = keyof typeof typography;
