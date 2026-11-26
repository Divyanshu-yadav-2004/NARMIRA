import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { orderService } from '../services/api';
import type { Order, ShippingAddress } from '../types';
import { formatINR, normalizeProductImage } from '../utils/format';
import { validateShippingAddress } from '../utils/checkoutValidation';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    user,
    clearCart,
    addOrder,
  } = useStore();

  const [form, setForm] = useState<ShippingAddress>({
    fullName: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] =
    useState<Order['paymentMethod']>('upi');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const submissionLock = useRef(false);

  useEffect(() => {
    document.title = 'Checkout — NARMIRA';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionLock.current || cart.length === 0) return;
    const validationError = validateShippingAddress(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    submissionLock.current = true;
    setError(null);
    setSubmitting(true);
    try {
      const order = await orderService.createOrder({
        items: cart,
        subtotal,
        discount,
        shipping: shippingFee,
        total,
        couponCode: couponCode || undefined,
        shippingAddress: form,
        paymentMethod,
      });
      addOrder(order);
      clearCart();
      setConfirmedOrder(order);
    } catch {
      setError('Could not place order right now. Please try again.');
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <CheckCircle2 className="w-12 h-12 text-[#632D35] stroke-[1.3] mx-auto mb-5" />
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#B59A68] mb-2">
          Demo Checkout Complete
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#302820]">
          Thank You, {confirmedOrder.shippingAddress.fullName}
        </h1>
        <p className="text-sm text-[#302820]/75 mt-3 leading-relaxed">
          This frontend demo did not process a payment or place a real order.
          The reference <strong>{confirmedOrder.id}</strong> is for preview only.
        </p>

        <div className="mt-8 bg-white border border-[#D8C8B3]/70 p-6 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#302820]/65">Demo Reference</span>
            <span className="font-medium">{confirmedOrder.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#302820]/65">Demo Total · Not Charged</span>
            <span className="font-medium">{formatINR(confirmedOrder.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#302820]/65">Delivery City</span>
            <span>
              {confirmedOrder.shippingAddress.city},{' '}
              {confirmedOrder.shippingAddress.state}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/account"
            className="px-7 py-3 bg-[#302820] text-[#F8F5EF] text-xs uppercase tracking-[0.16em]"
          >
            View Order History
          </Link>
          <Link
            to="/shop"
            className="px-7 py-3 border border-[#D8C8B3] text-[#302820] text-xs uppercase tracking-[0.16em]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl text-[#302820] mb-3">
          Your Bag Is Empty
        </h1>
        <Link
          to="/shop"
          className="inline-block px-7 py-3 bg-[#632D35] text-[#F8F5EF] text-xs uppercase tracking-[0.18em]"
        >
          Shop Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
      <div className="flex items-center justify-between pb-6 border-b border-[#D8C8B3]/70 mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#302820]">
          Checkout
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-[#302820]/65">
          <Lock className="w-3.5 h-3.5" />
          <span>Checkout Demo</span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10"
      >
        {/* Left: Shipping & Payment */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-2xl text-[#302820] mb-2">
              Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91"
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  Apartment / Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1.5">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-base sm:text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-8 space-y-3">
            <h2 className="font-serif text-2xl text-[#302820] mb-3">
              Payment Method
            </h2>
            <p className="text-sm text-[#302820]/70" role="note">
              Payment options are for preview only. No payment will be processed.
            </p>
            {[
              { id: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)' },
              { id: 'card', label: 'Credit / Debit Card' },
              { id: 'netbanking', label: 'Net Banking' },
              { id: 'cod', label: 'Cash on Delivery' },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3.5 border cursor-pointer text-xs transition-colors ${
                  paymentMethod === opt.id
                    ? 'border-[#632D35] bg-[#F8F5EF]'
                    : 'border-[#D8C8B3]/70'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === opt.id}
                  onChange={() =>
                    setPaymentMethod(opt.id as Order['paymentMethod'])
                  }
                  className="accent-[#632D35]"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </section>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-5">
          <div className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-8 space-y-5 sticky top-24">
            <h2 className="font-serif text-2xl text-[#302820] pb-3 border-b border-[#D8C8B3]/60">
              Your Order ({cart.length})
            </h2>

            <ul className="divide-y divide-[#D8C8B3]/50 max-h-64 overflow-y-auto">
              {cart.map((item) => {
                const thumb = normalizeProductImage(
                  item.product.variants?.find((variant) => variant.id === item.variantId)?.images?.[0] || item.product.images[0],
                  item.product.name,
                  0
                );
                return (
                <li key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={thumb.src}
                    alt={thumb.alt}
                    className="w-12 h-16 object-cover bg-[#EEE6D8]"
                    style={{
                      objectPosition: thumb.objectPosition || 'center top',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-[#302820] truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-[#302820]/60">
                      {item.color.name} · {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-medium">
                    {formatINR(item.unitPrice * item.quantity)}
                  </span>
                </li>
                );
              })}
            </ul>

            <div className="space-y-2 text-xs text-[#302820]/80 pt-3 border-t border-[#D8C8B3]/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#632D35]">
                  <span>Discount ({couponCode})</span>
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

            {error && <p role="alert" className="text-sm text-[#632D35]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#632D35] hover:bg-[#4E2229] disabled:opacity-70 text-[#F8F5EF] text-xs uppercase tracking-[0.2em] transition-colors inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <span>Place Demo Order · {formatINR(total)}</span>
              )}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};
