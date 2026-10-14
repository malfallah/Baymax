import { View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

export function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={{ gap: 10 }}
      accessibilityLabel={`Step ${current + 1} of ${steps.length}: ${steps[current]}`}
    >
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {steps.map((s, i) => (
          <View
            key={s}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: i <= current ? colors.primary : colors.border,
            }}
          />
        ))}
      </View>
      <Text variant="overline" tone="primary">
        Step {current + 1} of {steps.length} · {steps[current]}
      </Text>
    </View>
  );
}
