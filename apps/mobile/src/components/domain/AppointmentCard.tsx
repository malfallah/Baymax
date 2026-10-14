import { SPECIALTY_BY_KEY, type Appointment, type Role } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { formatDayLabel, formatTime } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { Avatar, Badge, Card, Icon, Text, type BadgeTone } from '../ui';

export const STATUS_BADGE: Record<Appointment['status'], { label: string; tone: BadgeTone }> = {
  confirmed: { label: 'Confirmed', tone: 'primary' },
  completed: { label: 'Completed', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export function AppointmentCard({
  appointment,
  viewer,
}: {
  appointment: Appointment;
  viewer: Role;
}) {
  const { colors, radius } = useTheme();
  const other = viewer === 'patient' ? appointment.doctor : appointment.patient;
  const subtitle =
    viewer === 'patient'
      ? SPECIALTY_BY_KEY[appointment.doctor.specialty].practitioner
      : appointment.reason;
  const status = STATUS_BADGE[appointment.status];
  const date = new Date(appointment.start);

  return (
    <Card
      onPress={() => router.push(`/appointments/${appointment.id}`)}
      accessibilityLabel={`Appointment with ${other.fullName}`}
    >
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
        <View
          style={{
            width: 58,
            paddingVertical: 8,
            borderRadius: radius.lg,
            backgroundColor:
              appointment.status === 'confirmed' ? colors.primarySoft : colors.surfaceMuted,
            alignItems: 'center',
          }}
        >
          <Text variant="overline" tone={appointment.status === 'confirmed' ? 'primary' : 'muted'}>
            {date.toLocaleDateString('en-US', { month: 'short' })}
          </Text>
          <Text
            variant="title"
            tone={appointment.status === 'confirmed' ? 'primary' : 'muted'}
            style={{ lineHeight: 28 }}
          >
            {date.getDate()}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Avatar name={other.fullName} color={other.avatarColor} size={22} />
            <Text variant="subheading" numberOfLines={1} style={{ flexShrink: 1 }}>
              {other.fullName}
            </Text>
          </View>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Icon name="clock-outline" size={14} color={colors.textSubtle} />
            <Text variant="caption" tone="subtle">
              {formatDayLabel(appointment.start)} · {formatTime(appointment.start)}
            </Text>
          </View>
        </View>
        <Badge label={status.label} tone={status.tone} />
      </View>
    </Card>
  );
}
