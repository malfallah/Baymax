import { shippingFor } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Artwork } from '@/components/domain/Artwork';
import { OrderSummary } from '@/components/domain/OrderSummary';
import { productCategory } from '@/components/domain/ProductCard';
import { productArt } from '@/components/domain/productArt';
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  StackHeader,
  Stepper,
  Text,
} from '@/components/ui';
import { useLayout } from '@/hooks/useLayout';
import { formatMoney } from '@/lib/format';
import { cartSubtotal, useCart } from '@/stores/cart';

export default function CartScreen() {
  const { isWide } = useLayout();
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(lines);
  const header = <StackHeader title="Your cart" fallbackHref="/pharmacy" />;

  if (!lines.length) {
    return (
      <Screen header={header}>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Browse the pharmacy to add everyday health essentials."
          actionLabel="Shop pharmacy"
          onAction={() => router.replace('/pharmacy')}
        />
      </Screen>
    );
  }

  const list = (
    <View style={{ gap: 12 }}>
      {lines.map(({ product, quantity }) => {
        const category = productCategory(product.category);
        return (
          <Card key={product.id} padding={12}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 76 }}>
                <Artwork
                  color={category.color}
                  icon={productArt(product).icon}
                  height={76}
                  radius={14}
                  iconSize={32}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="subheading" numberOfLines={1}>
                  {product.name}
                </Text>
                <Text variant="caption" tone="muted">
                  {formatMoney(product.priceCents)} each
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 4,
                  }}
                >
                  <Stepper
                    value={quantity}
                    onChange={(v) => setQuantity(product.id, v)}
                    max={Math.min(10, product.stock)}
                  />
                  <Text variant="subheading">{formatMoney(product.priceCents * quantity)}</Text>
                </View>
              </View>
              <IconButton
                icon="close"
                label={`Remove ${product.name}`}
                variant="plain"
                size={32}
                onPress={() => remove(product.id)}
              />
            </View>
          </Card>
        );
      })}
    </View>
  );

  const summary = (
    <Card style={{ gap: 16 }}>
      <Text variant="heading">Order summary</Text>
      <OrderSummary subtotal={subtotal} />
      {isWide ? (
        <Button
          label="Checkout"
          icon="lock-outline"
          size="lg"
          onPress={() => router.push('/checkout')}
        />
      ) : null}
    </Card>
  );

  return (
    <Screen
      header={header}
      footer={
        isWide ? undefined : (
          <Button
            label={`Checkout · ${formatMoney(subtotal + shippingFor(subtotal))}`}
            icon="lock-outline"
            size="lg"
            onPress={() => router.push('/checkout')}
          />
        )
      }
    >
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.5 }}>{list}</View>
          <View style={{ flex: 1 }}>{summary}</View>
        </View>
      ) : (
        <>
          {list}
          {summary}
        </>
      )}
    </Screen>
  );
}
