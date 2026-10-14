import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export interface IconButtonProps {
  icon: string;
  label: string;
  onPress?: () => void;
  size?: number;
  variant?: 'plain' | 'filled' | 'tinted';
  badge?: number;
  color?: string;
}

export function IconButton({
  icon,
  label,
  onPress,
  size = 40,
  variant = 'filled',
  badge,
  color,
}: IconButtonProps) {
  const { colors } = useTheme();
  const bg =
    variant === 'filled'
      ? colors.surface
      : variant === 'tinted'
        ? colors.primarySoft
        : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed || hovered ? colors.surfaceMuted : bg,
          borderWidth: variant === 'filled' ? 1 : 0,
          borderColor: colors.border,
        },
        Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
      ]}
    >
      <Icon
        name={icon}
        size={size * 0.5}
        color={color ?? (variant === 'tinted' ? colors.primary : colors.text)}
      />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            paddingHorizontal: 4,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.background,
          }}
        >
          <Text variant="overline" color="#fff" style={{ fontSize: 10, letterSpacing: 0 }}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
