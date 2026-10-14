import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

/** The Baymax mark: a friendly robot face on a brand tile. */
export function LogoMark({ size = 40 }: { size?: number }) {
  const { colors } = useTheme();
  const face = size * 0.62;
  const eye = size * 0.12;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      accessibilityLabel="Baymax logo"
    >
      <View
        style={{
          width: face,
          height: face * 0.62,
          borderRadius: face,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
        }}
      >
        <View style={{ width: eye, height: eye, borderRadius: eye, backgroundColor: '#0F172A' }} />
        <View
          style={{
            width: face * 0.3,
            height: Math.max(1.5, size * 0.035),
            backgroundColor: '#0F172A',
          }}
        />
        <View style={{ width: eye, height: eye, borderRadius: eye, backgroundColor: '#0F172A' }} />
      </View>
    </View>
  );
}

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <Text variant="title" style={{ fontSize: size * 0.62, lineHeight: size * 0.8 }}>
        Baymax
      </Text>
    </View>
  );
}
