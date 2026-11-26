export const siteConfig = {
  brandName: 'NARMIRA',
  tagline: 'The Soul of Maheshwar, The Style of Today.',
  announcement: {
    enabled: true,
    text:
      import.meta.env.VITE_ANNOUNCEMENT_TEXT ||
      'Discover the art of Maheshwari craftsmanship.',
    link: '/shop',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  },
  shipping: {
    freeShippingThreshold: 2999,
    standardShippingFee: 149,
  },
  craftsmanshipPillars: [
    {
      id: 'heritage',
      title: 'Rooted in Maheshwar',
      description: 'Inspired by the rich textile heritage of Maheshwar.',
    },
    {
      id: 'care',
      title: 'Crafted With Care',
      description:
        'Thoughtfully selected fabrics and attention to every detail.',
    },
    {
      id: 'modern',
      title: 'Made for Today',
      description:
        'Traditional elegance designed for contemporary lifestyles.',
    },
  ],
  social: {
    instagram: 'https://instagram.com/narmira.official',
    facebook: 'https://facebook.com/narmira.official',
    whatsapp: 'https://wa.me/919800000000',
    email: 'care@narmira.com',
    handle: '@NARMIRA',
  },
  footer: {
    shopLinks: [
      { label: 'New Arrivals', to: '/collections/new-arrivals' },
      { label: 'Sarees', to: '/collections/sarees' },
      { label: 'Kurta Sets', to: '/collections/kurta-sets' },
      { label: 'Kurtis', to: '/collections/kurtis' },
      { label: 'Dupattas', to: '/collections/dupattas' },
      { label: 'Collections', to: '/shop' },
    ],
    customerCareLinks: [
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQs', to: '/faq' },
      { label: 'Shipping Information', to: '/shipping' },
      { label: 'Returns & Exchanges', to: '/returns' },
      { label: 'Order Tracking', to: '/order-tracking' },
    ],
    aboutLinks: [
      { label: 'Our Story', to: '/our-story' },
      { label: 'Maheshwar Heritage', to: '/our-story#heritage' },
      { label: 'Contact', to: '/contact' },
    ],
    legalLinks: [
      { label: 'Privacy Policy', to: '/privacy-policy' },
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Refund Policy', to: '/refund-policy' },
    ],
    copyright: `© ${new Date().getFullYear()} NARMIRA. All rights reserved.`,
  },
};
