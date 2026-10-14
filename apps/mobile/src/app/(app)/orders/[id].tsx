import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { OrderSummary } from '@/components/domain/OrderSummary';
import { ORDER_STATUS } from '@/components/domain/orderStatus';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StackHeader,
  Text,
} from '@/components/ui';
import { useOrder } from '@/hooks/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

export default function OrderDetail() {
  const { id, placed } = useLocalSearchParams<{ id: string; placed?: string }>();
  const { colors, radius } = useTheme();
  const { data, isLoading, error, refetch } = useOrder(id);
  const header = <StackHeader title="Order details" fallbackHref="/orders" />;

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

  const steps = ['Order placed', 'Processing', 'Shipped', 'Delivered'];
  const reached = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: 0 }[data.status];

  return (
    <Screen header={header} maxWidth={760}>
      {placed ? (
        <View style={{ alignItems: 'center', gap: 10, paddingVertical: 12 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: colors.successSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check-circle" size={52} color={colors.success} />
          </View>
          <Text variant="title" align="center">
            Thank you for your order!
          </Text>
          <Text tone="muted" align="center">
            We’ve received your payment and will deliver to {data.shipping.city} within 1–2 days.
          </Text>
        </View>
      ) : null}

      <Card style={{ gap: 18 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <View>
            <Text variant="heading">Order #{data.id.slice(-6).toUpperCase()}</Text>
            <Text variant="caption" tone="muted">
              {formatDate(data.createdAt, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <Badge {...ORDER_STATUS[data.status]} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {steps.map((s, i) => (
            <View key={s} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <View
                  style={{
                    flex: 1,
                    height: 3,
                    backgroundColor:
                      i === 0 ? 'transparent' : i <= reached ? colors.primary : colors.border,
                  }}
                />
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: i <= reached ? colors.primary : colors.surfaceMuted,
                  }}
                >
                  {i <= reached ? <Icon name="check" size={14} color="#fff" /> : null}
                </View>
                <View
                  style={{
                    flex: 1,
                    height: 3,
                    backgroundColor:
                      i === steps.length - 1
                        ? 'transparent'
                        : i < reached
                          ? colors.primary
                          : colors.border,
                  }}
                />
              </View>
              <Text
                variant="caption"
                tone={i <= reached ? 'default' : 'subtle'}
                align="center"
                style={{ fontSize: 11 }}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 14 }}>
        <Text variant="heading">Items</Text>
        {data.items.map((i) => (
          <View
            key={i.productId}
            style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}
          >
            <Text style={{ flex: 1 }}>
              {i.quantity} × {i.name}
            </Text>
            <Text variant="bodyMedium">{formatMoney(i.priceCents * i.quantity)}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: colors.border }} />
        <OrderSummary subtotal={data.subtotalCents} shippingCents={data.shippingCents} />
      </Card>

      <Card style={{ gap: 8 }}>
        <Text variant="heading">Delivery address</Text>
        <Text>{data.shipping.fullName}</Text>
        <Text tone="muted">
          {data.shipping.line1}, {data.shipping.city}
        </Text>
        <Text tone="muted">{data.shipping.phone}</Text>
      </Card>

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          padding: 14,
          borderRadius: radius.lg,
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <Icon name="headset" size={18} color={colors.textMuted} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          Questions about your order? Contact our pharmacists at support@baymax.health.
        </Text>
      </View>
      <Button
        label="Continue shopping"
        variant="outline"
        onPress={() => router.replace('/pharmacy')}
      />
    </Screen>
  );
}
