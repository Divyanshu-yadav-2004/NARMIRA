import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { siteConfig } from '../config/siteConfig';
import { products as allProducts } from '../data/products';
import type {
  CartItem,
  ColorOption,
  Order,
  Product,
  UserProfile,
} from '../types';
import { calculateCartTotals, getCartItemId, getCoupon, MAX_CART_QUANTITY, normalizePersistedCart, normalizeQuantity } from '../utils/cart';
import { getAvailableSizes, getProductVariants } from '../utils/format';
import { useToast } from './ToastContext';

const STORAGE_KEYS = {
  CART: 'narmira_cart_v1',
  WISHLIST: 'narmira_wishlist_v1',
  RECENTLY_VIEWED: 'narmira_recent_v1',
  ORDERS: 'narmira_orders_v1',
  USER: 'narmira_user_v1',
  COUPON: 'narmira_coupon_v1',
};

interface StoreContextValue {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode: string | null;
  couponLabel: string | null;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  quickViewVariantId: string | null;
  wishlistIds: string[];
  wishlistProducts: Product[];
  recentlyViewedIds: string[];
  recentlyViewedProducts: Product[];
  orders: Order[];
  user: UserProfile;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (product: Product, variantId?: string) => void;
  closeQuickView: () => void;
  addToCart: (
    product: Product,
    options?: { size?: string; color?: ColorOption; variantId?: string; quantity?: number; silent?: boolean }
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  removeCoupon: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  recordRecentlyViewed: (productId: string) => void;
  addOrder: (order: Order) => void;
  signInUser: (profile: Omit<UserProfile, 'isSignedIn'>) => void;
  signOutUser: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function readStorage(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The storefront remains usable when storage is blocked or full.
  }
}

function readStringIds(key: string, validIds?: Set<string>): string[] {
  const value = readStorage(key);
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string' && (!validIds || validIds.has(id)));
}

function readUser(): UserProfile {
  const value = readStorage(STORAGE_KEYS.USER);
  if (!value || typeof value !== 'object') return { name: '', email: '', phone: '', isSignedIn: false };
  const raw = value as Partial<UserProfile>;
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    email: typeof raw.email === 'string' ? raw.email : '',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    isSignedIn: raw.isSignedIn === true,
  };
}

