import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Button, Icon, LogoMark, Text } from '@/components/ui';
import { AuthShell } from '@/features/auth/AuthShell';
import { useDemoSignIn } from '@/features/auth/useDemoSignIn';
import { useLayout } from '@/hooks/useLayout';
import { IS_DEMO } from '@/lib/config';
import { useTheme } from '@/theme/ThemeProvider';

const FEATURES = [
  { icon: 'calendar-check', label: 'Book specialists' },
  { icon: 'stethoscope', label: 'Symptom checker' },
  { icon: 'pill', label: 'Online pharmacy' },
  { icon: 'forum-outline', label: 'Ask doctors' },
];

export default function Welcome() {
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const demo = useDemoSignIn();

  return (
    <AuthShell back={false}>
      {!isWide ? (
        <LinearGradient
          colors={[colors.heroStart, colors.heroEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radius.xxl,
            padding: 24,
            gap: 18,
            overflow: 'hidden',
            marginTop: 12,
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: 260,
              height: 260,
              borderRadius: 130,
              backgroundColor: 'rgba(255,255,255,0.07)',
              right: -90,
              top: -90,
            }}
          />
          <View
            style={{
              alignSelf: 'flex-start',
              padding: 3,
              borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }}
          >
            <LogoMark size={52} />
          </View>
          <Text variant="display" color="#fff">
            Your personal healthcare companion
          </Text>
          <Text color="rgba(255,255,255,0.82)">
            Book trusted doctors, check symptoms, order medicine and get answers — all in one place.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FEATURES.map((f) => (
              <View
                key={f.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                }}
              >
                <Icon name={f.icon} size={14} color="#fff" />
                <Text variant="caption" color="#fff">
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      ) : (
        <View style={{ gap: 8 }}>
          <Text variant="display">Welcome to Baymax</Text>
          <Text tone="muted">Sign in or create an account to manage your care.</Text>
        </View>
      )}

      <View style={{ gap: 12 }}>
        <Button label="Create an account" size="lg" onPress={() => router.push('/sign-up')} />
        <Button
          label="Sign in"
          size="lg"
          variant="outline"
          onPress={() => router.push('/sign-in')}
        />
      </View>

      {IS_DEMO ? (
        <View
          style={{
            gap: 12,
            padding: 16,
            borderRadius: radius.xl,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="flask-outline" size={18} color={colors.primary} />
            <Text variant="subheading">Just exploring?</Text>
          </View>
          <Text variant="callout" tone="muted">
            Jump straight in with a demo account. Everything you do is saved in this browser only.
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="Patient demo"
              icon="account-heart-outline"
              variant="secondary"
              style={{ flex: 1 }}
              loading={demo.isPending && demo.variables === 'patient'}
              onPress={() => demo.mutate('patient')}
            />
            <Button
              label="Doctor demo"
              icon="doctor"
              variant="secondary"
              style={{ flex: 1 }}
              loading={demo.isPending && demo.variables === 'doctor'}
              onPress={() => demo.mutate('doctor')}
            />
          </View>
        </View>
      ) : null}

      <Text variant="caption" tone="subtle" align="center">
        By continuing you agree to our Terms and Privacy Policy. Baymax does not replace
        professional medical advice.
      </Text>
    </AuthShell>
  );
}
