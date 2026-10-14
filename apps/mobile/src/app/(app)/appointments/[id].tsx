import { SPECIALTY_BY_KEY } from '@baymax/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { STATUS_BADGE } from '@/components/domain/AppointmentCard';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StackHeader,
  Text,
  TextField,
  confirm,
  toast,
} from '@/components/ui';
import { useAppointment, useUpdateAppointment } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { errorMessage } from '@/lib/api/errors';
import { formatDate, formatTime } from '@/lib/format';
import { useAuth } from '@/stores/auth';
import { useTheme } from '@/theme/ThemeProvider';

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="muted">
          {label}
        </Text>
        <Text variant="bodyMedium">{value}</Text>
      </View>
    </View>
  );
}

export default function AppointmentDetail() {
  const { id, booked } = useLocalSearchParams<{ id: string; booked?: string }>();
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const user = useAuth((s) => s.user)!;
  const { data, isLoading, error, refetch } = useAppointment(id);
  const update = useUpdateAppointment();
  const [notes, setNotes] = useState('');
  const [now] = useState(() => Date.now());

  const header = <StackHeader title="Appointment" fallbackHref="/care" />;
  if (isLoading)
    return (
      <Screen header={header}>
        <LoadingState />
      </Screen>
    );
  if (error || !data)
    return (
      <Screen header={header}>
        <ErrorState error={error} onRetry={refetch} />
      </Screen>
    );

  const a = data;
  const isPatient = user.role === 'patient';
  const other = isPatient ? a.doctor : a.patient;
  const upcoming = a.status === 'confirmed' && Date.parse(a.start) > now;
  const status = STATUS_BADGE[a.status];

  const cancel = async () => {
    const ok = await confirm({
      title: 'Cancel this appointment?',
      message: isPatient
        ? 'The time slot will be released for other patients.'
        : 'The patient will see that this visit was cancelled.',
      confirmLabel: 'Cancel appointment',
      cancelLabel: 'Keep it',
      destructive: true,
    });
    if (!ok) return;
    update.mutate(
      { id: a.id, status: 'cancelled' },
      {
        onSuccess: () => toast.success('Appointment cancelled'),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  const complete = () =>
    update.mutate(
      { id: a.id, status: 'completed', notes: notes.trim() || undefined },
      {
        onSuccess: () => toast.success('Visit marked as completed'),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <Screen header={header}>
      {booked && a.status === 'confirmed' ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 14,
            alignItems: 'center',
            padding: 18,
            borderRadius: radius.xl,
            backgroundColor: colors.successSoft,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: colors.success,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check-bold" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="heading" tone="success">
              You’re booked!
            </Text>
            <Text variant="callout" tone="success">
              We’ll see you on{' '}
              {formatDate(a.start, { weekday: 'long', month: 'long', day: 'numeric' })}.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
        <Card style={{ gap: 18, flex: isWide ? 1 : undefined, width: isWide ? undefined : '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={other.fullName} color={other.avatarColor} size={60} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="heading">{other.fullName}</Text>
              <Text variant="callout" tone="muted">
                {isPatient ? SPECIALTY_BY_KEY[a.doctor.specialty].practitioner : 'Patient'}
              </Text>
            </View>
            <Badge label={status.label} tone={status.tone} />
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row
            icon="calendar-blank-outline"
            label="Date"
            value={formatDate(a.start, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          />
          <Row
            icon="clock-outline"
            label="Time"
            value={`${formatTime(a.start)} – ${formatTime(a.end)}`}
          />
          <Row
            icon="map-marker-outline"
            label="Location"
            value={`${a.doctor.clinic}, ${a.doctor.city}`}
          />
          <Row icon="text-box-outline" label="Reason for visit" value={a.reason} />
          {isPatient && upcoming ? (
            <Button
              label="View doctor profile"
              variant="secondary"
              icon="doctor"
              onPress={() => router.push(`/doctors/${a.doctor.id}`)}
            />
          ) : null}
        </Card>

        <View style={{ gap: 20, flex: isWide ? 1 : undefined, width: isWide ? undefined : '100%' }}>
          {a.notes ? (
            <Card style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="note-text-outline" size={20} color={colors.primary} />
                <Text variant="heading">Doctor’s notes</Text>
              </View>
              <Text>{a.notes}</Text>
            </Card>
          ) : null}

          {upcoming && !isPatient ? (
            <Card style={{ gap: 14 }}>
              <Text variant="heading">Complete visit</Text>
              <TextField
                label="Clinical notes"
                placeholder="Summary, diagnosis and follow-up plan visible to the patient"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
              <Button
                label="Mark as completed"
                icon="check-decagram"
                loading={update.isPending && update.variables?.status === 'completed'}
                onPress={complete}
              />
            </Card>
          ) : null}

          {upcoming ? (
            <Card style={{ gap: 12 }}>
              <Text variant="heading">Need to change plans?</Text>
              <Text variant="callout" tone="muted">
                {isPatient
                  ? 'Cancel at least 24 hours ahead so another patient can take your place.'
                  : 'Let your patient know as early as possible.'}
              </Text>
              <Button
                label="Cancel appointment"
                variant="danger"
                icon="calendar-remove"
                loading={update.isPending && update.variables?.status === 'cancelled'}
                onPress={cancel}
              />
              {isPatient ? (
                <Button
                  label="Book another time"
                  variant="ghost"
                  onPress={() => router.push(`/doctors/${a.doctor.id}`)}
                />
              ) : null}
            </Card>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
