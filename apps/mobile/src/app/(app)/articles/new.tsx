import { ARTICLE_CATEGORIES, createArticleSchema, type ArticleCategory } from '@baymax/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Chip,
  EmptyState,
  Screen,
  StackHeader,
  Text,
  TextField,
  toast,
} from '@/components/ui';
import { useCreateArticle } from '@/hooks/queries';
import { errorMessage } from '@/lib/api/errors';
import { validateForm, type FieldErrors } from '@/lib/forms';
import { useAuth } from '@/stores/auth';

export default function NewArticle() {
  const role = useAuth((s) => s.user?.role);
  const create = useCreateArticle();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('prevention');
  const [errors, setErrors] = useState<FieldErrors>({});
  const header = <StackHeader title="New article" fallbackHref="/community" />;

  if (role !== 'doctor') {
    return (
      <Screen header={header}>
        <EmptyState
          icon="lock-outline"
          title="Doctors only"
          message="Only verified doctors can publish articles to the health library."
        />
      </Screen>
    );
  }

  const publish = () => {
    const { data, errors: e } = validateForm(createArticleSchema, {
      title,
      summary,
      body,
      category,
    });
    setErrors(e);
    if (!data) return;
    create.mutate(data, {
      onSuccess: (article) => {
        toast.success('Article published');
        router.replace(`/articles/${article.id}`);
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  };

  return (
    <Screen
      header={header}
      maxWidth={760}
      footer={
        <Button
          label="Publish article"
          icon="send"
          size="lg"
          loading={create.isPending}
          onPress={publish}
        />
      }
    >
      <Text tone="muted">
        Share practical, evidence-based advice. Use “## ” at the start of a line for section
        headings.
      </Text>
      <View style={{ gap: 8 }}>
        <Text variant="callout">Topic</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ARTICLE_CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              icon={c.icon}
              color={c.color}
              selected={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </View>
      </View>
      <TextField
        label="Title"
        placeholder="A clear, specific headline"
        value={title}
        onChangeText={setTitle}
        error={errors.title}
      />
      <TextField
        label="Summary"
        placeholder="One or two sentences shown in the library"
        value={summary}
        onChangeText={setSummary}
        error={errors.summary}
        multiline
      />
      <TextField
        label="Article"
        placeholder="Write your article…"
        value={body}
        onChangeText={setBody}
        error={errors.body}
        hint={`${body.trim().split(/\s+/).filter(Boolean).length} words`}
        multiline
        style={{ minHeight: 260 }}
      />
    </Screen>
  );
}
