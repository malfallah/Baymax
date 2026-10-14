import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Text } from './Text';

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.surfaceMuted,
        borderRadius: 999,
        padding: 3,
      }}
    >
      <IconButton
        icon={value - 1 <= 0 && min === 0 ? 'trash-can-outline' : 'minus'}
        label="Decrease quantity"
        size={32}
        onPress={() => value > min && onChange(value - 1)}
      />
      <Text
        variant="subheading"
        style={{ minWidth: 18, textAlign: 'center' }}
        accessibilityLabel={`Quantity ${value}`}
      >
        {value}
      </Text>
      <IconButton
        icon="plus"
        label="Increase quantity"
        size={32}
        onPress={() => value < max && onChange(value + 1)}
      />
    </View>
  );
}
