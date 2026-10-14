import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Artwork } from '@/components/domain/Artwork';
import { articleCategory } from '@/components/domain/ArticleCard';
import { RichText } from '@/components/domain/RichText';
import {
  Avatar,
  Badge,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StackHeader,
  Text,
} from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useArticle } from '@/hooks/queries';
import { useTheme } from '@/theme/ThemeProvider';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius } = useTheme();
  const { data, isLoading, error, refetch } = useArticle(id);
  const header = <StackHeader title="Health library" fallbackHref="/community" />;

  if (isLoading)
    return (
      <Screen header={header} maxWidth={760}>
        <LoadingState />
      </Screen>
    );
  if (error || !data)
    return (
      <Screen header={header} maxWidth={760}>
        <ErrorState error={error} onRetry={refetch} />
      </Screen>
    );
  const category = articleCategory(data.category);

  return (
    <Screen header={header} maxWidth={760}>
      <Artwork
        color={category.color}
        icon={category.icon}
        height={220}
        radius={radius.xxl}
        iconSize={88}
      />
      <View style={{ gap: 14 }}>
        <Badge
          label={`${category.label} · ${data.readMinutes} min read`}
          icon={category.icon}
          tone="primary"
        />
        <Text variant="display" accessibilityRole="header">
          {data.title}
        </Text>
        <Text
          variant="subheading"
          tone="muted"
          style={{ fontFamily: 'Inter_400Regular', fontSize: 18, lineHeight: 27 }}
        >
          {data.summary}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Avatar name={data.author.fullName} color={data.author.avatarColor} size={44} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="subheading">{data.author.fullName}</Text>
              {data.author.role === 'doctor' ? (
                <Icon name="check-decagram" size={16} color={colors.primary} />
              ) : null}
            </View>
            <Text variant="caption" tone="muted">
              {data.author.role === 'doctor' ? 'Medically reviewed' : 'Community member'} ·{' '}
              {formatDate(data.publishedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>
      <RichText body={data.body} />
    </Screen>
  );
}
