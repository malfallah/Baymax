export const palette = {
  blue50: '#EFF5FF',
  blue100: '#DBE8FE',
  blue400: '#5B8DEF',
  blue500: '#3B78F2',
  blue600: '#2563EB',
  blue700: '#1D4FD7',
  coral500: '#F43F5E',
  green500: '#16A34A',
  amber500: '#D97706',
  red500: '#DC2626',
} as const;

export interface ColorScheme {
  background: string;
  surface: string;
  surfaceMuted: string;
  elevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  primaryPressed: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  overlay: string;
  shadow: string;
  heroStart: string;
  heroEnd: string;
}

export const lightColors: ColorScheme = {
  background: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F4F9',
  elevated: '#FFFFFF',
  border: '#E5E9F0',
  borderStrong: '#CBD3DF',
  text: '#0F172A',
  textMuted: '#55627A',
  textSubtle: '#8692A6',
  primary: palette.blue600,
  primaryPressed: palette.blue700,
  primarySoft: palette.blue50,
  onPrimary: '#FFFFFF',
  accent: palette.coral500,
  accentSoft: '#FFE9ED',
  success: '#15803D',
  successSoft: '#E7F7EC',
  warning: '#B45309',
  warningSoft: '#FEF3E2',
  danger: '#DC2626',
  dangerSoft: '#FDECEC',
  overlay: 'rgba(15, 23, 42, 0.45)',
  shadow: '#0F172A',
  heroStart: '#2563EB',
  heroEnd: '#4F46E5',
};

export const darkColors: ColorScheme = {
  background: '#0B1120',
  surface: '#111A2E',
  surfaceMuted: '#17223A',
  elevated: '#1A2540',
  border: '#22304D',
  borderStrong: '#33446A',
  text: '#F1F5F9',
  textMuted: '#A3B0C6',
  textSubtle: '#728099',
  primary: '#4C86F5',
  primaryPressed: '#3B78F2',
  primarySoft: '#16264A',
  onPrimary: '#FFFFFF',
  accent: '#FB7185',
  accentSoft: '#3A1A24',
  success: '#4ADE80',
  successSoft: '#12301F',
  warning: '#FBBF24',
  warningSoft: '#3A2A10',
  danger: '#F87171',
  dangerSoft: '#3B1717',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
  heroStart: '#1E4FD0',
  heroEnd: '#4338CA',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999 } as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

export const typography = {
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  callout: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.8 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Width at which the layout switches to a sidebar + wide content. */
export const WIDE_BREAKPOINT = 900;
export const CONTENT_MAX_WIDTH = 1080;
