import {
  ACTIVITY_LEVELS,
  BLOOD_TYPES,
  FAMILY_RELATIONS,
  type ActivityLevel,
  type BloodType,
  type FamilyHistoryEntry,
  type Sex,
} from '@baymax/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Icon,
  IconButton,
  Screen,
  StackHeader,
  TagInput,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useUpdateMe } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { errorMessage } from '@/lib/api/errors';
import { ageFrom, bmi, formatDate } from '@/lib/format';
import { serverFieldErrors } from '@/lib/forms';
import { useAuth } from '@/stores/auth';
import { useTheme } from '@/theme/ThemeProvider';

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Very active',
};
const num = (v: string) => (v.trim() === '' ? undefined : Number(v));

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Card style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={22} color={colors.primary} />
        <Text variant="heading">{title}</Text>
      </View>
      {children}
    </Card>
  );
}

export default function HealthProfile() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const user = useAuth((s) => s.user)!;
  const update = useUpdateMe();
  const p = user.role === 'patient' ? user.patient : undefined;

  const [dateOfBirth, setDob] = useState(p?.dateOfBirth?.slice(0, 10) ?? '');
  const [sex, setSex] = useState<Sex | undefined>(p?.sex);
  const [heightCm, setHeight] = useState(p?.heightCm ? String(p.heightCm) : '');
  const [weightKg, setWeight] = useState(p?.weightKg ? String(p.weightKg) : '');
  const [bloodType, setBloodType] = useState<BloodType | undefined>(p?.bloodType);
  const [activityLevel, setActivity] = useState<ActivityLevel | undefined>(p?.activityLevel);
  const [smoker, setSmoker] = useState(p?.smoker ?? false);
  const [allergies, setAllergies] = useState(p?.allergies ?? []);
  const [conditions, setConditions] = useState((p?.conditions ?? []).map((c) => c.name));
  const [medications, setMedications] = useState(
    (p?.medications ?? []).map((m) => [m.name, m.dosage, m.frequency].filter(Boolean).join(' · ')),
  );
  const [vaccines, setVaccines] = useState((p?.vaccines ?? []).map((v) => v.name));
  const [family, setFamily] = useState<FamilyHistoryEntry[]>(p?.familyHistory ?? []);
  const [familyCondition, setFamilyCondition] = useState('');
  const [familyRelation, setFamilyRelation] = useState<string>(FAMILY_RELATIONS[0]);
  const fields = serverFieldErrors(update.error);
  const header = <StackHeader title="Health profile" fallbackHref="/profile" />;

  if (!p)
    return (
      <Screen header={header}>
        <EmptyState icon="lock-outline" title="Patients only" />
      </Screen>
    );

  const save = () => {
    const keep = <T extends { name: string }>(list: T[], names: string[], make: (n: string) => T) =>
      names.map((n) => list.find((x) => x.name === n) ?? make(n));
    update.mutate(
      {
        patient: {
          dateOfBirth: dateOfBirth || undefined,
          sex,
          heightCm: num(heightCm),
          weightKg: num(weightKg),
          bloodType,
          activityLevel,
          smoker,
          allergies,
          conditions: keep(p.conditions, conditions, (name) => ({ name })),
          medications: medications.map((label) => {
            const existing = p.medications.find(
              (m) => [m.name, m.dosage, m.frequency].filter(Boolean).join(' · ') === label,
            );
            return existing ?? { name: label, dosage: '', frequency: '' };
          }),
          vaccines: keep(p.vaccines, vaccines, (name) => ({
            name,
            date: new Date().toISOString(),
          })),
          familyHistory: family,
        },
      },
      {
        onSuccess: () => {
          toast.success('Health profile saved');
          router.back();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );
  };

  const age = ageFrom(dateOfBirth || undefined);
  const bodyMassIndex = bmi(num(heightCm), num(weightKg));

  const vitals = (
    <Section title="Vitals" icon="heart-pulse">
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { label: 'Age', value: age !== undefined ? `${age}` : '—' },
          { label: 'BMI', value: bodyMassIndex ? String(bodyMassIndex) : '—' },
          { label: 'Blood', value: bloodType ?? '—' },
        ].map((m) => (
          <View
            key={m.label}
            style={{
              flex: 1,
              alignItems: 'center',
              padding: 12,
              borderRadius: 14,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Text variant="title">{m.value}</Text>
            <Text variant="caption" tone="muted">
              {m.label}
            </Text>
          </View>
        ))}
      </View>
      <TextField
        label="Date of birth"
        placeholder="YYYY-MM-DD"
        value={dateOfBirth}
        onChangeText={setDob}
        error={fields['patient.dateOfBirth']}
        maxLength={10}
      />
      <View style={{ gap: 8 }}>
        <Text variant="callout">Sex</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Female" selected={sex === 'female'} onPress={() => setSex('female')} />
          <Chip label="Male" selected={sex === 'male'} onPress={() => setSex('male')} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Height (cm)"
            value={heightCm}
            onChangeText={setHeight}
            keyboardType="numeric"
            error={fields['patient.heightCm']}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="Weight (kg)"
            value={weightKg}
            onChangeText={setWeight}
            keyboardType="numeric"
            error={fields['patient.weightKg']}
          />
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="callout">Blood type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {BLOOD_TYPES.map((b) => (
            <Chip key={b} label={b} selected={bloodType === b} onPress={() => setBloodType(b)} />
          ))}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="callout">Activity level</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ACTIVITY_LEVELS.map((a) => (
            <Chip
              key={a}
              label={ACTIVITY_LABELS[a]}
              selected={activityLevel === a}
              onPress={() => setActivity(a)}
            />
          ))}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="callout">Smoker</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="No" selected={!smoker} onPress={() => setSmoker(false)} />
          <Chip label="Yes" selected={smoker} onPress={() => setSmoker(true)} />
        </View>
      </View>
    </Section>
  );

  const history = (
    <View style={{ gap: 20 }}>
      <Section title="Allergies & conditions" icon="allergy">
        <TagInput
          label="Allergies"
          placeholder="e.g. Penicillin"
          values={allergies}
          onChange={setAllergies}
        />
        <TagInput
          label="Conditions"
          placeholder="e.g. Asthma"
          values={conditions}
          onChange={setConditions}
        />
      </Section>
      <Section title="Medications & vaccines" icon="pill">
        <TagInput
          label="Current medications"
          placeholder="e.g. Cetirizine 10 mg"
          values={medications}
          onChange={setMedications}
        />
        <TagInput
          label="Vaccines"
          placeholder="e.g. Influenza"
          values={vaccines}
          onChange={setVaccines}
        />
      </Section>
      <Section title="Family history" icon="family-tree">
        {family.map((f, i) => (
          <View
            key={`${f.condition}-${i}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Badge label={f.relation} tone="primary" />
            <Text style={{ flex: 1 }}>{f.condition}</Text>
            <IconButton
              icon="close"
              label={`Remove ${f.condition}`}
              variant="plain"
              size={30}
              onPress={() => setFamily(family.filter((_, j) => j !== i))}
            />
          </View>
        ))}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {FAMILY_RELATIONS.map((r) => (
            <Chip
              key={r}
              label={r}
              selected={familyRelation === r}
              onPress={() => setFamilyRelation(r)}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <TextField
              placeholder="Condition, e.g. Diabetes"
              value={familyCondition}
              onChangeText={setFamilyCondition}
            />
          </View>
          <IconButton
            icon="plus"
            label="Add family history"
            variant="tinted"
            size={50}
            onPress={() => {
              if (!familyCondition.trim()) return;
              setFamily([
                ...family,
                { condition: familyCondition.trim(), relation: familyRelation },
              ]);
              setFamilyCondition('');
            }}
          />
        </View>
      </Section>
      {p.surgeries.length ? (
        <Section title="Surgical history" icon="hospital-box-outline">
          {p.surgeries.map((s) => (
            <View key={s.name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{s.name}</Text>
              <Text tone="muted">
                {s.date ? formatDate(s.date, { month: 'short', year: 'numeric' }) : ''}
              </Text>
            </View>
          ))}
        </Section>
      ) : null}
    </View>
  );

  return (
    <Screen
      header={header}
      footer={
        <Button label="Save health profile" size="lg" loading={update.isPending} onPress={save} />
      }
    >
      <Text tone="muted">
        Keeping this up to date helps doctors give you safer, faster care. Only you and your doctors
        can see it.
      </Text>
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>{vitals}</View>
          <View style={{ flex: 1 }}>{history}</View>
        </View>
      ) : (
        <>
          {vitals}
          {history}
        </>
      )}
    </Screen>
  );
}
