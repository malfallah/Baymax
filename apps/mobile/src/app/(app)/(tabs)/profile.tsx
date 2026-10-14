import { SPECIALTY_BY_KEY } from '@baymax/shared';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { View } from 'react-native';
import {
  Avatar,
  Badge,
  Card,
  ListRow,
  PageHeader,
  Screen,
  SegmentedControl,
  Text,
  confirm,
  toast,
} from '@/components/ui';
import { useLayout } from '@/hooks/useLayout';
import { IS_DEMO } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/stores/auth';
import { useCart } from '@/stores/cart';
import { usePreferences, type ThemePreference } from '@/stores/preferences';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProfileTab() {
  const { colors } = useTheme();
  const { isWide } = useLayout();
  const qc = useQueryClient();
  const user = useAuth((s) => s.user)!;
  const signOut = useAuth((s) => s.signOut);
  const clearCart = useCart((s) => s.clear);
  const theme = usePreferences((s) => s.theme);
  const setTheme = usePreferences((s) => s.setTheme);
  const isDoctor = user.role === 'doctor';

  const logout = async () => {
    if (
      !(await confirm({
        title: 'Sign out of Baymax?',
        confirmLabel: 'Sign out',
        destructive: true,
      }))
    )
      return;
    signOut();
    clearCart();
    qc.clear();
    router.replace('/welcome');
  };

  const resetDemo = async () => {
    if (
      !(await confirm({
        title: 'Reset demo data?',
        message: 'All bookings, orders and posts you created in this browser will be removed.',
        confirmLabel: 'Reset',
        destructive: true,
      }))
    )
      return;
    const { resetDemoData } = await import('@/lib/demo/server');
    await resetDemoData();
    signOut();
    clearCart();
    qc.clear();
    toast.success('Demo data has been reset');
    router.replace('/welcome');
  };

  return (
    <Screen>
      <PageHeader title="Profile" subtitle="Manage your account and preferences" />
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
        <Card
          style={{
            alignItems: 'center',
            gap: 10,
            paddingVertical: 28,
            width: isWide ? 320 : '100%',
          }}
        >
          <Avatar name={user.fullName} color={user.avatarColor} size={88} />
          <Text variant="title" align="center">
            {user.fullName}
          </Text>
          <Text tone="muted">{user.email}</Text>
          <Badge
            align="center"
            tone={isDoctor ? 'primary' : 'success'}
            icon={isDoctor ? 'doctor' : 'account-heart-outline'}
            label={isDoctor ? SPECIALTY_BY_KEY[user.doctor.specialty].practitioner : 'Patient'}
          />
          <Text variant="caption" tone="subtle">
            Member since {formatDate(user.createdAt, { month: 'long', year: 'numeric' })}
          </Text>
        </Card>

        <View style={{ flex: 1, gap: 20, width: '100%' }}>
          <Card padding={8} style={{ paddingHorizontal: 16 }}>
            <ListRow
              icon="account-edit-outline"
              title="Personal details"
              subtitle="Name and phone number"
              onPress={() => router.push('/profile/edit')}
            />
            {isDoctor ? (
              <ListRow
                icon="hospital-building"
                title="Practice details"
                subtitle="Clinic, fees and bio"
                onPress={() => router.push('/profile/practice')}
              />
            ) : (
              <>
                <ListRow
                  icon="heart-pulse"
                  title="Health profile"
                  subtitle="Vitals, allergies, conditions, medications"
                  onPress={() => router.push('/profile/health')}
                />
                <ListRow
                  icon="receipt-text-outline"
                  title="Orders"
                  subtitle="Your pharmacy orders"
                  onPress={() => router.push('/orders')}
                />
              </>
            )}
            <ListRow
              icon="calendar-month-outline"
              title="Appointments"
              onPress={() => router.push('/care')}
            />
            <ListRow
              icon="lock-outline"
              title="Change password"
              onPress={() => router.push('/profile/password')}
              last
            />
          </Card>

          <Card style={{ gap: 12 }}>
            <Text variant="subheading">Appearance</Text>
            <SegmentedControl<ThemePreference>
              value={theme}
              onChange={setTheme}
              segments={[
                { value: 'system', label: 'System' },
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </Card>

          <Card padding={8} style={{ paddingHorizontal: 16 }}>
            {IS_DEMO ? (
              <ListRow
                icon="database-refresh-outline"
                title="Reset demo data"
                subtitle="Restore the original sample data"
                onPress={resetDemo}
              />
            ) : null}
            <ListRow icon="logout" title="Sign out" destructive onPress={logout} last />
          </Card>
          <Text variant="caption" tone="subtle" align="center" style={{ color: colors.textSubtle }}>
            Baymax 2.0 · Made with care
          </Text>
        </View>
      </View>
    </Screen>
  );
}
