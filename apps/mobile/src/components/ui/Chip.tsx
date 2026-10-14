import { Platform, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: string;
  color?: string;
}

export function Chip({ label, selected, onPress, icon, color }: ChipProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 14,
          height: 36,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: selected ? tint : colors.border,
          backgroundColor: selected ? tint : colors.surface,
          opacity: pressed ? 0.85 : 1,
        },
        Platform.OS === 'web' && ({ cursor: 'pointer', userSelect: 'none' } as ViewStyle),
      ]}
    >
      {icon ? (
        <Icon name={selected ? 'check' : icon} size={16} color={selected ? '#fff' : tint} />
      ) : null}
      <Text variant="callout" color={selected ? '#FFFFFF' : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}
