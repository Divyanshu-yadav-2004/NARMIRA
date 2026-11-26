import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { useStore } from '../context/StoreContext';
import { formatINR, normalizeProductImage } from '../utils/format';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartCount,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    couponLabel,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(
    0,
    siteConfig.shipping.freeShippingThreshold - (subtotal - discount)
  );

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.ok) setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-[#302820]/45 backdrop-blur-[2px]"
        onClick={closeCart}
      />
      <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-[#F8F5EF] shadow-2xl flex flex-col animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D8C8B3]/70">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#632D35] stroke-[1.5]" />
            <h2 className="font-serif text-xl tracking-wide text-[#302820]">
              Shopping Bag ({cartCount})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close shopping bag"
            className="p-1.5 text-[#302820] hover:text-[#632D35] transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Free shipping notice */}
        {cart.length > 0 && (
          <div className="px-6 py-2.5 bg-[#EEE6D8] text-[11px] tracking-wide text-[#302820] text-center border-b border-[#D8C8B3]/50">
            {remainingForFreeShipping === 0 ? (
              <span>You enjoy complimentary shipping on this order.</span>
            ) : (
              <span>
                Add {formatINR(remainingForFreeShipping)} more for complimentary
                shipping.
              </span>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-[#B59A68] stroke-[1.2] mb-4" />
              <h3 className="font-serif text-2xl text-[#302820] mb-2">
                Your Bag Is Empty
              </h3>
              <p className="text-xs text-[#302820]/70 max-w-xs leading-relaxed mb-6">
                Explore our Maheshwari sarees, kurta sets, and handcrafted
                dupattas to begin curating your wardrobe.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="px-7 py-3 bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#D8C8B3]/60">
              {cart.map((item) => {
                const thumb = normalizeProductImage(
                  item.product.variants?.find((variant) => variant.id === item.variantId)?.images?.[0] || item.product.images[0],
                  item.product.name,
                  0
                );
                return (
                <li key={item.id} className="py-4 first:pt-0 flex gap-4">
                  <Link
                    to={`/product/${item.product.slug}`}
                    onClick={closeCart}
                    className="w-20 h-26 bg-[#EEE6D8] shrink-0 overflow-hidden"
                  >
                    <img
                      src={thumb.src}
                      alt={thumb.alt}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition: thumb.objectPosition || 'center top',
                      }}
                    />
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.product.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base text-[#302820] hover:text-[#632D35] leading-snug"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.product.name}`}
                          className="text-[#302820]/45 hover:text-[#632D35] transition-colors p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#302820]/65 mt-0.5">
                        {item.color.name} · Size {item.size}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-[#D8C8B3] bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="px-2 py-1 text-[#302820] hover:bg-[#EEE6D8] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-[#302820]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="px-2 py-1 text-[#302820] hover:bg-[#EEE6D8] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium text-[#302820]">
                        {formatINR(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 border-t border-[#D8C8B3]/70 bg-white space-y-4">
            {/* Coupon */}
            {couponCode ? (
              <div className="flex items-center justify-between px-3 py-2 bg-[#EEE6D8]/70 border border-[#B59A68]/50 text-xs">
                <div className="flex items-center gap-2 text-[#302820]">
                  <Tag className="w-3.5 h-3.5 text-[#632D35]" />
                  <span>
                    <strong>{couponCode}</strong> — {couponLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeCoupon();
                    setCouponFeedback(null);
                  }}
                  className="text-[11px] underline text-[#632D35]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Privilege code (e.g. NARMIRA10)"
                  className="flex-1 px-3 py-2 text-xs bg-[#F8F5EF] border border-[#D8C8B3] focus:outline-none focus:border-[#632D35]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#302820] hover:bg-[#632D35] text-[#F8F5EF] text-[11px] uppercase tracking-[0.14em] transition-colors"
                >
                  Apply
                </button>
              </form>
            )}
            {couponFeedback && !couponCode && (
              <p
                className={`text-[11px] ${
                  couponFeedback.ok ? 'text-emerald-800' : 'text-[#632D35]'
                }`}
              >
                {couponFeedback.message}
              </p>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-xs text-[#302820]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#632D35]">
                  <span>Privilege Discount</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? 'Complimentary' : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#D8C8B3]/60 text-sm font-medium text-[#302820]">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/cart"
                onClick={closeCart}
                className="py-3 text-center border border-[#302820] text-[#302820] hover:bg-[#EEE6D8] text-xs uppercase tracking-[0.16em] transition-colors"
              >
                View Bag
              </Link>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="py-3 text-center bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.16em] transition-colors"
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
