import { SPECIALTIES, SPECIALTY_BY_KEY, type PatientUser } from '@baymax/shared';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, View, type ViewStyle } from 'react-native';
import { ArticleCard } from '@/components/domain/ArticleCard';
import { DoctorCard } from '@/components/domain/DoctorCard';
import { SpecialtyTile } from '@/components/domain/SpecialtyTile';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import {
  Avatar,
  Button,
  Card,
  Grid,
  Icon,
  PageHeader,
  Screen,
  SectionHeader,
  Skeleton,
  Text,
} from '@/components/ui';
import { useAppointments, useArticles, useDoctors } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { bmi, firstName, formatDayLabel, formatTime, greeting } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

const QUICK_ACTIONS = [
  { icon: 'calendar-plus', label: 'Book a visit', color: '#2563EB', href: '/doctors' },
  { icon: 'stethoscope', label: 'Check symptoms', color: '#0D9488', href: '/check' },
  { icon: 'pill', label: 'Order medicine', color: '#E11D48', href: '/pharmacy' },
  {
    icon: 'chat-question-outline',
    label: 'Ask a doctor',
    color: '#7C3AED',
    href: '/questions/new',
  },
] as const;

function NextAppointment() {
  const { colors, radius } = useTheme();
  const { data, isLoading } = useAppointments('upcoming');
  const next = data?.[0];

  if (isLoading) return <Skeleton height={170} radius={radius.xxl} />;

  return (
    <LinearGradient
      colors={[colors.heroStart, colors.heroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: radius.xxl, padding: 20, gap: 16, overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: 'rgba(255,255,255,0.07)',
          right: -60,
          top: -80,
        }}
      />
      {next ? (
        <>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text variant="overline" color="rgba(255,255,255,0.8)">
              Next appointment
            </Text>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            >
              <Text variant="caption" color="#fff">
                {data!.length} upcoming
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push(`/appointments/${next.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Next appointment with ${next.doctor.fullName}`}
            style={[
              { flexDirection: 'row', alignItems: 'center', gap: 14 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
            ]}
          >
            <Avatar name={next.doctor.fullName} color={next.doctor.avatarColor} size={52} ring />
            <View style={{ flex: 1 }}>
              <Text variant="heading" color="#fff" numberOfLines={1}>
                {next.doctor.fullName}
              </Text>
              <Text variant="callout" color="rgba(255,255,255,0.82)">
                {SPECIALTY_BY_KEY[next.doctor.specialty].practitioner}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#fff" />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { icon: 'calendar-blank-outline', text: formatDayLabel(next.start) },
              { icon: 'clock-outline', text: formatTime(next.start) },
            ].map((x) => (
              <View
                key={x.icon}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: 12,
                  borderRadius: radius.lg,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                }}
              >
                <Icon name={x.icon} size={18} color="#fff" />
                <Text variant="bodyMedium" color="#fff">
                  {x.text}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text variant="overline" color="rgba(255,255,255,0.8)">
            Stay on top of your health
          </Text>
          <Text variant="title" color="#fff">
            No upcoming appointments
          </Text>
          <Text color="rgba(255,255,255,0.82)">
            Find a trusted specialist and book a visit in under a minute.
          </Text>
          <Button
            label="Find a doctor"
            icon="magnify"
            variant="secondary"
            onPress={() => router.push('/doctors')}
            style={{ alignSelf: 'flex-start' }}
          />
        </>
      )}
    </LinearGradient>
  );
}

