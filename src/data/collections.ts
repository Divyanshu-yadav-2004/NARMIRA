import type { CollectionInfo } from '../types';

export const collections: CollectionInfo[] = [
  {
    slug: 'sarees',
    title: 'Maheshwari Sarees',
    subtitle: 'Luminous Drapes',
    description:
      'Graceful Maheshwari silk and silk-cotton sarees defined by featherlight drape and delicate zari borders.',
    image: '/images/hero-maheshwar.jpg',
    imagePosition: 'center 25%',
  },
  {
    slug: 'kurta-sets',
    title: 'Kurta Sets',
    subtitle: 'Tailored Elegance',
    description:
      'Thoughtfully proportioned three-piece ensembles pairing handwoven silhouettes with sheer zari dupattas.',
    image: '/images/prod-kurta-set-1.jpg',
    imagePosition: 'center top',
  },
  {
    slug: 'kurtis',
    title: 'Kurtis',
    subtitle: 'Everyday Poise',
    description:
      'Refined straight-cut and relaxed kurtis designed for effortless day-to-evening sophistication.',
    image: '/images/featured-tradition.jpg',
    imagePosition: 'center 20%',
  },
  {
    slug: 'dupattas',
    title: 'Dupattas',
    subtitle: 'Woven Accents',
    description:
      'Heirloom-inspired Maheshwari dupattas featuring subtle zari tissue, floral butti, and classic selvedge borders.',
    image: '/images/prod-dupatta-2.jpg',
    imagePosition: 'center top',
  },
  {
    slug: 'dress-materials',
    title: 'Dress Materials',
    subtitle: 'Unstitched Heritage',
    description:
      'Bespoke unstitched Maheshwari silk-cotton suit lengths with coordinating zari dupattas ready for your personal tailoring.',
    image: '/images/story-maheshwar.jpg',
    imagePosition: 'center center',
  },
  {
    slug: 'festive',
    title: 'Festive Collection',
    subtitle: 'Celebratory Grace',
    description:
      'Rich maroon, antique cream, and muted gold weaves crafted for intimate celebrations and timeless occasions.',
    image: '/images/prod-kurta-set-2.jpg',
    imagePosition: 'center top',
  },
  {
    slug: 'classics',
    title: 'Handcrafted Classics',
    subtitle: 'Signature Archive',
    description:
      'Enduring Maheshwari silhouettes rooted in timeless motifs, clean lines, and quiet luxury.',
    image: '/images/story-maheshwar.jpg',
    imagePosition: 'center center',
  },
];

export const homepageCollections: CollectionInfo[] = [
  collections[0], // Maheshwari Sarees
  collections[1], // Kurta Sets
  collections[2], // Kurtis
  collections[3], // Dupattas
  collections[5], // Festive Collection
  {
    slug: 'new-arrivals',
    title: 'New Arrivals',
    subtitle: 'Latest Season',
    description:
      'Discover pieces that celebrate tradition with a contemporary soul.',
    image: '/images/story-maheshwar.jpg',
    imagePosition: 'center center',
  },
];

export const collectionMetaMap: Record<
  string,
  { title: string; description: string }
> = {
  all: {
    title: 'All Collections',
    description:
      'Explore the complete NARMIRA wardrobe — timeless Maheshwari weaves crafted for the woman of today.',
  },
  'new-arrivals': {
    title: 'New Arrivals',
    description:
      'Discover pieces that celebrate tradition with a contemporary soul.',
  },
  bestsellers: {
    title: 'Most Loved by You',
    description:
      'Signature NARMIRA silhouettes cherished for their timeless drape and refined finish.',
  },
  ...Object.fromEntries(
    collections.map((c) => [
      c.slug,
      { title: c.title, description: c.description },
    ])
  ),
};
