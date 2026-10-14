import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Card, Icon, Text } from '../ui';

export function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}) {
  const { colors } = useTheme();
  const tint = color ?? colors.primary;
  return (
    <Card style={{ flex: 1, minWidth: 140, gap: 12 }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: `${tint}1A`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={21} color={tint} />
      </View>
      <View style={{ gap: 2 }}>
        <Text variant="title">{value}</Text>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
      </View>
    </Card>
  );
}
