import { createAnswerSchema } from '@baymax/shared';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StackHeader,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useAnswerQuestion, useQuestion } from '@/hooks/queries';
import { errorMessage } from '@/lib/api/errors';
import { formatRelative } from '@/lib/format';
import { validateForm } from '@/lib/forms';
import { useTheme } from '@/theme/ThemeProvider';

export default function QuestionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { data, isLoading, error, refetch } = useQuestion(id);
  const answer = useAnswerQuestion(id);
  const [reply, setReply] = useState('');
  const [replyError, setReplyError] = useState<string>();
  const header = <StackHeader title="Question" fallbackHref="/community" />;

  if (isLoading)
    return (
      <Screen header={header} maxWidth={820}>
        <LoadingState />
      </Screen>
    );
  if (error || !data)
    return (
      <Screen header={header} maxWidth={820}>
        <ErrorState error={error} onRetry={refetch} />
      </Screen>
    );

  const submit = () => {
    const { data: input, errors } = validateForm(createAnswerSchema, { body: reply });
    setReplyError(errors.body);
    if (!input) return;
    answer.mutate(input.body, {
      onSuccess: () => {
        setReply('');
        toast.success('Your answer was posted');
      },
      onError: (e) => toast.error(errorMessage(e)),
    });
  };

  const answers = [...data.answers].sort(
    (a, b) => Number(b.author.role === 'doctor') - Number(a.author.role === 'doctor'),
  );

  return (
    <Screen header={header} maxWidth={820}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Avatar name={data.author.fullName} color={data.author.avatarColor} size={36} />
          <View style={{ flex: 1 }}>
            <Text variant="callout">{data.author.fullName}</Text>
            <Text variant="caption" tone="subtle">
              Asked {formatRelative(data.createdAt)}
            </Text>
          </View>
        </View>
        <Text variant="title">{data.title}</Text>
        <Text tone="muted" style={{ fontSize: 16, lineHeight: 25 }}>
          {data.body}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {data.tags.map((t) => (
            <Badge key={t} label={`#${t}`} />
          ))}
        </View>
      </Card>

      <Text variant="heading">
        {answers.length} {answers.length === 1 ? 'answer' : 'answers'}
      </Text>
      {answers.map((a) => {
        const isDoctor = a.author.role === 'doctor';
        return (
          <Card
            key={a.id}
            style={{ gap: 10, borderLeftWidth: isDoctor ? 4 : 0, borderLeftColor: colors.primary }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar name={a.author.fullName} color={a.author.avatarColor} size={36} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text variant="callout">{a.author.fullName}</Text>
                  {isDoctor ? (
                    <Icon name="check-decagram" size={16} color={colors.primary} />
                  ) : null}
                </View>
                <Text variant="caption" tone="subtle">
                  {isDoctor ? 'Verified doctor' : 'Community member'} ·{' '}
                  {formatRelative(a.createdAt)}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{a.body}</Text>
          </Card>
        );
      })}
      {!answers.length ? (
        <Text tone="muted">No answers yet — doctors are notified about new questions.</Text>
      ) : null}

      <Card style={{ gap: 12 }}>
        <Text variant="subheading">Your answer</Text>
        <TextField
          placeholder="Share what you know. Be kind and specific."
          value={reply}
          onChangeText={setReply}
          error={replyError}
          multiline
        />
        <Button
          label="Post answer"
          icon="send"
          loading={answer.isPending}
          onPress={submit}
          style={{ alignSelf: 'flex-end' }}
        />
      </Card>
    </Screen>
  );
}
