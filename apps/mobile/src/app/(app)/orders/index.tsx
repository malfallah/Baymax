import { router } from 'expo-router';
import { View } from 'react-native';
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  Screen,
  SkeletonList,
  StackHeader,
  Text,
} from '@/components/ui';
import { ORDER_STATUS } from '@/components/domain/orderStatus';
import { useOrders } from '@/hooks/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

export default function OrdersScreen() {
  const { colors } = useTheme();
  const { data, isLoading, error, refetch, isRefetching } = useOrders();
  return (
    <Screen
      header={<StackHeader title="Your orders" fallbackHref="/pharmacy" />}
      maxWidth={820}
      onRefresh={refetch}
      refreshing={isRefetching}
    >
      {isLoading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          icon="receipt-text-outline"
          title="No orders yet"
          message="Your pharmacy orders will appear here."
          actionLabel="Shop pharmacy"
          onAction={() => router.replace('/pharmacy')}
        />
      ) : (
        data.map((o) => (
          <Card
            key={o.id}
            onPress={() => router.push(`/orders/${o.id}`)}
            accessibilityLabel={`Order from ${formatDate(o.createdAt)}`}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: colors.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="package-variant-closed" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text variant="subheading">Order #{o.id.slice(-6).toUpperCase()}</Text>
                <Text variant="caption" tone="muted" numberOfLines={1}>
                  {formatDate(o.createdAt)} · {o.items.reduce((n, i) => n + i.quantity, 0)} items
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text variant="subheading">{formatMoney(o.totalCents)}</Text>
                <Badge {...ORDER_STATUS[o.status]} />
              </View>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
