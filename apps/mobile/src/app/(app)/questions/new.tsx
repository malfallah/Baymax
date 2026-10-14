import { createQuestionSchema } from '@baymax/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Icon,
  Screen,
  StackHeader,
  TagInput,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useAskQuestion } from '@/hooks/queries';
import { errorMessage } from '@/lib/api/errors';
import { validateForm, type FieldErrors } from '@/lib/forms';
import { useTheme } from '@/theme/ThemeProvider';

export default function AskQuestion() {
  const { colors, radius } = useTheme();
  const ask = useAskQuestion();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const submit = () => {
    const { data, errors: e } = validateForm(createQuestionSchema, { title, body, tags });
    setErrors(e);
    if (!data) return;
    ask.mutate(data, {
      onSuccess: (q) => {
        toast.success('Question posted');
        router.replace(`/questions/${q.id}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <Screen
      header={<StackHeader title="Ask the community" fallbackHref="/community" />}
      maxWidth={760}
      footer={
        <Button
          label="Post question"
          icon="send"
          size="lg"
          loading={ask.isPending}
          onPress={submit}
        />
      }
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          padding: 14,
          borderRadius: radius.lg,
          backgroundColor: colors.primarySoft,
        }}
      >
        <Icon name="shield-account-outline" size={22} color={colors.primary} />
        <Text variant="callout" tone="primary" style={{ flex: 1 }}>
          Verified doctors answer questions daily. Don’t share personal details such as your full
          address or ID numbers.
        </Text>
      </View>
      <TextField
        label="Your question"
        placeholder="e.g. Is it normal to feel dizzy after donating blood?"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />
      <TextField
        label="Details"
        placeholder="Add context: how long, how severe, what you have tried…"
        value={body}
        onChangeText={setBody}
        error={errors.body}
        multiline
        style={{ minHeight: 160 }}
      />
      <TagInput
        label="Tags"
        placeholder="e.g. sleep"
        values={tags}
        onChange={(v) => setTags(v.slice(0, 5).map((t) => t.toLowerCase().replace(/\s+/g, '-')))}
        hint="Up to 5 tags help the right doctors find your question."
      />
    </Screen>
  );
}
