import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../utils/format';

export const AccountPage: React.FC = () => {
  const { user, orders, signInUser, signOutUser } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    document.title = 'My Account — NARMIRA';
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    signInUser({ name: name.trim(), email: email.trim(), phone: phone.trim() });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
      <h1 className="font-serif text-3xl sm:text-4xl text-[#302820] pb-6 border-b border-[#D8C8B3]/70 mb-8">
        My Account
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile / Sign In */}
        <div className="lg:col-span-5">
          {user.isSignedIn ? (
            <div className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#EEE6D8] flex items-center justify-center text-[#632D35]">
                  <User className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-[#302820]">
                    {user.name}
                  </h2>
                  <p className="text-xs text-[#302820]/65">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <p className="text-xs text-[#302820]/75">Phone: {user.phone}</p>
              )}
              <button
                type="button"
                onClick={signOutUser}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#D8C8B3] hover:border-[#632D35] text-xs uppercase tracking-[0.14em] text-[#302820] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSignIn}
              className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-7 space-y-4"
            >
              <h2 className="font-serif text-2xl text-[#302820]">
                Sign In to NARMIRA
              </h2>
              <p className="text-xs text-[#302820]/70 leading-relaxed">
                Access your saved profile and order history.
              </p>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-[#302820]/70 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-sm focus:outline-none focus:border-[#632D35]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#632D35] hover:bg-[#4E2229] text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors"
              >
                Continue
              </button>
            </form>
          )}
        </div>

        {/* Orders */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#D8C8B3]/70 p-6 sm:p-7">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#D8C8B3]/60 mb-5">
              <Package className="w-4 h-4 text-[#632D35]" />
              <h2 className="font-serif text-2xl text-[#302820]">
                Order History
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-xs text-[#302820]/70 mb-5">
                  You haven’t placed any orders yet.
                </p>
                <Link
                  to="/shop"
                  className="inline-block px-6 py-2.5 bg-[#302820] text-[#F8F5EF] text-xs uppercase tracking-[0.16em]"
                >
                  Explore Collections
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-[#F8F5EF] border border-[#D8C8B3]/70 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#302820]">
                        {order.id}
                      </span>
                      <span className="px-2.5 py-0.5 bg-[#632D35]/10 text-[#632D35] uppercase tracking-[0.12em] text-[10px]">
                        {order.isDemo ? 'DEMO · NOT PLACED' : order.status}
                      </span>
                    </div>
                    <p className="text-[#302820]/65">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {order.items.length}{' '}
                      {order.items.length === 1 ? 'piece' : 'pieces'}
                    </p>
                    <p className="font-medium text-[#302820]">
                      Total: {formatINR(order.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
