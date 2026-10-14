import { SPECIALTIES, type SpecialtyKey } from '@baymax/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Chip,
  EmptyState,
  Screen,
  StackHeader,
  TagInput,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useUpdateMe } from '@/hooks/queries';
import { errorMessage } from '@/lib/api/errors';
import { useAuth } from '@/stores/auth';

export default function PracticeDetails() {
  const user = useAuth((s) => s.user)!;
  const update = useUpdateMe();
  const d = user.role === 'doctor' ? user.doctor : undefined;
  const [specialty, setSpecialty] = useState<SpecialtyKey>(d?.specialty ?? 'general');
  const [clinic, setClinic] = useState(d?.clinic ?? '');
  const [city, setCity] = useState(d?.city ?? '');
  const [education, setEducation] = useState(d?.education ?? '');
  const [years, setYears] = useState(String(d?.yearsOfExperience ?? ''));
  const [fee, setFee] = useState(d ? String(d.consultationFeeCents / 100) : '');
  const [bio, setBio] = useState(d?.bio ?? '');
  const [languages, setLanguages] = useState<string[]>(d?.languages ?? []);
  const header = <StackHeader title="Practice details" fallbackHref="/profile" />;

  if (!d)
    return (
      <Screen header={header}>
        <EmptyState icon="lock-outline" title="Doctors only" />
      </Screen>
    );

  const save = () =>
    update.mutate(
      {
        doctor: {
          specialty,
          clinic,
          city,
          education,
          bio,
          languages,
          yearsOfExperience: Number(years),
          consultationFeeCents: Math.round(Number(fee) * 100),
        },
      },
      {
        onSuccess: () => {
          toast.success('Practice details saved');
          router.back();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <Screen
      header={header}
      maxWidth={760}
      footer={<Button label="Save changes" size="lg" loading={update.isPending} onPress={save} />}
    >
      <View style={{ gap: 8 }}>
        <Text variant="callout">Specialty</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SPECIALTIES.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              icon={s.icon}
              color={s.color}
              selected={specialty === s.key}
              onPress={() => setSpecialty(s.key)}
            />
          ))}
        </View>
      </View>
      <TextField
        label="Clinic or hospital"
        icon="hospital-building"
        value={clinic}
        onChangeText={setClinic}
      />
      <TextField label="City" icon="map-marker-outline" value={city} onChangeText={setCity} />
      <TextField
        label="Education"
        icon="school-outline"
        value={education}
        onChangeText={setEducation}
      />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Years of experience"
            value={years}
            onChangeText={setYears}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="Consultation fee ($)"
            value={fee}
            onChangeText={setFee}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
      <TagInput
        label="Languages"
        placeholder="e.g. Spanish"
        values={languages}
        onChange={setLanguages}
      />
      <TextField label="Bio" value={bio} onChangeText={setBio} multiline />
    </Screen>
  );
}
