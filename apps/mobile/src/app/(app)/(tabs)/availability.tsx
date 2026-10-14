import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  PageHeader,
  Screen,
  SectionHeader,
  SkeletonList,
  Text,
  confirm,
  toast,
} from '@/components/ui';
import { useCreateSlots, useDeleteSlot, useMySlots } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { errorMessage } from '@/lib/api/errors';
import { formatTime } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

const TIMES = Array.from({ length: 27 }, (_, i) => {
  const minutes = 7 * 60 + i * 30;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});
const DURATIONS = [15, 20, 30, 45, 60];
const toLabel = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const localKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function TimeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="callout">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {TIMES.map((t) => (
          <Chip key={t} label={toLabel(t)} selected={value === t} onPress={() => onChange(t)} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function AvailabilityTab() {
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const [days] = useState(() =>
    Array.from({ length: 21 }, (_, i) => new Date(Date.now() + i * 86_400_000)),
  );
  const [day, setDay] = useState(localKey(days[1]!));
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('12:00');
  const [duration, setDuration] = useState(30);

  const slots = useMySlots();
  const create = useCreateSlots();
  const remove = useDeleteSlot();

  const daySlots = (slots.data ?? []).filter((s) => localKey(new Date(s.start)) === day);
  const countByDay = (key: string) =>
    (slots.data ?? []).filter((s) => localKey(new Date(s.start)) === key).length;
  const preview = Math.max(
    0,
    Math.floor(((TIMES.indexOf(end) - TIMES.indexOf(start)) * 30) / duration),
  );

  const publish = () =>
    create.mutate(
      {
        date: day,
        startTime: start,
        endTime: end,
        durationMinutes: duration,
        timezoneOffsetMinutes: new Date(`${day}T12:00:00`).getTimezoneOffset(),
      },
      {
        onSuccess: (created) => toast.success(`${created.length} slots published`),
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  const form = (
    <Card style={{ gap: 18 }}>
      <View style={{ gap: 4 }}>
        <Text variant="heading">Publish availability</Text>
        <Text variant="callout" tone="muted">
          Choose a working window and we’ll split it into bookable slots.
        </Text>
      </View>
      <TimeRow label="From" value={start} onChange={setStart} />
      <TimeRow label="Until" value={end} onChange={setEnd} />
      <View style={{ gap: 8 }}>
        <Text variant="callout">Slot length</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {DURATIONS.map((d) => (
            <Chip
              key={d}
              label={`${d} min`}
              selected={duration === d}
              onPress={() => setDuration(d)}
            />
          ))}
        </View>
      </View>
      <View style={{ padding: 12, borderRadius: radius.lg, backgroundColor: colors.primarySoft }}>
        <Text variant="callout" tone="primary">
          {preview > 0
            ? `Creates ${preview} slot${preview === 1 ? '' : 's'} on ${new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`
            : 'End time must be after start time'}
        </Text>
      </View>
      <Button
        label="Publish slots"
        icon="calendar-plus"
        loading={create.isPending}
        disabled={preview <= 0}
        onPress={publish}
      />
    </Card>
  );

  const list = (
    <View style={{ gap: 14 }}>
      <SectionHeader
        title={`Slots · ${new Date(`${day}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
      />
      {slots.isLoading ? (
        <SkeletonList count={3} height={60} />
      ) : daySlots.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar-remove-outline"
            title="No slots on this day"
            message="Use the form to publish your availability."
          />
        </Card>
      ) : (
        <Card padding={6}>
          {daySlots.map((s, i) => (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderBottomWidth: i === daySlots.length - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text variant="bodyMedium" style={{ flex: 1 }}>
                {formatTime(s.start)} – {formatTime(s.end)}
              </Text>
              <Badge
                label={s.status === 'booked' ? 'Booked' : 'Open'}
                tone={s.status === 'booked' ? 'primary' : 'success'}
              />
              {s.status === 'available' ? (
                <IconButton
                  icon="trash-can-outline"
                  label="Delete slot"
                  variant="plain"
                  size={34}
                  color={colors.danger}
                  onPress={async () => {
                    if (
                      await confirm({
                        title: 'Remove this slot?',
                        message: 'Patients will no longer be able to book it.',
                        confirmLabel: 'Remove',
                        destructive: true,
                      })
                    ) {
                      remove.mutate(s.id, { onError: (e) => toast.error(errorMessage(e)) });
                    }
                  }}
                />
              ) : null}
            </View>
          ))}
        </Card>
      )}
    </View>
  );

  return (
    <Screen onRefresh={slots.refetch} refreshing={slots.isRefetching}>
      <PageHeader
        title="Availability"
        subtitle="Manage when patients can book you"
        actions={<HeaderActions />}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 2 }}
      >
        {days.map((d) => {
          const key = localKey(d);
          const active = key === day;
          const count = countByDay(key);
          return (
            <Card
              key={key}
              onPress={() => setDay(key)}
              accessibilityLabel={d.toDateString()}
              padding={10}
              elevated={!active}
              style={{
                width: 66,
                alignItems: 'center',
                gap: 2,
                backgroundColor: active ? colors.primary : colors.surface,
              }}
            >
              <Text variant="overline" color={active ? '#fff' : colors.textSubtle}>
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text variant="title" color={active ? '#fff' : colors.text}>
                {d.getDate()}
              </Text>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: count ? (active ? '#fff' : colors.success) : 'transparent',
                }}
              />
            </Card>
          );
        })}
      </ScrollView>
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>{form}</View>
          <View style={{ flex: 1 }}>{list}</View>
        </View>
      ) : (
        <>
          {form}
          {list}
        </>
      )}
    </Screen>
  );
}
