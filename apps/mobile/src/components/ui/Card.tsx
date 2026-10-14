import {
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  padding?: number;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({
  onPress,
  padding = 16,
  elevated = true,
  style,
  children,
  accessibilityLabel,
  ...rest
}: CardProps) {
  const { colors, radius, shadow } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding,
    ...(elevated ? shadow(1) : { borderWidth: 1, borderColor: colors.border }),
  };
  if (!onPress) {
    return (
      <View style={[base, style]} {...rest}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        base,
        hovered &&
          (Platform.OS === 'web'
            ? ({ ...shadow(3), transform: [{ translateY: -1 }] } as ViewStyle)
            : null),
        pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        Platform.OS === 'web' && ({ cursor: 'pointer', transitionDuration: '160ms' } as ViewStyle),
        style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
