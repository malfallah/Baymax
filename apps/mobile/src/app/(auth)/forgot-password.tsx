import { forgotPasswordSchema } from '@baymax/shared';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Icon, Text, TextField } from '@/components/ui';
import { AuthShell } from '@/features/auth/AuthShell';
import { authApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { validateForm } from '@/lib/forms';
import { useTheme } from '@/theme/ThemeProvider';

export default function ForgotPassword() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const reset = useMutation({ mutationFn: authApi.forgotPassword });

  const submit = () => {
    const { data, errors } = validateForm(forgotPasswordSchema, { email });
    setError(errors.email);
    if (data) reset.mutate(data.email);
  };

  if (reset.isSuccess) {
    return (
      <AuthShell>
        <View style={{ alignItems: 'center', gap: 14, paddingVertical: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.successSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="email-check-outline" size={38} color={colors.success} />
          </View>
          <Text variant="title" align="center">
            Check your inbox
          </Text>
          <Text tone="muted" align="center">
            {reset.data.message} The link expires in one hour.
          </Text>
        </View>
        <Button label="Back to sign in" size="lg" onPress={() => router.replace('/sign-in')} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <View style={{ gap: 6 }}>
        <Text variant="display">Reset password</Text>
        <Text tone="muted">
          Enter the email you signed up with and we’ll send you a link to choose a new password.
        </Text>
      </View>
      <TextField
        label="Email"
        icon="email-outline"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        error={error ?? (reset.error ? errorMessage(reset.error) : undefined)}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        onSubmitEditing={submit}
      />
      <Button label="Send reset link" size="lg" loading={reset.isPending} onPress={submit} />
    </AuthShell>
  );
}
