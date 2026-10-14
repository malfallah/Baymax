import {
  FREE_SHIPPING_THRESHOLD_CENTS,
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from '@baymax/shared';
import { router } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ProductCard } from '@/components/domain/ProductCard';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Grid,
  Icon,
  PageHeader,
  Screen,
  SearchBar,
  Skeleton,
  Text,
} from '@/components/ui';
import { useProducts } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { formatMoney } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

export default function PharmacyTab() {
  const { colors, radius } = useTheme();
  const { width, isWide } = useLayout();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<ProductCategory>();
  const query = useDeferredValue(q);
  const { data, isLoading, error, refetch, isRefetching } = useProducts({
    q: query || undefined,
    category,
  });
  const columns = width >= 1200 ? 4 : width >= 760 ? 3 : 2;

  return (
    <Screen onRefresh={refetch} refreshing={isRefetching}>
      <PageHeader
        title="Pharmacy"
        subtitle="Everyday health essentials, delivered"
        actions={<HeaderActions />}
      />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: radius.xl,
          backgroundColor: colors.successSoft,
        }}
      >
        <Icon name="truck-fast-outline" size={26} color={colors.success} />
        <View style={{ flex: 1 }}>
          <Text variant="subheading" tone="success">
            Free delivery over {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS)}
          </Text>
          <Text variant="caption" tone="success">
            Order before 4 PM for next-day delivery.
          </Text>
        </View>
        {isWide ? (
          <Button
            label="My orders"
            variant="outline"
            icon="receipt-text-outline"
            size="sm"
            onPress={() => router.push('/orders')}
          />
        ) : null}
      </View>
      <SearchBar
        value={q}
        onChangeText={setQ}
        placeholder="Search medicines, brands, ingredients"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
      >
        <Chip label="All" selected={!category} onPress={() => setCategory(undefined)} />
        {PRODUCT_CATEGORIES.map((c) => (
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
      {isLoading ? (
        <Grid columns={columns} gap={14}>
          {Array.from({ length: columns * 2 }, (_, i) => (
            <Skeleton key={i} height={240} radius={20} />
          ))}
        </Grid>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.length ? (
        <Card>
          <EmptyState
            icon="pill-off"
            title="No products found"
            message="Try a different search or category."
          />
        </Card>
      ) : (
        <Grid columns={columns} gap={14}>
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Grid>
      )}
      {!isWide ? (
        <Button
          label="View my orders"
          variant="ghost"
          icon="receipt-text-outline"
          onPress={() => router.push('/orders')}
        />
      ) : null}
    </Screen>
  );
}
