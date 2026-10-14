import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface IconProps {
  name: IconName | string;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
}

export function Icon({ name, size = 20, color, accessibilityLabel }: IconProps) {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons
      name={name as IconName}
      size={size}
      color={color ?? colors.text}
      accessibilityLabel={accessibilityLabel}
      accessible={!!accessibilityLabel}
    />
  );
}
