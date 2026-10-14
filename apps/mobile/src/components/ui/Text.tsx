import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { TypographyVariant } from '@/theme/tokens';

export type TextTone =
  | 'default'
  | 'muted'
  | 'subtle'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'onPrimary';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
  color?: string;
}

export function Text({
  variant = 'body',
  tone = 'default',
  align,
  color,
  style,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();
  const toneColor: Record<TextTone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    subtle: colors.textSubtle,
    primary: colors.primary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    onPrimary: colors.onPrimary,
  };
  const base = typography[variant];
  return (
    <RNText
      {...rest}
      style={[
        base,
        { color: color ?? toneColor[tone], textAlign: align },
        variant === 'overline' && { textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}
