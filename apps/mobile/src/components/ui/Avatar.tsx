import { View } from 'react-native';
import { initials } from '@/lib/format';
import { Text } from './Text';

export interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  ring?: boolean;
}

export function Avatar({ name, color, size = 44, ring }: AvatarProps) {
  return (
    <View
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: ring ? 3 : 0,
        borderColor: 'rgba(255,255,255,0.9)',
      }}
    >
      <Text
        color="#FFFFFF"
        style={{ fontFamily: 'Inter_700Bold', fontSize: size * 0.36, lineHeight: size * 0.44 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}
