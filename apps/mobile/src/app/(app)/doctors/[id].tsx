import { SPECIALTY_BY_KEY, type TimeSlot } from '@baymax/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { Rating } from '@/components/domain/DoctorCard';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StackHeader,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useBookAppointment, useDoctor, useDoctorSlots } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { errorMessage } from '@/lib/api/errors';
import { formatDate, formatMoney, formatTime, groupByDay } from '@/lib/format';
import { useAuth } from '@/stores/auth';
import { useTheme } from '@/theme/ThemeProvider';

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        minWidth: 100,
        alignItems: 'center',
        gap: 4,
        padding: 12,
        borderRadius: 16,
        backgroundColor: colors.surfaceMuted,
      }}
    >
      <Icon name={icon} size={20} color={colors.primary} />
      <Text variant="subheading">{value}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

export default function DoctorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const role = useAuth((s) => s.user?.role);
  const doctor = useDoctor(id);
  const slots = useDoctorSlots(id);
  const book = useBookAppointment();

  const days = useMemo(
    () => groupByDay(slots.data ?? [], (s) => s.start).slice(0, 14),
    [slots.data],
  );
  const [dayIndex, setDayIndex] = useState(0);
  const [slot, setSlot] = useState<TimeSlot>();
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string>();
  const day = days[Math.min(dayIndex, Math.max(0, days.length - 1))];

  if (doctor.isLoading)
    return (
      <Screen header={<StackHeader fallbackHref="/doctors" />}>
        <LoadingState />
      </Screen>
    );
  if (doctor.error || !doctor.data)
    return (
      <Screen header={<StackHeader fallbackHref="/doctors" />}>
        <ErrorState error={doctor.error} onRetry={doctor.refetch} />
      </Screen>
    );

  const d = doctor.data;
  const specialty = SPECIALTY_BY_KEY[d.specialty];

  const confirmBooking = () => {
    if (!slot) return;
    if (reason.trim().length < 3) {
      setReasonError('Tell the doctor briefly why you are visiting');
      return;
    }
    setReasonError(undefined);
    book.mutate(
      { slotId: slot.id, reason: reason.trim() },
      {
        onSuccess: (appointment) => {
          toast.success('Appointment booked');
          router.replace({
            pathname: '/appointments/[id]',
            params: { id: appointment.id, booked: '1' },
          });
        },
        onError: (e) => {
          toast.error(errorMessage(e));
          setSlot(undefined);
        },
      },
    );
  };

  const profile = (
    <View style={{ gap: 20 }}>
      <Card style={{ gap: 18 }}>
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <Avatar name={d.fullName} color={d.avatarColor} size={76} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="title">{d.fullName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name={specialty.icon} size={16} color={specialty.color} />
              <Text variant="callout" color={specialty.color}>
                {specialty.practitioner}
              </Text>
            </View>
            <Rating value={d.rating} count={d.reviewsCount} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
          <Fact icon="briefcase-outline" label="Experience" value={`${d.yearsOfExperience} yrs`} />
          <Fact icon="account-group-outline" label="Reviews" value={String(d.reviewsCount)} />
          <Fact icon="cash" label="Consultation" value={formatMoney(d.consultationFeeCents)} />
        </View>
      </Card>
      <Card style={{ gap: 12 }}>
        <Text variant="heading">About</Text>
        <Text tone="muted">
          {d.bio || `${d.fullName} is a ${specialty.practitioner.toLowerCase()} at ${d.clinic}.`}
        </Text>
        {[
          { icon: 'hospital-building', text: `${d.clinic}, ${d.city}` },
          { icon: 'school-outline', text: d.education },
          { icon: 'translate', text: d.languages.join(', ') },
        ].map((row) => (
          <View key={row.icon} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name={row.icon} size={18} color={colors.textSubtle} />
            <Text variant="callout" style={{ flex: 1 }}>
              {row.text}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );

  const booking =
    role !== 'patient' ? null : (
      <Card style={{ gap: 16 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Text variant="heading">Book an appointment</Text>
          <Badge icon="hospital-building" label="In person" tone="primary" />
        </View>
        {slots.isLoading ? (
          <LoadingState />
        ) : !days.length ? (
          <EmptyState
            icon="calendar-remove-outline"
            title="No availability"
            message="This doctor has no open slots right now. Please check back soon."
          />
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {days.map((g, i) => {
                const active = g === day;
                const date = new Date(g.items[0]!.start);
                return (
                  <Pressable
                    key={g.day}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={date.toDateString()}
                    onPress={() => {
                      setDayIndex(i);
                      setSlot(undefined);
                    }}
                    style={[
                      {
                        width: 64,
                        paddingVertical: 10,
                        borderRadius: radius.lg,
                        alignItems: 'center',
                        gap: 2,
                        borderWidth: 1,
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primary : colors.surface,
                      },
                      Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
                    ]}
                  >
                    <Text variant="overline" color={active ? '#fff' : colors.textSubtle}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </Text>
                    <Text variant="heading" color={active ? '#fff' : colors.text}>
                      {date.getDate()}
                    </Text>
                    <Text
                      variant="caption"
                      color={active ? 'rgba(255,255,255,0.8)' : colors.textSubtle}
                      style={{ fontSize: 11 }}
                    >
                      {g.items.length} open
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {day?.items.map((s) => {
                const active = slot?.id === s.id;
                return (
                  <Pressable
                    key={s.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => setSlot(s)}
                    style={[
                      {
                        width: 96,
                        height: 42,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: active ? colors.primary : colors.border,
                        backgroundColor: active ? colors.primarySoft : colors.surface,
                      },
                      Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
                    ]}
                  >
                    <Text variant="callout" tone={active ? 'primary' : 'default'}>
                      {formatTime(s.start)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {slot ? (
              <View style={{ gap: 14 }}>
                <TextField
                  label="Reason for visit"
                  placeholder="e.g. Recurring headaches for two weeks"
                  value={reason}
                  onChangeText={setReason}
                  error={reasonError}
                  multiline
                />
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: radius.lg,
                    backgroundColor: colors.primarySoft,
                  }}
                >
                  <Icon name="calendar-check" size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading" tone="primary">
                      {formatDate(slot.start, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                    <Text variant="callout" tone="primary">
                      {formatTime(slot.start)} – {formatTime(slot.end)} ·{' '}
                      {formatMoney(d.consultationFeeCents)} at the clinic
                    </Text>
                  </View>
                </View>
                <Button
                  label="Confirm booking"
                  icon="check"
                  size="lg"
                  loading={book.isPending}
                  onPress={confirmBooking}
                />
              </View>
            ) : (
              <Text variant="caption" tone="subtle">
                Select a time to continue.
              </Text>
            )}
          </>
        )}
      </Card>
    );

  return (
    <Screen header={<StackHeader title={specialty.practitioner} fallbackHref="/doctors" />}>
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>{profile}</View>
          <View style={{ flex: 1 }}>{booking}</View>
        </View>
      ) : (
        <>
          {profile}
          {booking}
        </>
      )}
    </Screen>
  );
}
