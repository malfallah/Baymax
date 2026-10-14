import { changePasswordSchema } from '@baymax/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { Button, Screen, StackHeader, Text, TextField, toast } from '@/components/ui';
import { useChangePassword } from '@/hooks/queries';
import { errorMessage } from '@/lib/api/errors';
import { validateForm, type FieldErrors } from '@/lib/forms';

export default function ChangePassword() {
  const change = useChangePassword();
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNext] = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const save = () => {
    const { data, errors: e } = validateForm(changePasswordSchema, {
      currentPassword,
      newPassword,
    });
    if (newPassword !== confirmPassword) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (!data || e.confirm) return;
    change.mutate(data, {
      onSuccess: () => {
        toast.success('Password changed');
        router.back();
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <Screen header={<StackHeader title="Change password" fallbackHref="/profile" />} maxWidth={560}>
      <Text tone="muted">Choose a strong password you don’t use anywhere else.</Text>
      <TextField
        label="Current password"
        icon="lock-outline"
        value={currentPassword}
        onChangeText={setCurrent}
        error={errors.currentPassword}
        secureToggle
        autoComplete="current-password"
      />
      <TextField
        label="New password"
        icon="lock-plus-outline"
        value={newPassword}
        onChangeText={setNext}
        error={errors.newPassword}
        hint="8+ characters with a letter and a number."
        secureToggle
        autoComplete="new-password"
      />
      <TextField
        label="Confirm new password"
        icon="lock-check-outline"
        value={confirmPassword}
        onChangeText={setConfirm}
        error={errors.confirm}
        secureToggle
        autoComplete="new-password"
      />
      <Button label="Update password" size="lg" loading={change.isPending} onPress={save} />
    </Screen>
  );
}
