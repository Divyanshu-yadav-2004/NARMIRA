import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR, normalizeProductImage } from '../utils/format';

export const CartPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    couponLabel,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  useEffect(() => {
    document.title = 'Shopping Bag — NARMIRA';
  }, []);

  const handleCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setFeedback(res);
    if (res.ok) setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-12 h-12 text-[#B59A68] stroke-[1.2] mx-auto mb-5" />
        <h1 className="font-serif text-3xl sm:text-4xl text-[#302820] mb-3">
          Your Shopping Bag Is Empty
        </h1>
        <p className="text-sm text-[#302820]/70 max-w-md mx-auto leading-relaxed mb-8">
          Discover Maheshwari silk sarees, tailored kurta sets, and handcrafted
          dupattas curated for timeless elegance.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3.5 bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
      <h1 className="font-serif text-3xl sm:text-4xl text-[#302820] mb-8">
        Shopping Bag
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-[#D8C8B3]/70 divide-y divide-[#D8C8B3]/60">
            {cart.map((item) => {
              const thumb = normalizeProductImage(
                item.product.variants?.find((variant) => variant.id === item.variantId)?.images?.[0] || item.product.images[0],
                item.product.name,
                0
              );
              return (
              <div
                key={item.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5"
              >
                <Link
                  to={`/product/${item.product.slug}`}
                  className="w-24 h-32 bg-[#EEE6D8] shrink-0 overflow-hidden"
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

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#B59A68]">
                        {item.product.category}
                      </p>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-xl text-[#302820] hover:text-[#632D35]"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-[#302820]/65 mt-1">
                        Color: {item.color.name} · Size: {item.size}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Remove ${item.product.name}`}
                      className="text-[#302820]/45 hover:text-[#632D35] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-[#D8C8B3]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="px-3 py-1.5 hover:bg-[#EEE6D8]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3.5 text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="px-3 py-1.5 hover:bg-[#EEE6D8]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-base font-medium text-[#302820]">
                      {formatINR(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <aside className="lg:col-span-4">
          <div className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-7 space-y-5 sticky top-24">
            <h2 className="font-serif text-2xl text-[#302820] pb-3 border-b border-[#D8C8B3]/60">
              Order Summary
            </h2>

            {couponCode ? (
              <div className="flex items-center justify-between px-3 py-2 bg-[#EEE6D8]/70 border border-[#B59A68]/50 text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#632D35]" />
                  <span>
                    <strong>{couponCode}</strong> ({couponLabel})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeCoupon();
                    setFeedback(null);
                  }}
                  className="text-[11px] underline text-[#632D35]"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Promo code (NARMIRA10)"
                    className="flex-1 px-3 py-2 text-xs bg-[#F8F5EF] border border-[#D8C8B3] focus:outline-none focus:border-[#632D35]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#302820] hover:bg-[#632D35] text-[#F8F5EF] text-[11px] uppercase tracking-[0.14em]"
                  >
                    Apply
                  </button>
                </div>
                {feedback && (
                  <p className="text-[11px] text-[#632D35]">{feedback.message}</p>
                )}
              </form>
            )}

            <div className="space-y-2.5 text-xs text-[#302820]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#632D35]">
                  <span>Discount</span>
                  <span>−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? 'Complimentary' : formatINR(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#D8C8B3]/60 text-base font-medium text-[#302820]">
                <span>Total</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full py-3.5 text-center bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/shop"
              className="block text-center text-xs text-[#302820]/70 hover:text-[#632D35] underline"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
