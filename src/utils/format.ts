import type { Product, ProductImage, ProductImageInput, ProductVariant } from '../types';

/** Keep existing color data compatible while supporting verified color photos. */
export function getProductVariants(product: Product): ProductVariant[] {
  return product.variants?.length
    ? product.variants
    : product.colors.map((color) => ({
        id: `${product.id}-${color.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        color,
      }));
}

export function getAvailableSizes(product: Product): string[] {
  const sizes = product.sizes.length ? product.sizes : ['Free Size'];
  return sizes.filter((size) => !product.unavailableSizes?.includes(size));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDiscountPercent(
  price: number,
  originalPrice?: number
): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

const VIEW_LABELS = ['Front view', 'Detail view', 'Side view', 'Lifestyle view'];

export function normalizeProductImage(
  input: ProductImageInput,
  productName: string,
  index = 0
): ProductImage {
  if (typeof input === 'string') {
    return {
      src: input,
      alt: `${productName} — ${VIEW_LABELS[index] || `View ${index + 1}`}`,
      objectPosition: 'center top',
    };
  }
  return {
    ...input,
    alt: input.alt || `${productName} — View ${index + 1}`,
    objectPosition: input.objectPosition || 'center top',
  };
}

export function normalizeProductImages(
  inputs: ProductImageInput[],
  productName: string
): ProductImage[] {
  if (!inputs || inputs.length === 0) {
    return [
      {
        src: '/images/prod-kurta-set-1.jpg',
        alt: productName,
        objectPosition: 'center top',
      },
    ];
  }
  return inputs.map((item, idx) =>
    normalizeProductImage(item, productName, idx)
  );
}
