import type { SpecialtyInfo } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Card, Icon, Text } from '../ui';

export function SpecialtyTile({ specialty, width }: { specialty: SpecialtyInfo; width?: number }) {
  return (
    <Card
      onPress={() => router.push({ pathname: '/doctors', params: { specialty: specialty.key } })}
      accessibilityLabel={`Find ${specialty.label} doctors`}
      padding={14}
      style={{ width, gap: 10 }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: `${specialty.color}1A`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={specialty.icon} size={24} color={specialty.color} />
      </View>
      <Text variant="callout" numberOfLines={1}>
        {specialty.label}
      </Text>
    </Card>
  );
}
