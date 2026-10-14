import { PRODUCT_CATEGORIES, type Product } from '@baymax/shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { formatMoney } from '@/lib/format';
import { useCart } from '@/stores/cart';
import { useTheme } from '@/theme/ThemeProvider';
import { Card, IconButton, Text, toast } from '../ui';
import { Artwork } from './Artwork';
import { productArt } from './productArt';
import { Rating } from './DoctorCard';

export const productCategory = (key: Product['category']) =>
  PRODUCT_CATEGORIES.find((c) => c.key === key)!;

export function ProductCard({ product }: { product: Product }) {
  const { colors } = useTheme();
  const add = useCart((s) => s.add);
  const category = productCategory(product.category);
  return (
    <Card
      padding={10}
      onPress={() => router.push(`/products/${product.id}`)}
      accessibilityLabel={product.name}
    >
      <Artwork
        color={category.color}
        icon={productArt(product).icon}
        height={118}
        radius={14}
        iconSize={48}
      />
      <View style={{ paddingHorizontal: 4, paddingTop: 10, gap: 3 }}>
        <Text variant="caption" tone="subtle" numberOfLines={1}>
          {product.brand}
        </Text>
        <Text variant="subheading" numberOfLines={1}>
          {product.name}
        </Text>
        <Rating value={product.rating} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          <Text variant="heading">{formatMoney(product.priceCents)}</Text>
          {product.stock > 0 ? (
            <IconButton
              icon="plus"
              label={`Add ${product.name} to cart`}
              variant="tinted"
              size={36}
              onPress={() => {
                add(product);
                toast.success(`${product.name} added to cart`);
              }}
            />
          ) : (
            <Text variant="caption" color={colors.danger}>
              Out of stock
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
}
