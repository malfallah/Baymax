import { loginSchema } from '@baymax/shared';
import { useMutation } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextField } from '@/components/ui';
import { AuthShell } from '@/features/auth/AuthShell';
import { authApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { IS_DEMO } from '@/lib/config';
import { validateForm, type FieldErrors } from '@/lib/forms';
import { useAuth } from '@/stores/auth';
import { useTheme } from '@/theme/ThemeProvider';

export default function SignIn() {
  const { colors, radius } = useTheme();
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => {
      signIn(token, user);
      router.replace('/home');
    },
  });

  const submit = () => {
    const { data, errors: e } = validateForm(loginSchema, { email, password });
    setErrors(e);
    if (data) login.mutate(data);
  };

  return (
    <AuthShell>
      <View style={{ gap: 6 }}>
        <Text variant="display">Welcome back</Text>
        <Text tone="muted">Sign in to manage your appointments and health.</Text>
      </View>

      {login.error ? (
        <View style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.dangerSoft }}>
          <Text variant="callout" tone="danger">
            {errorMessage(login.error)}
          </Text>
        </View>
      ) : null}

      <View style={{ gap: 16 }}>
        <TextField
          label="Email"
          icon="email-outline"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextField
          label="Password"
          icon="lock-outline"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureToggle
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={submit}
          returnKeyType="go"
        />
        <Link href="/forgot-password" style={{ alignSelf: 'flex-end' }}>
          <Text variant="callout" tone="primary">
            Forgot password?
          </Text>
        </Link>
      </View>

      <Button label="Sign in" size="lg" loading={login.isPending} onPress={submit} />

      {IS_DEMO ? (
        <Text variant="caption" tone="subtle" align="center">
          Demo accounts: patient@baymax.health or doctor@baymax.health — password Baymax123
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        <Text tone="muted">New to Baymax?</Text>
        <Link href="/sign-up">
          <Text tone="primary" variant="bodyMedium">
            Create an account
          </Text>
        </Link>
      </View>
    </AuthShell>
  );
}
