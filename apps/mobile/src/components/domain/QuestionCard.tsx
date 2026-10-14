import type { Question } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { formatRelative } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { Avatar, Badge, Card, Icon, Text } from '../ui';

export function QuestionCard({ question }: { question: Question }) {
  const { colors } = useTheme();
  const doctorAnswered = question.answers.some((a) => a.author.role === 'doctor');
  return (
    <Card
      onPress={() => router.push(`/questions/${question.id}`)}
      accessibilityLabel={question.title}
    >
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Avatar name={question.author.fullName} color={question.author.avatarColor} size={26} />
          <Text variant="caption" tone="muted" style={{ flex: 1 }} numberOfLines={1}>
            {question.author.fullName} · {formatRelative(question.createdAt)}
          </Text>
          {doctorAnswered ? (
            <Badge tone="success" icon="check-decagram" label="Doctor answered" />
          ) : null}
        </View>
        <Text variant="subheading">{question.title}</Text>
        <Text variant="callout" tone="muted" numberOfLines={2}>
          {question.body}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {question.tags.map((t) => (
            <Badge key={t} label={`#${t}`} />
          ))}
          <View style={{ flex: 1 }} />
          <Icon name="message-reply-text-outline" size={16} color={colors.textSubtle} />
          <Text variant="caption" tone="subtle">
            {question.answers.length} {question.answers.length === 1 ? 'answer' : 'answers'}
          </Text>
        </View>
      </View>
    </Card>
  );
}
