import { ARTICLE_CATEGORIES, type Article } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { formatRelative } from '@/lib/format';
import { Avatar, Card, Text } from '../ui';
import { Artwork } from './Artwork';

export const articleCategory = (key: Article['category']) =>
  ARTICLE_CATEGORIES.find((c) => c.key === key)!;

export function ArticleCard({ article, compact }: { article: Article; compact?: boolean }) {
  const category = articleCategory(article.category);
  return (
    <Card
      padding={0}
      onPress={() => router.push(`/articles/${article.id}`)}
      accessibilityLabel={article.title}
      style={{ overflow: 'hidden' }}
    >
      <Artwork
        color={category.color}
        icon={category.icon}
        height={compact ? 110 : 150}
        radius={0}
        iconSize={compact ? 44 : 60}
      />
      <View style={{ padding: 16, gap: 8 }}>
        <Text variant="overline" color={category.color}>
          {category.label} · {article.readMinutes} min read
        </Text>
        <Text variant="subheading" numberOfLines={2}>
          {article.title}
        </Text>
        {!compact ? (
          <Text variant="callout" tone="muted" numberOfLines={2}>
            {article.summary}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <Avatar name={article.author.fullName} color={article.author.avatarColor} size={22} />
          <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
            {article.author.fullName} · {formatRelative(article.publishedAt)}
          </Text>
        </View>
      </View>
    </Card>
  );
}
