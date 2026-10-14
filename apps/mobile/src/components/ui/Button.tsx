import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const heights: Record<ButtonSize, number> = { sm: 36, md: 46, lg: 54 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  onPress,
  style,
  ...rest
}: ButtonProps) {
  const { colors, radius } = useTheme();
  const palette: Record<
    ButtonVariant,
    { bg: string; pressed: string; fg: string; border?: string }
  > = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary },
    secondary: { bg: colors.primarySoft, pressed: colors.border, fg: colors.primary },
    outline: {
      bg: 'transparent',
      pressed: colors.surfaceMuted,
      fg: colors.text,
      border: colors.borderStrong,
    },
    ghost: { bg: 'transparent', pressed: colors.surfaceMuted, fg: colors.primary },
    danger: { bg: colors.dangerSoft, pressed: colors.border, fg: colors.danger },
  };
  const p = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
        onPress?.(e);
      }}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: size === 'sm' ? 14 : 20,
          borderRadius: size === 'sm' ? radius.md : radius.lg,
          backgroundColor: pressed || hovered ? p.pressed : p.bg,
          borderColor: p.border ?? 'transparent',
          borderWidth: p.border ? 1 : 0,
          opacity: isDisabled && !loading ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        Platform.OS === 'web' &&
          ({
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            transitionDuration: '150ms',
          } as ViewStyle),
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={[styles.row, { maxWidth: '100%' }]}>
          {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 19} color={p.fg} /> : null}
          <Text
            variant={size === 'sm' ? 'caption' : 'subheading'}
            color={p.fg}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {label}
          </Text>
          {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 19} color={p.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
