import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Artwork } from '@/components/domain/Artwork';
import { Rating } from '@/components/domain/DoctorCard';
import { productCategory } from '@/components/domain/ProductCard';
import { productArt } from '@/components/domain/productArt';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Icon,
  IconButton,
  LoadingState,
  Screen,
  StackHeader,
  Stepper,
  Text,
  toast,
} from '@/components/ui';
import { useProduct } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { formatMoney } from '@/lib/format';
import { cartCount, useCart } from '@/stores/cart';
import { useTheme } from '@/theme/ThemeProvider';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const { data, isLoading, error, refetch } = useProduct(id);
  const add = useCart((s) => s.add);
  const items = useCart((s) => cartCount(s.lines));
  const [qty, setQty] = useState(1);
  const header = (
    <StackHeader
      title="Pharmacy"
      fallbackHref="/pharmacy"
      actions={
        <IconButton
          icon="cart-outline"
          label="Open cart"
          badge={items}
          onPress={() => router.push('/cart')}
        />
      }
    />
  );

  if (isLoading)
    return (
      <Screen header={header}>
        <LoadingState />
      </Screen>
    );
  if (error || !data)
    return (
      <Screen header={header}>
        <ErrorState error={error} onRetry={refetch} />
      </Screen>
    );
  const category = productCategory(data.category);
  const inStock = data.stock > 0;

  const addToCart = () => {
    add(data, qty);
    toast.success(`${qty} × ${data.name} added to cart`);
  };

  const details = (
    <View style={{ gap: 16 }}>
      <View style={{ gap: 8 }}>
        <Badge label={category.label} icon={category.icon} tone="primary" />
        <Text variant="display">{data.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text tone="muted">by {data.brand}</Text>
          <Rating value={data.rating} />
        </View>
      </View>
      <Text variant="title">{formatMoney(data.priceCents)}</Text>
      <Text tone="muted" style={{ fontSize: 16, lineHeight: 25 }}>
        {data.description}
      </Text>
      <Card style={{ gap: 14 }}>
        {[
          { icon: 'flask-outline', label: 'Active ingredient', value: data.activeIngredient },
          { icon: 'information-outline', label: 'How to use', value: data.usage },
        ].map((r) => (
          <View key={r.label} style={{ flexDirection: 'row', gap: 12 }}>
            <Icon name={r.icon} size={20} color={colors.primary} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="caption" tone="muted">
                {r.label}
              </Text>
              <Text variant="callout">{r.value}</Text>
            </View>
          </View>
        ))}
      </Card>
      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          padding: 12,
          borderRadius: radius.lg,
          backgroundColor: colors.surfaceMuted,
        }}
      >
        <Icon name="information-outline" size={18} color={colors.textMuted} />
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>
          Always read the label. Ask a pharmacist or doctor if you are pregnant, taking other
          medicines or have a medical condition.
        </Text>
      </View>
    </View>
  );

  const buy = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {inStock ? (
        <Stepper
          value={qty}
          onChange={(v) => setQty(Math.max(1, v))}
          min={1}
          max={Math.min(10, data.stock)}
        />
      ) : null}
      <Button
        label={inStock ? `Add to cart · ${formatMoney(data.priceCents * qty)}` : 'Out of stock'}
        icon="cart-plus"
        size="lg"
        disabled={!inStock}
        onPress={addToCart}
        style={{ flex: 1 }}
      />
    </View>
  );

  return (
    <Screen header={header} footer={isWide ? undefined : buy}>
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Artwork
              color={category.color}
              icon={productArt(data).icon}
              height={420}
              radius={radius.xxl}
              iconSize={140}
            />
          </View>
          <View style={{ flex: 1, gap: 20 }}>
            {details}
            {buy}
            <Text variant="caption" tone={data.stock < 20 ? 'warning' : 'subtle'}>
              {inStock ? `${data.stock} in stock · ships within 24 hours` : 'Currently unavailable'}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <Artwork
            color={category.color}
            icon={productArt(data).icon}
            height={240}
            radius={radius.xxl}
            iconSize={100}
          />
          {details}
        </>
      )}
    </Screen>
  );
}
