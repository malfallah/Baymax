import { SPECIALTY_BY_KEY, type DoctorUser } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { AppointmentCard } from '@/components/domain/AppointmentCard';
import { QuestionCard } from '@/components/domain/QuestionCard';
import { StatCard } from '@/components/domain/StatCard';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import {
  Button,
  Card,
  EmptyState,
  Grid,
  PageHeader,
  Screen,
  SectionHeader,
  SkeletonList,
} from '@/components/ui';
import { useAppointments, useDoctorStats, useQuestions } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { greeting } from '@/lib/format';

export function DoctorHome({ user }: { user: DoctorUser }) {
  const { isWide } = useLayout();
  const stats = useDoctorStats();
  const upcoming = useAppointments('upcoming');
  const questions = useQuestions();
  const unanswered = (questions.data ?? [])
    .filter((q) => !q.answers.some((a) => a.author.role === 'doctor'))
    .slice(0, 3);
  const lastName = user.fullName.split(' ').slice(-1)[0];

  const schedule = (
    <View style={{ gap: 14 }}>
      <SectionHeader
        title="Upcoming appointments"
        action="View all"
        onAction={() => router.push('/care')}
      />
      {upcoming.isLoading ? (
        <SkeletonList count={3} />
      ) : upcoming.data?.length ? (
        <View style={{ gap: 12 }}>
          {upcoming.data.slice(0, 5).map((a) => (
            <AppointmentCard key={a.id} appointment={a} viewer="doctor" />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState
            icon="calendar-blank-outline"
            title="No upcoming visits"
            message="Publish availability so patients can book with you."
            actionLabel="Add availability"
            onAction={() => router.push('/availability')}
          />
        </Card>
      )}
    </View>
  );

  const community = (
    <View style={{ gap: 14 }}>
      <SectionHeader
        title="Patients are asking"
        action="Community"
        onAction={() => router.push('/community')}
      />
      {questions.isLoading ? (
        <SkeletonList count={2} height={140} />
      ) : unanswered.length ? (
        <View style={{ gap: 12 }}>
          {unanswered.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </View>
      ) : (
        <Card>
          <EmptyState
            icon="check-all"
            title="All caught up"
            message="Every question has a doctor's answer."
          />
        </Card>
      )}
    </View>
  );

  return (
    <Screen
      onRefresh={() => [stats, upcoming, questions].forEach((q) => q.refetch())}
      refreshing={stats.isRefetching}
    >
      <PageHeader
        eyebrow={greeting()}
        title={`Dr. ${lastName}`}
        subtitle={`${SPECIALTY_BY_KEY[user.doctor.specialty].label} · ${user.doctor.clinic}`}
        actions={<HeaderActions />}
      />
      <Grid columns={isWide ? 4 : 2} gap={12}>
        <StatCard
          icon="calendar-clock"
          label="Upcoming visits"
          value={stats.data?.upcomingAppointments ?? '–'}
        />
        <StatCard
          icon="clock-check-outline"
          label="Open slots"
          value={stats.data?.openSlots ?? '–'}
          color="#0D9488"
        />
        <StatCard
          icon="check-decagram-outline"
          label="Completed"
          value={stats.data?.completedAppointments ?? '–'}
          color="#16A34A"
        />
        <StatCard
          icon="account-group-outline"
          label="Patients seen"
          value={stats.data?.patientsSeen ?? '–'}
          color="#7C3AED"
        />
      </Grid>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Button
          label="Add availability"
          icon="calendar-plus"
          onPress={() => router.push('/availability')}
        />
        <Button
          label="Write an article"
          icon="pencil-outline"
          variant="secondary"
          onPress={() => router.push('/articles/new')}
        />
      </View>
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.3 }}>{schedule}</View>
          <View style={{ flex: 1 }}>{community}</View>
        </View>
      ) : (
        <>
          {schedule}
          {community}
        </>
      )}
    </Screen>
  );
}
