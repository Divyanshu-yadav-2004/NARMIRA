import type { Review } from '../types';

// Note: Sample reviews clearly marked as illustrative content until live customer reviews are connected.
export const sampleReviews: Review[] = [
  {
    id: 'rev-1',
    customerName: 'Ananya Deshmukh',
    location: 'Mumbai',
    rating: 5,
    comment:
      'The drape of the Maheshwari Silk Saree is extraordinarily light yet feels rich and structured. I wore it for an intimate family dinner and felt effortlessly graceful all evening.',
    productName: 'Maheshwari Silk Saree',
    productSlug: 'maheshwari-silk-saree-ahilya-maroon',
    isSample: true,
    date: 'Sample Review',
  },
  {
    id: 'rev-2',
    customerName: 'Meera Kulkarni',
    location: 'Indore',
    rating: 5,
    comment:
      'The Ivory Handwoven Kurta Set has the most refined finish. The muted gold border on the dupatta catches natural light so subtly — true quiet luxury.',
    productName: 'Ivory Handwoven Kurta Set',
    productSlug: 'ivory-handwoven-kurta-set',
    isSample: true,
    date: 'Sample Review',
  },
  {
    id: 'rev-3',
    customerName: 'Kavya Nair',
    location: 'Bengaluru',
    rating: 5,
    comment:
      'Ordered the Royal Maroon Festive Suit for Diwali. The shade of maroon is deep and regal, and the breathable lining made it comfortable for hours.',
    productName: 'Royal Maroon Festive Suit',
    productSlug: 'royal-maroon-festive-suit',
    isSample: true,
    date: 'Sample Review',
  },
];
