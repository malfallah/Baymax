import {
  ACTIVITY_LEVELS,
  BLOOD_TYPES,
  SPECIALTIES,
  emailSchema,
  passwordSchema,
  registerDoctorSchema,
  registerPatientSchema,
  type ActivityLevel,
  type BloodType,
  type RegisterInput,
  type Role,
  type Sex,
  type SpecialtyKey,
} from '@baymax/shared';
import { useMutation } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { z } from 'zod';
import { Button, Chip, Icon, TagInput, Text, TextField, toast } from '@/components/ui';
import { AuthShell } from '@/features/auth/AuthShell';
import { StepIndicator } from '@/features/auth/StepIndicator';
import { authApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { serverFieldErrors, validateForm, type FieldErrors } from '@/lib/forms';
import { useAuth } from '@/stores/auth';
import { useTheme } from '@/theme/ThemeProvider';

const accountSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name'),
  email: emailSchema,
  password: passwordSchema,
});

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  active: 'Very active',
};
const num = (v: string) => (v.trim() === '' ? undefined : Number(v));

function RoleCard({
  role,
  selected,
  onPress,
}: {
  role: Role;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, radius } = useTheme();
  const copy =
    role === 'patient'
      ? {
          icon: 'account-heart-outline',
          title: "I'm a patient",
          text: 'Book visits, check symptoms and order medicine.',
        }
      : {
          icon: 'doctor',
          title: "I'm a doctor",
          text: 'Publish availability and care for patients.',
        };
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[
        {
          flex: 1,
          padding: 16,
          gap: 10,
          borderRadius: radius.xl,
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primarySoft : colors.surface,
        },
        Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Icon name={copy.icon} size={28} color={selected ? colors.primary : colors.textMuted} />
        <Icon
          name={selected ? 'radiobox-marked' : 'radiobox-blank'}
          size={22}
          color={selected ? colors.primary : colors.borderStrong}
        />
      </View>
      <Text variant="subheading">{copy.title}</Text>
      <Text variant="caption" tone="muted">
        {copy.text}
      </Text>
    </Pressable>
  );
}

