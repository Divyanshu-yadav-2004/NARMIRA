import React, { useEffect, useState } from 'react';
import { siteConfig } from '../config/siteConfig';

interface InfoPageProps {
  pageKey:
    | 'contact'
    | 'faq'
    | 'shipping'
    | 'returns'
    | 'order-tracking'
    | 'privacy'
    | 'terms'
    | 'refund';
}

const CONTENT: Record<
  InfoPageProps['pageKey'],
  { title: string; subtitle: string; sections: Array<{ heading: string; body: string }> }
> = {
  contact: {
    title: 'Contact Us',
    subtitle: 'We are here to assist you with styling, sizing, and orders.',
    sections: [
      {
        heading: 'Client Concierge',
        body: `Write to us at ${siteConfig.social.email} or reach us on WhatsApp for personalised assistance with sizing, fabric care, or order inquiries. Hours: Monday – Saturday, 10:00 AM to 6:30 PM IST.`,
      },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    subtitle: 'Answers to common questions about NARMIRA garments and care.',
    sections: [
      {
        heading: 'How should I care for Maheshwari silk and silk-cotton?',
        body: 'We recommend dry cleaning for all silk and zari-bordered pieces. Store sarees and dupattas folded in breathable muslin away from direct sunlight.',
      },
      {
        heading: 'Do your sarees include a blouse piece?',
        body: 'Yes, all NARMIRA sarees measure 5.5 metres and include a 0.9 metre unstitched blouse piece.',
      },
      {
        heading: 'How long does delivery take?',
        body: 'Orders are dispatched within 2–3 business days and typically arrive within 4–7 business days across India.',
      },
    ],
  },
  shipping: {
    title: 'Shipping Information',
    subtitle: 'Thoughtfully packaged and delivered across India.',
    sections: [
      {
        heading: 'Complimentary & Standard Shipping',
        body: 'Enjoy complimentary shipping on all orders above ₹2,999. For orders below ₹2,999, a flat shipping fee of ₹149 applies.',
      },
      {
        heading: 'Dispatch Timeline',
        body: 'In-stock pieces are dispatched within 2–3 business days. You will receive tracking details via email once shipped.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    subtitle: 'Effortless 7-day returns and size exchanges.',
    sections: [
      {
        heading: 'Eligibility',
        body: 'Unworn, unwashed garments with original tags and packaging intact are eligible for return or exchange within 7 days of delivery.',
      },
      {
        heading: 'How to Initiate',
        body: `Email ${siteConfig.social.email} with your order reference number and reason for return or size exchange.`,
      },
    ],
  },
  'order-tracking': {
    title: 'Order Tracking',
    subtitle: 'Check the status of your NARMIRA order.',
    sections: [
      {
        heading: 'Track Your Parcel',
        body: 'Enter your Order Reference (e.g. NRM-123456) below or sign in to My Account to view recent orders.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'How NARMIRA respects and protects your personal information.',
    sections: [
      {
        heading: 'Data Stewardship',
        body: 'We collect only the contact and shipping details necessary to fulfil your orders and communicate updates you opt into.',
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Guidelines governing the use of the NARMIRA storefront.',
    sections: [
      {
        heading: 'Pricing & Availability',
        body: 'All prices are listed in Indian Rupees (INR) inclusive of applicable taxes. Product availability is subject to stock.',
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    subtitle: 'Transparent timelines for approved returns.',
    sections: [
      {
        heading: 'Refund Processing',
        body: 'Once your returned garment passes quality inspection, refunds are processed to your original payment method within 5–7 business days.',
      },
    ],
  },
};

export const InfoPage: React.FC<InfoPageProps> = ({ pageKey }) => {
  const data = CONTENT[pageKey];
  const [orderRef, setOrderRef] = useState('');
  const [trackMessage, setTrackMessage] = useState('');

  useEffect(() => {
    document.title = `${data.title} — NARMIRA`;
  }, [data.title]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef.trim()) return;
    setTrackMessage(
      `Order ${orderRef.trim().toUpperCase()} is currently being prepared for dispatch.`
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h1 className="font-serif text-3xl sm:text-5xl text-[#302820] font-normal">
        {data.title}
      </h1>
      <p className="text-sm text-[#302820]/70 mt-3 pb-6 border-b border-[#D8C8B3]/70">
        {data.subtitle}
      </p>

      <div className="mt-8 space-y-8">
        {data.sections.map((sec) => (
          <section key={sec.heading} className="space-y-2">
            <h2 className="font-serif text-2xl text-[#302820]">{sec.heading}</h2>
            <p className="text-sm text-[#302820]/80 leading-relaxed">
              {sec.body}
            </p>
          </section>
        ))}

        {pageKey === 'order-tracking' && (
          <form
            onSubmit={handleTrack}
            className="bg-white border border-[#D8C8B3] p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="Enter Order Reference (e.g. NRM-104291)"
                className="flex-1 px-4 py-2.5 bg-[#F8F5EF] border border-[#D8C8B3] text-sm focus:outline-none focus:border-[#632D35]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#632D35] text-[#F8F5EF] text-xs uppercase tracking-[0.16em]"
              >
                Track
              </button>
            </div>
            {trackMessage && (
              <p className="text-xs text-[#632D35]">{trackMessage}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
