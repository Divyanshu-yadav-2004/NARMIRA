import type { Product } from '../types';

/**
 * NARMIRA Product Catalog (Replaceable Demo Inventory)
 *
 * How to add or update products:
 * 1. Place product photos in `public/images/products/` (e.g. `saree-front.webp`, `saree-back.webp`, `saree-detail.webp`).
 * 2. Add paths directly to `images`:
 *    images: [
 *      "/images/products/product-front.webp",
 *      "/images/products/product-back.webp",
 *      "/images/products/product-detail.webp",
 *      "/images/products/product-lifestyle.webp"
 *    ]
 * 3. Or pass `{ src, alt, view, objectPosition }` objects for custom focal framing.
 */
export const products: Product[] = [
  {
    id: 'narmira-001',
    slug: 'maheshwari-silk-saree-ahilya-maroon',
    name: 'Maheshwari Silk Saree',
    category: 'Maheshwari Sarees',
    categorySlug: 'sarees',
    price: 8950,
    originalPrice: 10500,
    shortDescription:
      'Lustrous ivory and deep maroon Maheshwari silk saree finished with a muted gold zari border.',
    description:
      'Inspired by the serene ghats of Maheshwar, this Maheshwari silk saree balances featherlight comfort with quiet opulence. Featuring a refined deep maroon pallu and traditional zari selvedge, it drapes effortlessly from morning ceremonies to evening gatherings.',
    fabric: 'Maheshwari Silk',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean only. Store wrapped in unbleached muslin cloth.',
    details: [
      'Length: 5.5 metres saree with 0.9 metre unstitched blouse piece',
      'Signature Narmada-inspired zari border',
      'Lightweight, breathable fall for all-day comfort',
      'Subtle reversible selvedge finish',
    ],
    images: [
      {
        src: '/images/hero-maheshwar.jpg',
        alt: 'Maheshwari Silk Saree in Deep Maroon and Ivory — Front lifestyle view',
        view: 'lifestyle',
        objectPosition: 'center 22%',
      },
      {
        src: '/images/hero-maheshwar.jpg',
        alt: 'Maheshwari Silk Saree — Drape and zari border detail',
        view: 'detail',
        objectPosition: 'center 58%',
      },
    ],
    colors: [
      { name: 'Deep Maroon', hex: '#632D35' },
      { name: 'Warm Ivory', hex: '#F8F5EF' },
    ],
    sizes: ['Free Size'],
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
    isDemo: true,
    tags: ['saree', 'silk', 'festive', 'zari'],
  },
  {
    id: 'narmira-002',
    slug: 'ivory-handwoven-kurta-set',
    name: 'Ivory Handwoven Kurta Set',
    category: 'Kurta Sets',
    categorySlug: 'kurta-sets',
    price: 6490,
    shortDescription:
      'Three-piece warm ivory Maheshwari silk-cotton kurta set paired with straight trousers and a sheer zari dupatta.',
    description:
      'An understated wardrobe essential crafted in warm ivory Maheshwari silk-cotton. The straight-cut kurta features clean neckline detailing and delicate zari cuffs, complemented by tailored straight pants and an airy gold-bordered dupatta.',
    fabric: 'Maheshwari Silk-Cotton',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean recommended. Gentle steam iron on reverse.',
    details: [
      '3-piece set: Straight Kurta, Tailored Trousers, Sheer Zari Dupatta',
      'Soft mulmul cotton lining in kurta',
      'Side pockets in kurta for modern ease',
      'Muted antique gold zari border on dupatta',
    ],
    images: [
      {
        src: '/images/prod-kurta-set-1.jpg',
        alt: 'Ivory Handwoven Kurta Set — Front view',
        view: 'front',
        objectPosition: 'center top',
      },
      {
        src: '/images/prod-kurta-set-1.jpg',
        alt: 'Ivory Handwoven Kurta Set — Silhouette and dupatta detail',
        view: 'detail',
        objectPosition: 'center 42%',
      },
    ],
    colors: [
      { name: 'Warm Ivory', hex: '#F8F5EF' },
      { name: 'Antique Cream', hex: '#EEE6D8' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
    isDemo: true,
    tags: ['kurta set', 'ivory', 'daywear'],
  },
  {
    id: 'narmira-003',
    slug: 'royal-maroon-festive-suit',
    name: 'Royal Maroon Festive Suit',
    category: 'Festive Collection',
    categorySlug: 'festive',
    price: 7850,
    originalPrice: 9200,
    shortDescription:
      'Regal deep maroon festive suit set accented with muted gold zari borders and fluid silhouette.',
    description:
      'Designed for intimate festivities and evening celebrations, the Royal Maroon Festive Suit pairs a luminous silk-blend kurta with wide-leg palazzos and a richly bordered Maheshwari tissue dupatta. Sophisticated, poised, and timeless.',
    fabric: 'Maheshwari Silk-Cotton',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean only.',
    details: [
      '3-piece ensemble: Kurta, Relaxed Trousers, Zari Border Dupatta',
      'Deep maroon hue with antique gold selvedge',
      'Breathable cotton-silk inner lining',
      'Subtle metallic sheen suited for festive evenings',
    ],
    images: [
      {
        src: '/images/prod-kurta-set-2.jpg',
        alt: 'Royal Maroon Festive Suit — Front view',
        view: 'front',
        objectPosition: 'center top',
      },
      {
        src: '/images/prod-kurta-set-2.jpg',
        alt: 'Royal Maroon Festive Suit — Zari border and neckline detail',
        view: 'detail',
        objectPosition: 'center 38%',
      },
    ],
    colors: [
      { name: 'Deep Maroon', hex: '#632D35' },
      { name: 'Dark Espresso', hex: '#302820' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
    isDemo: true,
    tags: ['festive', 'maroon', 'suit set'],
  },
  {
    id: 'narmira-004',
    slug: 'zari-tissue-heirloom-dupatta',
    name: 'Zari Tissue Heirloom Dupatta',
    category: 'Dupattas',
    categorySlug: 'dupattas',
    price: 3490,
    originalPrice: 3950,
    shortDescription:
      'Lustrous deep maroon Maheshwari tissue dupatta with classic antique gold zari border.',
    description:
      'A luminous finishing piece that elevates even the simplest ivory kurta. Woven with fine metallic-toned yarns and finished with traditional selvedge borders.',
    fabric: 'Zari Tissue & Silk-Cotton',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean only.',
    details: [
      'Dimensions: 2.5 metres × 0.95 metres',
      'Featherlight translucent drape',
      'Subtle antique gold shimmer',
      'Hand-finished fringe edges',
    ],
    images: [
      {
        src: '/images/prod-dupatta-2.jpg',
        alt: 'Zari Tissue Heirloom Dupatta — Draped front view',
        view: 'front',
        objectPosition: 'center top',
      },
      {
        src: '/images/prod-dupatta-2.jpg',
        alt: 'Zari Tissue Heirloom Dupatta — Gold zari border detail',
        view: 'detail',
        objectPosition: 'center 52%',
      },
    ],
    colors: [
      { name: 'Deep Maroon', hex: '#632D35' },
      { name: 'Muted Gold', hex: '#B59A68' },
    ],
    sizes: ['Free Size'],
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
    isDemo: true,
    tags: ['dupatta', 'festive', 'tissue', 'zari'],
  },
  {
    id: 'narmira-005',
    slug: 'antique-cream-zari-kurta-set',
    name: 'Antique Cream Zari Kurta Set',
    category: 'Kurta Sets',
    categorySlug: 'kurta-sets',
    price: 6990,
    shortDescription:
      'Sunlit antique cream kurta ensemble with subtle gold zari weaving and relaxed contemporary tailoring.',
    description:
      'Crafted for sunlit brunches and heritage celebrations alike, this antique cream kurta set pairs clean architectural tailoring with the soft sheen of Maheshwari silk-cotton.',
    fabric: 'Maheshwari Silk-Cotton',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean recommended.',
    details: [
      '3-piece set with tailored pants and sheer zari dupatta',
      'Breathable natural feel with cotton lining',
      'Minimalist keyhole neckline with fabric-covered buttons',
    ],
    images: [
      {
        src: '/images/featured-tradition.jpg',
        alt: 'Antique Cream Zari Kurta Set — Courtyard lifestyle view',
        view: 'lifestyle',
        objectPosition: 'center 20%',
      },
      {
        src: '/images/featured-tradition.jpg',
        alt: 'Antique Cream Zari Kurta Set — Dupatta drape detail',
        view: 'detail',
        objectPosition: 'center 48%',
      },
    ],
    colors: [
      { name: 'Antique Cream', hex: '#EEE6D8' },
      { name: 'Soft Sand', hex: '#D8C8B3' },
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isBestseller: true,
    isDemo: true,
    tags: ['kurta set', 'cream', 'classic'],
  },
  {
    id: 'narmira-006',
    slug: 'maheshwari-silk-cotton-unstitched-dress-material',
    name: 'Maheshwari Silk-Cotton Dress Material',
    category: 'Dress Materials',
    categorySlug: 'dress-materials',
    price: 4850,
    originalPrice: 5600,
    shortDescription:
      'Three-piece unstitched Maheshwari silk-cotton suit fabric in warm ivory with deep maroon zari dupatta.',
    description:
      'Tailor your silhouette to your exact fit with this unstitched three-piece Maheshwari silk-cotton dress material. Includes generous kurta length with woven zari border, soft cotton-silk bottom fabric, and an airy 2.5m zari-bordered dupatta.',
    fabric: 'Maheshwari Silk-Cotton',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean recommended.',
    details: [
      'Unstitched Kurta Fabric: 2.5 metres',
      'Unstitched Bottom Fabric: 2.5 metres',
      'Maheshwari Zari Dupatta: 2.5 metres',
      'Classic muted gold selvedge detailing',
    ],
    images: [
      {
        src: '/images/story-maheshwar.jpg',
        alt: 'Maheshwari Silk-Cotton Dress Material — Handloom fabric view',
        view: 'detail',
        objectPosition: 'center center',
      },
    ],
    colors: [
      { name: 'Warm Ivory', hex: '#F8F5EF' },
      { name: 'Deep Maroon', hex: '#632D35' },
    ],
    sizes: ['Unstitched (Free Size)'],
    inStock: true,
    isNewArrival: true,
    isDemo: true,
    tags: ['dress material', 'unstitched', 'silk-cotton'],
  },
  {
    id: 'narmira-007',
    slug: 'soft-sand-contemporary-kurti',
    name: 'Soft Sand Contemporary Kurti',
    category: 'Kurtis',
    categorySlug: 'kurtis',
    price: 3290,
    originalPrice: 3890,
    shortDescription:
      'Clean-lined straight kurti in warm ivory-sand Maheshwari cotton-silk with delicate sleeve zari.',
    description:
      'Designed for modern workdays and effortless gatherings, this contemporary kurti brings heritage texture into a minimal, versatile silhouette that pairs with tailored trousers or denim.',
    fabric: 'Maheshwari Cotton-Silk',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Gentle cold hand wash or dry clean.',
    details: [
      'Straight relaxed silhouette with side slits',
      'Subtle antique gold zari trim on cuffs',
      'Lightweight breathable weave for Indian weather',
    ],
    images: [
      {
        src: '/images/prod-kurta-set-1.jpg',
        alt: 'Soft Sand Contemporary Kurti — Straight silhouette view',
        view: 'front',
        objectPosition: 'center 12%',
      },
    ],
    colors: [
      { name: 'Soft Sand', hex: '#D8C8B3' },
      { name: 'Warm Ivory', hex: '#F8F5EF' },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    inStock: true,
    isDemo: true,
    tags: ['kurti', 'contemporary', 'workwear'],
  },
  {
    id: 'narmira-008',
    slug: 'maheshwar-classic-heritage-saree',
    name: 'Maheshwar Classic Heritage Saree',
    category: 'Handcrafted Classics',
    categorySlug: 'classics',
    price: 7650,
    shortDescription:
      'Timeless Maheshwari silk-cotton saree with understated muted gold border and fluid drape.',
    description:
      'Pure, serene, and enduring. The Maheshwar Classic Heritage Saree is a study in restraint — luminous body, delicate gold border, and a featherlight fall suited for intimate ceremonies.',
    fabric: 'Pure Mulberry Silk-Cotton',
    weaveOrigin: 'Maheshwar Inspired',
    careInstructions: 'Dry clean only.',
    details: [
      '5.5 metres saree + 0.9 metre unstitched blouse',
      'Classic temple zari border',
      'Ideal for daytime ceremonies and intimate gatherings',
    ],
    images: [
      {
        src: '/images/hero-maheshwar.jpg',
        alt: 'Maheshwar Classic Heritage Saree — Full drape view',
        view: 'lifestyle',
        objectPosition: 'center 30%',
      },
    ],
    colors: [
      { name: 'Deep Maroon', hex: '#632D35' },
      { name: 'Muted Gold', hex: '#B59A68' },
    ],
    sizes: ['Free Size'],
    inStock: true,
    isDemo: true,
    tags: ['classic', 'heritage', 'saree'],
  },
];

export const allFabrics = Array.from(new Set(products.map((p) => p.fabric)));
export const allSizes = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'Free Size',
  'Unstitched (Free Size)',
];
export const allColors = [
  { name: 'Deep Maroon', hex: '#632D35' },
  { name: 'Warm Ivory', hex: '#F8F5EF' },
  { name: 'Antique Cream', hex: '#EEE6D8' },
  { name: 'Soft Sand', hex: '#D8C8B3' },
  { name: 'Muted Gold', hex: '#B59A68' },
  { name: 'Dark Espresso', hex: '#302820' },
];