export default function SignUp() {
  const signIn = useAuth((s) => s.signIn);
  const [role, setRole] = useState<Role>('patient');
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  // Patient — personal & health
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState<Sex>();
  const [nationality, setNationality] = useState('');
  const [address, setAddress] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [bloodType, setBloodType] = useState<BloodType>();
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>();
  const [smoker, setSmoker] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  // Doctor
  const [specialty, setSpecialty] = useState<SpecialtyKey>('general');
  const [clinic, setClinic] = useState('');
  const [city, setCity] = useState('');
  const [years, setYears] = useState('');
  const [education, setEducation] = useState('');
  const [fee, setFee] = useState('');
  const [bio, setBio] = useState('');

  const steps =
    role === 'patient'
      ? ['Account', 'About you', 'Health basics', 'Medical history']
      : ['Account', 'Practice'];

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ token, user }) => {
      signIn(token, user);
      toast.success(`Welcome to Baymax, ${user.fullName.split(' ')[0]}!`);
      router.replace('/home');
    },
    onError: (error) => {
      const fields = serverFieldErrors(error);
      setErrors(fields);
      if (fields.email || fields.password || fields.fullName) setStep(0);
    },
  });

  const payload = (): RegisterInput =>
    role === 'patient'
      ? {
          role,
          fullName,
          email,
          password,
          phone: phone || undefined,
          patient: {
            dateOfBirth: dateOfBirth || undefined,
            sex,
            nationality: nationality || undefined,
            address: address || undefined,
            heightCm: num(heightCm),
            weightKg: num(weightKg),
            bloodType,
            activityLevel,
            smoker,
            allergies,
            conditions: conditions.map((name) => ({ name })),
            medications: medications.map((name) => ({ name, dosage: '', frequency: '' })),
            vaccines: [],
            surgeries: [],
            familyHistory: [],
          },
        }
      : {
          role,
          fullName,
          email,
          password,
          phone: phone || undefined,
          doctor: {
            specialty,
            clinic,
            city,
            yearsOfExperience: num(years) ?? Number.NaN,
            education,
            consultationFeeCents: Math.round((num(fee) ?? Number.NaN) * 100),
            bio,
            languages: ['English'],
          },
        };

  const next = () => {
    if (step === 0) {
      const { errors: e } = validateForm(accountSchema, { fullName, email, password });
      setErrors(e);
      if (Object.keys(e).length) return;
    } else {
      const schema = role === 'patient' ? registerPatientSchema : registerDoctorSchema;
      const { errors: e } = validateForm(schema, payload());
      const relevant = Object.fromEntries(
        Object.entries(e).map(([k, v]) => [k.replace(/^(patient|doctor)\./, ''), v]),
      );
      setErrors(relevant);
      if (Object.keys(relevant).length) return;
    }
    if (step < steps.length - 1) setStep(step + 1);
    else register.mutate(payload());
  };

  return (
    <AuthShell maxWidth={520}>
      <View style={{ gap: 6 }}>
        <Text variant="display">Create your account</Text>
        <Text tone="muted">It only takes a minute. Your information is private and secure.</Text>
      </View>

      {step === 0 ? (
        <View style={{ flexDirection: 'row', gap: 12 }} accessibilityRole="radiogroup">
          <RoleCard
            role="patient"
            selected={role === 'patient'}
            onPress={() => setRole('patient')}
          />
          <RoleCard role="doctor" selected={role === 'doctor'} onPress={() => setRole('doctor')} />
        </View>
      ) : null}

      <StepIndicator steps={steps} current={step} />

      {step === 0 ? (
        <View style={{ gap: 16 }}>
          <TextField
            label="Full name"
            icon="account-outline"
            placeholder={role === 'doctor' ? 'Dr. Jane Smith' : 'Jane Smith'}
            value={fullName}
            onChangeText={setFullName}
            error={errors.fullName}
            autoComplete="name"
          />
          <TextField
            label="Email"
            icon="email-outline"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextField
            label="Password"
            icon="lock-outline"
            placeholder="At least 8 characters"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            hint="Use 8+ characters with a letter and a number."
            secureToggle
            autoComplete="new-password"
          />
          <TextField
            label="Phone (optional)"
            icon="phone-outline"
            placeholder="+1 555 000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>
      ) : null}

      {role === 'patient' && step === 1 ? (
        <View style={{ gap: 16 }}>
          <TextField
            label="Date of birth"
            icon="cake-variant-outline"
            placeholder="YYYY-MM-DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            error={errors.dateOfBirth}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          <View style={{ gap: 8 }}>
            <Text variant="callout">Sex</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip
                label="Female"
                icon="gender-female"
                selected={sex === 'female'}
                onPress={() => setSex('female')}
              />
              <Chip
                label="Male"
                icon="gender-male"
                selected={sex === 'male'}
                onPress={() => setSex('male')}
              />
            </View>
          </View>
          <TextField
            label="Nationality"
            icon="flag-outline"
            placeholder="e.g. Lebanese"
            value={nationality}
            onChangeText={setNationality}
          />
          <TextField
            label="Address"
            icon="home-outline"
            placeholder="Street, city"
            value={address}
            onChangeText={setAddress}
            autoComplete="street-address"
          />
        </View>
      ) : null}

      {role === 'patient' && step === 2 ? (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Height (cm)"
                placeholder="170"
                value={heightCm}
                onChangeText={setHeightCm}
                error={errors.heightCm}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Weight (kg)"
                placeholder="65"
                value={weightKg}
                onChangeText={setWeightKg}
                error={errors.weightKg}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="callout">Blood type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {BLOOD_TYPES.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  selected={bloodType === b}
                  onPress={() => setBloodType(b)}
                />
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
                  onPress={() => setActivityLevel(a)}
                />
              ))}
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Text variant="callout">Do you smoke?</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="No" selected={!smoker} onPress={() => setSmoker(false)} />
              <Chip label="Yes" selected={smoker} onPress={() => setSmoker(true)} />
            </View>
          </View>
        </View>
      ) : null}

      {role === 'patient' && step === 3 ? (
        <View style={{ gap: 18 }}>
          <TagInput
            label="Allergies"
            placeholder="e.g. Penicillin"
            values={allergies}
            onChange={setAllergies}
          />
          <TagInput
            label="Ongoing conditions"
            placeholder="e.g. Asthma"
            values={conditions}
            onChange={setConditions}
          />
          <TagInput
            label="Current medications"
            placeholder="e.g. Metformin 500 mg"
            values={medications}
            onChange={setMedications}
            hint="You can add more detail later in your health profile."
          />
        </View>
      ) : null}

      {role === 'doctor' && step === 1 ? (
        <View style={{ gap: 16 }}>
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
            placeholder="Baymax Family Clinic"
            value={clinic}
            onChangeText={setClinic}
            error={errors.clinic}
          />
          <TextField
            label="City"
            icon="map-marker-outline"
            placeholder="San Francisco"
            value={city}
            onChangeText={setCity}
            error={errors.city}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextField
                label="Years of experience"
                placeholder="10"
                value={years}
                onChangeText={setYears}
                error={errors.yearsOfExperience && 'Enter a number'}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label="Consultation fee ($)"
                placeholder="60"
                value={fee}
                onChangeText={setFee}
                error={errors.consultationFeeCents && 'Enter a fee'}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
          <TextField
            label="Education"
            icon="school-outline"
            placeholder="MD, University"
            value={education}
            onChangeText={setEducation}
            error={errors.education}
          />
          <TextField
            label="Short bio"
            placeholder="Tell patients about your approach to care"
            value={bio}
            onChangeText={setBio}
            multiline
          />
        </View>
      ) : null}

      {register.error && !Object.keys(serverFieldErrors(register.error)).length ? (
        <Text tone="danger">{errorMessage(register.error)}</Text>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {step > 0 ? (
          <Button
            label="Back"
            variant="outline"
            size="lg"
            onPress={() => setStep(step - 1)}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          label={step === steps.length - 1 ? 'Create account' : 'Continue'}
          size="lg"
          iconRight={step === steps.length - 1 ? undefined : 'arrow-right'}
          loading={register.isPending}
          onPress={next}
          style={{ flex: 2 }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        <Text tone="muted">Already have an account?</Text>
        <Link href="/sign-in">
          <Text tone="primary" variant="bodyMedium">
            Sign in
          </Text>
        </Link>
      </View>
    </AuthShell>
  );
}
