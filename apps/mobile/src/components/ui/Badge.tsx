import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent';

export function Badge({
  label,
  tone = 'neutral',
  icon,
  align = 'flex-start',
}: {
  label: string;
  tone?: BadgeTone;
  icon?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
}) {
  const { colors } = useTheme();
  const map: Record<BadgeTone, [string, string]> = {
    neutral: [colors.surfaceMuted, colors.textMuted],
    primary: [colors.primarySoft, colors.primary],
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
    accent: [colors.accentSoft, colors.accent],
  };
  const [bg, fg] = map[tone];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: align,
        backgroundColor: bg,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 999,
      }}
    >
      {icon ? <Icon name={icon} size={13} color={fg} /> : null}
      <Text variant="caption" color={fg} style={{ fontSize: 12 }}>
        {label}
      </Text>
    </View>
  );
}
