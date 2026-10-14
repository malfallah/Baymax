import { router } from 'expo-router';
import { useState } from 'react';
import { Avatar, Button, Card, Screen, StackHeader, Text, TextField, toast } from '@/components/ui';
import { useUpdateMe } from '@/hooks/queries';
import { errorMessage } from '@/lib/api/errors';
import { serverFieldErrors } from '@/lib/forms';
import { useAuth } from '@/stores/auth';

export default function EditProfile() {
  const user = useAuth((s) => s.user)!;
  const update = useUpdateMe();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const fields = serverFieldErrors(update.error);

  const save = () =>
    update.mutate(
      { fullName, phone },
      {
        onSuccess: () => {
          toast.success('Profile updated');
          router.back();
        },
        onError: (e) => toast.error(errorMessage(e)),
      },
    );

  return (
    <Screen
      header={<StackHeader title="Personal details" fallbackHref="/profile" />}
      maxWidth={640}
      footer={<Button label="Save changes" size="lg" loading={update.isPending} onPress={save} />}
    >
      <Card style={{ alignItems: 'center', gap: 8 }}>
        <Avatar name={fullName || user.fullName} color={user.avatarColor} size={80} />
        <Text variant="caption" tone="muted">
          Your initials are used as your avatar
        </Text>
      </Card>
      <TextField
        label="Full name"
        icon="account-outline"
        value={fullName}
        onChangeText={setFullName}
        error={fields.fullName}
        autoComplete="name"
      />
      <TextField
        label="Email"
        icon="email-outline"
        value={user.email}
        editable={false}
        hint="Contact support to change your email address."
      />
      <TextField
        label="Phone"
        icon="phone-outline"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
      />
    </Screen>
  );
}
