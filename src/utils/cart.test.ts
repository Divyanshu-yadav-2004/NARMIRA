import { describe, expect, it } from 'vitest';
import { products } from '../data/products';
import { calculateCartTotals, calculateCouponDiscount, calculateSubtotal, getCartItemId, normalizePersistedCart, normalizeQuantity } from './cart';
import { getProductVariants } from './format';

const product = products.find((item) => item.id === 'narmira-002')!;
const [ivory, cream] = getProductVariants(product);

function storedLine(color: typeof ivory.color, quantity: number, size = 'M', variantId?: string) {
  return { product, color, quantity, size, variantId };
}

describe('cart variant handling', () => {
  it('keeps different colors separate and merges the same product, color, and size', () => {
    const cart = normalizePersistedCart([
      storedLine(ivory.color, 1, 'M'),
      storedLine(cream.color, 1, 'M'),
      storedLine(ivory.color, 2, 'M'),
    ], products);

    expect(cart).toHaveLength(2);
    expect(cart.find((item) => item.variantId === ivory.id)?.quantity).toBe(3);
    expect(cart.find((item) => item.variantId === cream.id)?.quantity).toBe(1);
    expect(cart[0].id).not.toBe(cart[1].id);
  });

  it('stores verified color image and variant-specific unit price when present', () => {
    const variantProduct = {
      ...product,
      variants: [{ id: 'ivory-v1', color: ivory.color, price: 7000, images: ['/images/verified-ivory.jpg'] }],
    };
    const cart = normalizePersistedCart([
      storedLine(ivory.color, 1, 'M', 'ivory-v1'),
    ], [variantProduct]);

    expect(cart[0].variantId).toBe('ivory-v1');
    expect(cart[0].unitPrice).toBe(7000);
    expect(cart[0].product.variants?.[0].images).toEqual(['/images/verified-ivory.jpg']);
  });

  it('drops invalid persisted records and caps valid quantities', () => {
    const cart = normalizePersistedCart([
      storedLine(ivory.color, 120, 'M'),
      storedLine(ivory.color, 1.5, 'M'),
      storedLine(ivory.color, 1, 'NOT-A-SIZE'),
      { color: ivory.color, quantity: 1, size: 'M' },
    ], products);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(99);
  });

  it('uses collision-safe cart IDs and rejects invalid quantity updates', () => {
    expect(getCartItemId('p-a', 'M-x', 'v')).not.toBe(getCartItemId('p', 'a-M-x', 'v'));
    expect(normalizeQuantity(2)).toBe(2);
    expect(normalizeQuantity(0)).toBe(1);
    expect(normalizeQuantity(1.25)).toBeNull();
    expect(normalizeQuantity(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('calculates subtotal and supported coupon discounts', () => {
    const cart = normalizePersistedCart([
      storedLine(ivory.color, 2, 'M'),
      storedLine(cream.color, 1, 'L'),
    ], products);
    expect(calculateSubtotal(cart)).toBe(product.price * 3);
    expect(calculateCouponDiscount('NARMIRA10', product.price * 3)).toBe(Math.round(product.price * 0.3));
    expect(calculateCouponDiscount('HERITAGE500', 300)).toBe(300);
    expect(calculateCouponDiscount('INVALID', 5000)).toBe(0);
  });

  it('calculates shipping and total from the discounted cart subtotal', () => {
    const cart = normalizePersistedCart([storedLine(ivory.color, 1, 'M')], products);
    expect(calculateCartTotals(cart, null, 2999, 149)).toEqual({
      subtotal: product.price,
      discount: 0,
      shipping: 0,
      total: product.price,
    });
    expect(calculateCartTotals(cart, 'HERITAGE500', 20000, 149)).toEqual({
      subtotal: product.price,
      discount: 500,
      shipping: 149,
      total: product.price - 500 + 149,
    });
  });
});
