export type CategorySlug =
  | 'sarees'
  | 'kurta-sets'
  | 'kurtis'
  | 'dupattas'
  | 'dress-materials'
  | 'festive'
  | 'classics';

export interface ColorOption {
  name: string;
  hex: string;
}

/** Optional color-specific inventory data. Omit images when the catalog has no
 * verified photographs for that color; callers then use the product gallery. */
export interface ProductVariant {
  id: string;
  color: ColorOption;
  images?: ProductImageInput[];
  price?: number;
}

export interface ProductImage {
  src: string;
  alt: string;
  view?: 'front' | 'back' | 'side' | 'detail' | 'lifestyle';
  objectPosition?: string;
}

export type ProductImageInput = string | ProductImage;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: CategorySlug;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  fabric: string;
  weaveOrigin: string;
  careInstructions: string;
  details: string[];
  images: ProductImageInput[];
  colors: ColorOption[];
  variants?: ProductVariant[];
  sizes: string[];
  unavailableSizes?: string[];
  inStock: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  isDemo?: boolean;
}

export interface CollectionInfo {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition?: string;
}

export interface CartItem {
  id: string; // Stable composite of product, size, and variant IDs.
  product: Product;
  size: string;
  color: ColorOption;
  variantId?: string;
  unitPrice: number;
  quantity: number;
}

export interface Review {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productName: string;
  productSlug: string;
  isSample: boolean;
  date: string;
}

export interface FilterState {
  category: string;
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  fabrics: string[];
  inStockOnly: boolean;
}

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'bestselling';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'cod';
  status: 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered';
  isDemo?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isSignedIn: boolean;
}
