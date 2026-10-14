import { SPECIALTY_BY_KEY, type Doctor } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { formatDayLabel, formatMoney, formatTime } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { Avatar, Badge, Card, Icon, Text } from '../ui';

export function Rating({ value, count }: { value: number; count?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Icon name="star" size={15} color="#F5A524" />
      <Text variant="caption">{value.toFixed(1)}</Text>
      {count !== undefined ? (
        <Text variant="caption" color={colors.textSubtle}>
          ({count})
        </Text>
      ) : null}
    </View>
  );
}

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const { colors } = useTheme();
  const specialty = SPECIALTY_BY_KEY[doctor.specialty];
  return (
    <Card
      onPress={() => router.push(`/doctors/${doctor.id}`)}
      accessibilityLabel={`${doctor.fullName}, ${specialty.practitioner}`}
    >
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Avatar name={doctor.fullName} color={doctor.avatarColor} size={56} />
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="subheading" numberOfLines={1}>
            {doctor.fullName}
          </Text>
          <Text variant="caption" tone="primary">
            {specialty.practitioner}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginTop: 2,
              flexWrap: 'wrap',
            }}
          >
            <Rating value={doctor.rating} count={doctor.reviewsCount} />
            <Text variant="caption" tone="subtle">
              · {doctor.yearsOfExperience} yrs exp.
            </Text>
          </View>
        </View>
        <Text variant="subheading">{formatMoney(doctor.consultationFeeCents)}</Text>
      </View>
      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <Icon name="map-marker-outline" size={16} color={colors.textSubtle} />
          <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
            {doctor.clinic}, {doctor.city}
          </Text>
        </View>
        {doctor.nextAvailable ? (
          <Badge
            tone="success"
            icon="calendar-check"
            label={`${formatDayLabel(doctor.nextAvailable)}, ${formatTime(doctor.nextAvailable)}`}
          />
        ) : (
          <Badge label="Fully booked" />
        )}
      </View>
    </Card>
  );
}
