import { ARTICLE_CATEGORIES, type ArticleCategory } from '@baymax/shared';
import { router } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ArticleCard } from '@/components/domain/ArticleCard';
import { QuestionCard } from '@/components/domain/QuestionCard';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Grid,
  PageHeader,
  Screen,
  SearchBar,
  SegmentedControl,
  SkeletonList,
} from '@/components/ui';
import { useArticles, useQuestions } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { useAuth } from '@/stores/auth';

type Section = 'articles' | 'questions';

export default function CommunityTab() {
  const user = useAuth((s) => s.user)!;
  const { columns } = useLayout();
  const [section, setSection] = useState<Section>('articles');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<ArticleCategory>();
  const query = useDeferredValue(q);
  const articles = useArticles({ q: query || undefined, category });
  const questions = useQuestions({ q: query || undefined });
  const active = section === 'articles' ? articles : questions;

  return (
    <Screen onRefresh={active.refetch} refreshing={active.isRefetching}>
      <PageHeader
        title="Community"
        subtitle="Trusted health articles and answers from doctors"
        actions={<HeaderActions />}
      />
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 240, maxWidth: 420 }}>
          <SegmentedControl<Section>
            value={section}
            onChange={setSection}
            segments={[
              { value: 'articles', label: 'Health library' },
              { value: 'questions', label: 'Q&A' },
            ]}
          />
        </View>
        {section === 'questions' ? (
          <Button
            label="Ask a question"
            icon="plus"
            onPress={() => router.push('/questions/new')}
          />
        ) : user.role === 'doctor' ? (
          <Button
            label="Write article"
            icon="pencil-outline"
            onPress={() => router.push('/articles/new')}
          />
        ) : null}
      </View>
      <SearchBar
        value={q}
        onChangeText={setQ}
        placeholder={section === 'articles' ? 'Search articles' : 'Search questions'}
      />

      {section === 'articles' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            <Chip label="All topics" selected={!category} onPress={() => setCategory(undefined)} />
            {ARTICLE_CATEGORIES.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                icon={c.icon}
                color={c.color}
                selected={category === c.key}
                onPress={() => setCategory(category === c.key ? undefined : c.key)}
              />
            ))}
          </ScrollView>
          {articles.isLoading ? (
            <SkeletonList count={3} height={260} />
          ) : articles.error ? (
            <ErrorState error={articles.error} onRetry={articles.refetch} />
          ) : !articles.data?.length ? (
            <Card>
              <EmptyState
                icon="book-open-blank-variant"
                title="No articles found"
                message="Try another topic or search term."
              />
            </Card>
          ) : (
            <Grid columns={columns} gap={16}>
              {articles.data.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </Grid>
          )}
        </>
      ) : questions.isLoading ? (
        <SkeletonList count={4} height={150} />
      ) : questions.error ? (
        <ErrorState error={questions.error} onRetry={questions.refetch} />
      ) : !questions.data?.length ? (
        <Card>
          <EmptyState
            icon="forum-outline"
            title="No questions yet"
            message="Be the first to ask the community."
            actionLabel="Ask a question"
            onAction={() => router.push('/questions/new')}
          />
        </Card>
      ) : (
        <Grid columns={Math.min(columns, 2)} gap={14}>
          {questions.data.map((qn) => (
            <QuestionCard key={qn.id} question={qn} />
          ))}
        </Grid>
      )}
    </Screen>
  );
}
