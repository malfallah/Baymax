import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Grid,
  PageHeader,
  Screen,
  SegmentedControl,
  SkeletonList,
  Text,
} from '@/components/ui';
import { useAppointments } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { groupByDay, formatDate } from '@/lib/format';
import { useAuth } from '@/stores/auth';

type Scope = 'upcoming' | 'past';

export default function CareTab() {
  const user = useAuth((s) => s.user)!;
  const { columns } = useLayout();
  const [scope, setScope] = useState<Scope>('upcoming');
  const { data, isLoading, error, refetch, isRefetching } = useAppointments(scope);
  const isPatient = user.role === 'patient';

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <PageHeader
        title="Appointments"
        subtitle={isPatient ? 'Your visits with Baymax doctors' : 'Your schedule with patients'}
        actions={<HeaderActions />}
      />
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
          <SegmentedControl<Scope>
            value={scope}
            onChange={setScope}
            segments={[
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'past', label: 'Past & cancelled' },
            ]}
          />
        </View>
        {isPatient ? (
          <Button label="Book appointment" icon="plus" onPress={() => router.push('/doctors')} />
        ) : null}
      </View>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Card>
          <EmptyState
            icon={scope === 'upcoming' ? 'calendar-blank-outline' : 'history'}
            title={scope === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            message={
              scope === 'upcoming'
                ? isPatient
                  ? 'Book a visit with one of our specialists — it only takes a minute.'
                  : 'Patients will appear here once they book your available slots.'
                : 'Completed and cancelled visits will show up here.'
            }
            actionLabel={
              scope === 'upcoming' ? (isPatient ? 'Find a doctor' : 'Add availability') : undefined
            }
            onAction={() => router.push(isPatient ? '/doctors' : '/availability')}
          />
        </Card>
      ) : (
        groupByDay(data, (a) => a.start).map((group) => (
          <View key={group.day} style={{ gap: 10 }}>
            <Text variant="overline" tone="muted">
              {formatDate(group.items[0]!.start, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Grid columns={Math.min(columns, 2)} gap={12}>
              {group.items.map((a) => (
                <AppointmentCard key={a.id} appointment={a} viewer={user.role} />
              ))}
            </Grid>
          </View>
        ))
      )}
    </Screen>
  );
}