function readOrders(): Order[] {
  const value = readStorage(STORAGE_KEYS.ORDERS);
  if (!Array.isArray(value)) return [];
  return value.filter((order): order is Order => Boolean(
    order && typeof order === 'object'
    && typeof order.id === 'string'
    && typeof order.createdAt === 'string'
    && Array.isArray(order.items)
    && typeof order.total === 'number'
    && order.shippingAddress && typeof order.shippingAddress === 'object'
  ));
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showToast } = useToast();

  const [cart, setCart] = useState<CartItem[]>(() =>
    normalizePersistedCart(readStorage(STORAGE_KEYS.CART), allProducts)
  );
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    readStringIds(STORAGE_KEYS.WISHLIST, new Set(allProducts.map((product) => product.id)))
  );
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() =>
    readStringIds(STORAGE_KEYS.RECENTLY_VIEWED, new Set(allProducts.map((product) => product.id)))
  );
  const [orders, setOrders] = useState<Order[]>(readOrders);
  const [user, setUser] = useState<UserProfile>(readUser);
  const [couponCode, setCouponCode] = useState<string | null>(() => {
    const value = readStorage(STORAGE_KEYS.COUPON);
    return typeof value === 'string' && getCoupon(value) ? value : null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );
  const [quickViewVariantId, setQuickViewVariantId] = useState<string | null>(null);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.WISHLIST, wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.RECENTLY_VIEWED, recentlyViewedIds);
  }, [recentlyViewedIds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.USER, user);
  }, [user]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.COUPON, couponCode);
  }, [couponCode]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openQuickView = useCallback((product: Product, variantId?: string) => {
    setQuickViewVariantId(variantId || null);
    setQuickViewProduct(product);
  }, []);
  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
    setQuickViewVariantId(null);
  }, []);

  const addToCart = useCallback(
    (
      product: Product,
      options?: {
        size?: string;
        color?: ColorOption;
        variantId?: string;
        quantity?: number;
        silent?: boolean;
      }
    ) => {
      if (!product.inStock) {
        showToast('This piece is currently out of stock.', 'info');
        return;
      }
      const availableSizes = getAvailableSizes(product);
      const selectedSize = options?.size || (availableSizes.length === 1 ? availableSizes[0] : '');
      if (!availableSizes.includes(selectedSize)) {
        showToast('Please select an available size before adding this piece.', 'info');
        return;
      }
      const variants = getProductVariants(product);
      const selectedVariant = variants.find((variant) => variant.id === options?.variantId)
        || variants.find((variant) => variant.color.name === options?.color?.name)
        || (variants.length === 1 ? variants[0] : undefined);
      if (!selectedVariant) {
        showToast('Please select an available color before adding this piece.', 'info');
        return;
      }
      const selectedColor = selectedVariant.color;
      const qty = normalizeQuantity(options?.quantity ?? 1);
      if (qty === null) {
        showToast(`Choose a whole quantity between 1 and 99.`, 'info');
        return;
      }
      const variantId = selectedVariant.id;
      const itemId = getCartItemId(product.id, selectedSize, variantId);
      const unitPrice = selectedVariant.price ?? product.price;

      setCart((prev) => {
        const existing = prev.find((item) => item.id === itemId);
        if (existing) {
          return prev.map((item) =>
            item.id === itemId
              ? { ...item, unitPrice, quantity: Math.min(MAX_CART_QUANTITY, item.quantity + qty) }
              : item
          );
        }
        return [
          ...prev,
          {
            id: itemId,
            product,
            size: selectedSize,
            color: selectedColor,
            variantId,
            unitPrice,
            quantity: qty,
          },
        ];
      });

      if (!options?.silent) {
        showToast(`Added "${product.name}" to your shopping bag.`);
        setIsCartOpen(true);
      }
    },
    [showToast]
  );

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity)) return;
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      return;
    }
    const safeQuantity = Math.min(MAX_CART_QUANTITY, quantity);
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: safeQuantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback(
    (cartItemId: string) => {
      setCart((prev) => prev.filter((item) => item.id !== cartItemId));
      showToast('Removed item from your bag.', 'info');
    },
    [showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setCouponCode(null);
  }, []);

  const applyCoupon = useCallback(
    (code: string) => {
      const normalized = code.trim().toUpperCase();
      const match = getCoupon(normalized);
      if (!match) {
        return {
          ok: false,
          message: 'Invalid code. Try NARMIRA10 or HERITAGE500.',
        };
      }
      setCouponCode(normalized);
      showToast(`Applied code ${normalized} (${match.label}).`);
      return { ok: true, message: `${match.label} applied.` };
    },
    [showToast]
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    showToast('Privilege code removed.', 'info');
  }, [showToast]);

  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(product.id);
        if (exists) {
          showToast(`Removed "${product.name}" from wishlist.`, 'info');
          return prev.filter((id) => id !== product.id);
        }
        showToast(`Saved "${product.name}" to your wishlist.`);
        return [product.id, ...prev];
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const recordRecentlyViewed = useCallback((productId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 8);
    });
  }, []);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const signInUser = useCallback(
    (profile: Omit<UserProfile, 'isSignedIn'>) => {
      setUser({ ...profile, isSignedIn: true });
      showToast(`Welcome back, ${profile.name}.`);
    },
    [showToast]
  );

  const signOutUser = useCallback(() => {
    setUser({ name: '', email: '', phone: '', isSignedIn: false });
    showToast('You have been signed out.', 'info');
  }, [showToast]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const couponLabel = couponCode ? getCoupon(couponCode)?.label ?? null : null;
  const totals = useMemo(
    () => calculateCartTotals(
      cart,
      couponCode,
      siteConfig.shipping.freeShippingThreshold,
      siteConfig.shipping.standardShippingFee,
    ),
    [cart, couponCode]
  );
  const { subtotal, discount, shipping: shippingFee, total } = totals;

  const wishlistProducts = useMemo(
    () => allProducts.filter((p) => wishlistIds.includes(p.id)),
    [wishlistIds]
  );

  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewedIds
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => Boolean(p)),
    [recentlyViewedIds]
  );

  const value: StoreContextValue = {
    cart,
    cartCount,
    subtotal,
    discount,
    shippingFee,
    total,
    couponCode,
    couponLabel,
    isCartOpen,
    isSearchOpen,
    quickViewProduct,
    quickViewVariantId,
    wishlistIds,
    wishlistProducts,
    recentlyViewedIds,
    recentlyViewedProducts,
    orders,
    user,
    openCart,
    closeCart,
    openSearch,
    closeSearch,
    openQuickView,
    closeQuickView,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    isInWishlist,
    recordRecentlyViewed,
    addOrder,
    signInUser,
    signOutUser,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
