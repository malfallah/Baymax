import { PRODUCT_CATEGORIES, type Product } from '@baymax/shared';

const KEYWORD_ICONS: [RegExp, string][] = [
  [/thermometer/i, 'thermometer'],
  [/bandage/i, 'bandage'],
  [/spray/i, 'spray-bottle'],
  [/lozenge/i, 'candy-outline'],
  [/cream|cleanser|sunscreen/i, 'lotion-outline'],
  [/antiseptic|solution/i, 'bottle-tonic-plus-outline'],
  [/rehydration|salts/i, 'cup-water'],
  [/omega|fish oil/i, 'fish'],
  [/probiotic/i, 'bacteria-outline'],
  [/vitamin d/i, 'white-balance-sunny'],
  [/multivitamin/i, 'food-apple-outline'],
  [/antacid|chewable/i, 'circle-multiple-outline'],
  [/omeprazole/i, 'pill-multiple'],
];

/** Picks a product-specific glyph and its category colour for product artwork. */
export function productArt(product: Pick<Product, 'name' | 'category'>) {
  const category = PRODUCT_CATEGORIES.find((c) => c.key === product.category)!;
  const icon = KEYWORD_ICONS.find(([rx]) => rx.test(product.name))?.[1] ?? category.icon;
  return { icon, color: category.color, label: category.label };
}
