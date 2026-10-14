import { FREE_SHIPPING_THRESHOLD_CENTS, shippingFor } from '@baymax/shared';
import { View } from 'react-native';
import { formatMoney } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '../ui';

export function OrderSummary({
  subtotal,
  shippingCents,
}: {
  subtotal: number;
  shippingCents?: number;
}) {
  const { colors } = useTheme();
  const shipping = shippingCents ?? shippingFor(subtotal);
  const rows = [
    ['Subtotal', formatMoney(subtotal)],
    ['Delivery', shipping === 0 ? 'Free' : formatMoney(shipping)],
  ];
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text tone="muted">{k}</Text>
          <Text variant="bodyMedium">{v}</Text>
        </View>
      ))}
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="heading">Total</Text>
        <Text variant="heading">{formatMoney(subtotal + shipping)}</Text>
      </View>
      {shipping > 0 && shippingCents === undefined ? (
        <Text variant="caption" tone="success">
          Add {formatMoney(FREE_SHIPPING_THRESHOLD_CENTS - subtotal)} more for free delivery.
        </Text>
      ) : null}
    </View>
  );
}
