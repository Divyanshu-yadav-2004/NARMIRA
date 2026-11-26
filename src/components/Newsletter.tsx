import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { newsletterService } from '../services/api';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');
    try {
      const res = await newsletterService.subscribe(trimmed);
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Unable to subscribe right now. Please try again shortly.');
    }
  };

  return (
    <section className="bg-[#EEE6D8] border-t border-[#D8C8B3]/70 py-16 sm:py-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#632D35] mb-3">
          Private Invitations
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#302820] font-normal">
          A Little Elegance in Your Inbox
        </h2>
        <p className="text-sm text-[#302820]/75 mt-3 leading-relaxed max-w-lg mx-auto">
          Be the first to discover new collections, timeless inspirations and
          exclusive offers.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3.5 bg-white border border-[#D8C8B3] text-sm text-[#302820] placeholder-[#302820]/45 focus:outline-none focus:border-[#632D35]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-7 py-3.5 bg-[#632D35] hover:bg-[#4E2229] disabled:opacity-70 text-[#F8F5EF] text-xs uppercase tracking-[0.18em] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Joining</span>
              </>
            ) : (
              <span>JOIN NARMIRA</span>
            )}
          </button>
        </form>

        {message && (
          <div
            role="status"
            className={`mt-4 inline-flex items-center gap-1.5 text-xs ${
              status === 'success' ? 'text-emerald-900' : 'text-[#632D35]'
            }`}
          >
            {status === 'success' && <Check className="w-3.5 h-3.5" />}
            <span>{message}</span>
          </div>
        )}
      </div>
    </section>
  );
};