function HealthSnapshot({ user }: { user: PatientUser }) {
  const { colors } = useTheme();
  const p = user.patient;
  const metrics = [
    { icon: 'water', label: 'Blood type', value: p.bloodType ?? '—', color: '#E11D48' },
    {
      icon: 'scale-bathroom',
      label: 'BMI',
      value: bmi(p.heightCm, p.weightKg)?.toString() ?? '—',
      color: '#0D9488',
    },
    { icon: 'allergy', label: 'Allergies', value: String(p.allergies.length), color: '#D97706' },
    { icon: 'pill', label: 'Medications', value: String(p.medications.length), color: '#7C3AED' },
  ];
  return (
    <Card
      onPress={() => router.push('/profile/health')}
      accessibilityLabel="Open health profile"
      style={{ gap: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="heading">Health profile</Text>
        <Icon name="chevron-right" size={20} color={colors.textSubtle} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {metrics.map((m) => (
          <View
            key={m.label}
            style={{
              flexGrow: 1,
              flexBasis: '45%',
              padding: 12,
              borderRadius: 14,
              backgroundColor: colors.surfaceMuted,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name={m.icon} size={16} color={m.color} />
              <Text variant="caption" tone="muted">
                {m.label}
              </Text>
            </View>
            <Text variant="heading">{m.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function PatientHome({ user }: { user: PatientUser }) {
  const { colors } = useTheme();
  const { isWide, columns } = useLayout();
  const doctors = useDoctors();
  const articles = useArticles();

  const quickActions = (
    <Grid columns={isWide ? 4 : 2} gap={12}>
      {QUICK_ACTIONS.map((a) => (
        <Card
          key={a.label}
          onPress={() => router.push(a.href)}
          accessibilityLabel={a.label}
          padding={14}
          style={{ gap: 12 }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              backgroundColor: `${a.color}1A`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={a.icon} size={22} color={a.color} />
          </View>
          <Text variant="subheading">{a.label}</Text>
        </Card>
      ))}
    </Grid>
  );

  const specialties = (
    <View style={{ gap: 14 }}>
      <SectionHeader
        title="Browse specialties"
        action="See all"
        onAction={() => router.push('/doctors')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingVertical: 4, paddingHorizontal: 2 }}
      >
        {SPECIALTIES.slice(0, 10).map((s) => (
          <SpecialtyTile key={s.key} specialty={s} width={140} />
        ))}
      </ScrollView>
    </View>
  );

  const topDoctors = (
    <View style={{ gap: 14 }}>
      <SectionHeader
        title="Top-rated doctors"
        action="See all"
        onAction={() => router.push('/doctors')}
      />
      {doctors.isLoading ? (
        <Skeleton height={140} radius={20} />
      ) : (
        <Grid columns={Math.min(columns, 2)} gap={12}>
          {(doctors.data ?? []).slice(0, isWide ? 4 : 3).map((d) => (
            <DoctorCard key={d.id} doctor={d} />
          ))}
        </Grid>
      )}
    </View>
  );

  const library = (
    <View style={{ gap: 14 }}>
      <SectionHeader
        title="Health library"
        action="See all"
        onAction={() => router.push('/community')}
      />
      {articles.isLoading ? (
        <Skeleton height={220} radius={20} />
      ) : (
        <View style={{ gap: 12 }}>
          {(articles.data ?? []).slice(0, 2).map((a) => (
            <ArticleCard key={a.id} article={a} compact />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Screen
      onRefresh={() => {
        doctors.refetch();
        articles.refetch();
      }}
      refreshing={doctors.isRefetching}
    >
      <PageHeader
        eyebrow={greeting()}
        title={`Hi, ${firstName(user.fullName)} 👋`}
        subtitle="How are you feeling today?"
        actions={<HeaderActions />}
      />
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.6, gap: 24 }}>
            <NextAppointment />
            {quickActions}
            {specialties}
            {topDoctors}
          </View>
          <View style={{ flex: 1, gap: 24 }}>
            <HealthSnapshot user={user} />
            {library}
          </View>
        </View>
      ) : (
        <>
          <NextAppointment />
          {quickActions}
          {specialties}
          <HealthSnapshot user={user} />
          {topDoctors}
          {library}
        </>
      )}
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          padding: 14,
          borderRadius: 16,
          backgroundColor: colors.warningSoft,
        }}
      >
        <Icon name="phone-alert" size={20} color={colors.warning} />
        <Text variant="caption" color={colors.warning} style={{ flex: 1 }}>
          In an emergency, call your local emergency number immediately. Baymax is not an emergency
          service.
        </Text>
      </View>
    </Screen>
  );
}
