// mobile/src/theme/tokens.ts

export const Colors = {
  background: '#0f131c',
  surface: '#0f131c',
  surfaceContainerLowest: '#0a0e16',
  surfaceContainerLow: '#181c24',
  surfaceContainer: '#1c2028',
  surfaceContainerHigh: '#262a33',
  surfaceContainerHighest: '#31353e',
  surfaceBright: '#353942',
  surfaceDim: '#0f131c',
  surfaceVariant: '#424750',

  primary: '#ffb59d',
  primaryContainer: '#ff6b35',
  onPrimary: '#5c1700',
  onPrimaryContainer: '#5f1900',

  secondary: '#00eefc',
  secondaryContainer: '#00eefc',
  onSecondary: '#00363b',

  onSurface: '#dfe2ee',
  onSurfaceVariant: '#bdc6dd',
  onSurfaceSubtle: '#8c919d',
  outline: '#8c919d',
  outlineVariant: '#594139',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  success: '#34D399',
} as const;

// All fontWeight properties stripped from custom font tokens to prevent synthetic bold fallback
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

export const Metrics = {
  // Strict reference spacing
  spaceXs: 4,
  spaceSm: 8,
  spaceMd: 16,
  gutter: 16,
  bottomPadding: 144, // pb-36 clears floating mini-player & bottom nav
  
  // Heights
  headerHeight: 64,
  transportPrimaryHeight: 64,   // h-16
  transportSecondaryHeight: 48, // h-12
  miniPlayerHeight: 48,          // h-12
  bottomNavHeight: 64,           // h-16
  waveformHeight: 96,            // h-24

  // Shape Radii: Hardware Rectangles vs Rare Pills
  radiusBase: 4,
  radiusLg: 8,       // rounded-lg (sub-icons, tags, badges)
  radiusXl: 12,      // rounded-xl (ALL cards and hardware buttons)
  radiusFull: 9999,  // rounded-full (avatars and floating capsule only)
} as const;

export const Spacing = {
  xs: Metrics.spaceXs,
  sm: Metrics.spaceSm,
  md: Metrics.spaceMd,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: Metrics.radiusLg,
  md: Metrics.radiusLg,
  lg: Metrics.radiusXl,
  xl: Metrics.radiusXl,
  full: Metrics.radiusFull,
} as const;

// Aliases for theme.ts interoperability
export const colors = {
  background: Colors.background,
  surface: Colors.surface,
  'surface-container-lowest': Colors.surfaceContainerLowest,
  'surface-container-low': Colors.surfaceContainerLow,
  'surface-container': Colors.surfaceContainer,
  'surface-container-high': Colors.surfaceContainerHigh,
  'surface-container-highest': Colors.surfaceContainerHighest,
  'surface-bright': Colors.surfaceBright,
  'surface-dim': Colors.surfaceDim,
  'surface-variant': Colors.surfaceVariant,
  primary: Colors.primary,
  'primary-container': Colors.primaryContainer,
  'on-primary': Colors.onPrimary,
  'on-primary-container': Colors.onPrimaryContainer,
  'secondary-container': Colors.secondaryContainer,
  secondary: Colors.secondaryContainer,
  'on-secondary': Colors.onSecondary,
  'on-surface': Colors.onSurface,
  'on-surface-variant': Colors.onSurfaceVariant,
  outline: Colors.outline,
  'outline-variant': Colors.outlineVariant,
  error: Colors.error,
  'error-container': Colors.errorContainer,
  'on-error': Colors.onError,
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
  md: Metrics.radiusLg,
  lg: Metrics.radiusLg,
  xl: Metrics.radiusXl,
  '2xl': Metrics.radiusXl,
  full: Metrics.radiusFull,
} as const;

export const spacing = {
  0: 0,
  1: Metrics.spaceXs,
  2: Metrics.spaceSm,
  3: 12,
  4: Metrics.spaceMd,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const LayoutMetrics = {
  ...Metrics,
  waveformBarWidth: 6,
  waveformGap: 3,
  radiusCard: Metrics.radiusXl,
  radiusButton: Metrics.radiusXl,
  radiusBadge: Metrics.radiusFull,
} as const;

export const typography = Typography;

export type ColorToken = keyof typeof colors;
export type FontToken = keyof typeof fonts;
export type RadiusToken = keyof typeof radii;
export type SpacingToken = keyof typeof spacing;
export type TypographyToken = keyof typeof Typography;
