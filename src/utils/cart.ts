import type { CartItem, Product } from '../types';
import { getAvailableSizes, getProductVariants } from './format';

export const MAX_CART_QUANTITY = 99;

const COUPONS = {
  NARMIRA10: { type: 'percent', value: 10, label: '10% Welcome Privilege' },
  HERITAGE500: { type: 'flat', value: 500, label: '₹500 Heritage Privilege' },
} as const;

export function getCartItemId(productId: string, size: string, variantId: string): string {
  return JSON.stringify([productId, size, variantId]);
}

export function normalizePersistedCart(value: unknown, catalog: Product[]): CartItem[] {
  if (!Array.isArray(value)) return [];
  const productsById = new Map(catalog.map((product) => [product.id, product]));
  const normalized = new Map<string, CartItem>();

  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const raw = entry as Partial<CartItem>;
    const productId = raw.product && typeof raw.product === 'object' ? raw.product.id : undefined;
    const product = typeof productId === 'string' ? productsById.get(productId) : undefined;
    if (!product || typeof raw.color?.name !== 'string' || typeof raw.size !== 'string') continue;

    const variants = getProductVariants(product);
    const variant = variants.find((candidate) => candidate.id === raw.variantId)
      || variants.find((candidate) => candidate.color.name === raw.color?.name);
    const availableSizes = getAvailableSizes(product);
    const size = availableSizes.includes(raw.size) ? raw.size : undefined;
    const quantity = raw.quantity;
    if (!variant || !size || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) continue;

    const id = getCartItemId(product.id, size, variant.id);
    const unitPrice = variant.price ?? product.price;
    const existing = normalized.get(id);
    if (existing) {
      existing.quantity = Math.min(MAX_CART_QUANTITY, existing.quantity + quantity);
      continue;
    }
    normalized.set(id, {
      id,
      product,
      size,
      color: variant.color,
      variantId: variant.id,
      unitPrice,
      quantity: Math.min(MAX_CART_QUANTITY, quantity),
    });
  }
  return [...normalized.values()];
}

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function getCoupon(code: string | null | undefined) {
  return code ? COUPONS[code as keyof typeof COUPONS] : undefined;
}

export function calculateCouponDiscount(code: string | null | undefined, subtotal: number): number {
  const coupon = getCoupon(code);
  if (!coupon || subtotal <= 0) return 0;
  return coupon.type === 'percent'
    ? Math.round((subtotal * coupon.value) / 100)
    : Math.min(subtotal, coupon.value);
}

export function calculateCartTotals(
  cart: CartItem[],
  couponCode: string | null | undefined,
  freeShippingThreshold: number,
  standardShippingFee: number,
) {
  const subtotal = calculateSubtotal(cart);
  const discount = calculateCouponDiscount(couponCode, subtotal);
  const shipping = subtotal === 0 || subtotal - discount >= freeShippingThreshold
    ? 0
    : standardShippingFee;
  return { subtotal, discount, shipping, total: Math.max(0, subtotal - discount + shipping) };
}

export function normalizeQuantity(quantity: number): number | null {
  if (!Number.isFinite(quantity) || !Number.isInteger(quantity)) return null;
  return Math.max(1, Math.min(MAX_CART_QUANTITY, quantity));
}
