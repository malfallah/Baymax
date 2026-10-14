import { SPECIALTIES, SPECIALTY_BY_KEY, type SpecialtyKey } from '@baymax/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { DoctorCard } from '@/components/domain/DoctorCard';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Grid,
  Screen,
  SearchBar,
  SkeletonList,
  StackHeader,
  Text,
} from '@/components/ui';
import { useDoctors } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';

export default function DoctorsScreen() {
  const params = useLocalSearchParams<{ specialty?: SpecialtyKey }>();
  const { columns } = useLayout();
  const specialty =
    params.specialty && SPECIALTY_BY_KEY[params.specialty] ? params.specialty : undefined;
  const [q, setQ] = useState('');
  const query = useDeferredValue(q);
  const { data, isLoading, error, refetch, isRefetching } = useDoctors({
    specialty,
    q: query || undefined,
  });
  const info = specialty ? SPECIALTY_BY_KEY[specialty] : undefined;

  return (
    <Screen
      header={<StackHeader title="Find a doctor" fallbackHref="/care" />}
      onRefresh={refetch}
      refreshing={isRefetching}
    >
      <View style={{ gap: 6 }}>
        <Text variant="title">{info ? info.label : 'All specialists'}</Text>
        <Text tone="muted">
          {info ? info.description : 'Book trusted, verified doctors across every specialty.'}
        </Text>
      </View>
      <SearchBar value={q} onChangeText={setQ} placeholder="Search by name, clinic or city" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        <Chip
          label="All"
          selected={!specialty}
          onPress={() => router.setParams({ specialty: undefined })}
        />
        {SPECIALTIES.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            icon={s.icon}
            color={s.color}
            selected={specialty === s.key}
            onPress={() => router.setParams({ specialty: s.key })}
          />
        ))}
      </ScrollView>
      {isLoading ? (
        <SkeletonList count={4} height={140} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Card>
          <EmptyState
            icon="doctor"
            title="No doctors found"
            message="Try another specialty or search term."
          />
        </Card>
      ) : (
        <>
          <Text variant="caption" tone="muted">
            {data.length} doctor{data.length === 1 ? '' : 's'} available
          </Text>
          <Grid columns={Math.min(columns, 2)} gap={14}>
            {data.map((d) => (
              <DoctorCard key={d.id} doctor={d} />
            ))}
          </Grid>
        </>
      )}
    </Screen>
  );
}
