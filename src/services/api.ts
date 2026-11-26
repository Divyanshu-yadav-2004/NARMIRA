import { siteConfig } from '../config/siteConfig';
import { products } from '../data/products';
import { sampleReviews } from '../data/reviews';
import type { Order, Product, Review, ShippingAddress, CartItem } from '../types';

const API_BASE = siteConfig.api.baseUrl;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    if (API_BASE) {
      return request<Product[]>('/products');
    }
    return Promise.resolve(products);
  },

  async getBySlug(slug: string): Promise<Product | undefined> {
    if (API_BASE) {
      return request<Product>(`/products/${slug}`);
    }
    return Promise.resolve(products.find((p) => p.slug === slug));
  },

  async search(query: string): Promise<Product[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    if (API_BASE) {
      return request<Product[]>(`/products?q=${encodeURIComponent(q)}`);
    }
    return Promise.resolve(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    );
  },

  async getReviews(productSlug?: string): Promise<Review[]> {
    if (API_BASE) {
      const qs = productSlug ? `?product=${encodeURIComponent(productSlug)}` : '';
      return request<Review[]>(`/reviews${qs}`);
    }
    if (productSlug) {
      return Promise.resolve(
        sampleReviews.filter((r) => r.productSlug === productSlug)
      );
    }
    return Promise.resolve(sampleReviews);
  },
};

export interface CreateOrderPayload {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: Order['paymentMethod'];
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    if (API_BASE) {
      return request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    }
    // Simulated order creation when running in frontend-only mode
    await new Promise((resolve) => setTimeout(resolve, 500));
    const order: Order = {
      id: `NRM-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
      ...payload,
      status: 'Confirmed',
      isDemo: true,
    };
    return order;
  },
};

export const newsletterService = {
  async subscribe(email: string): Promise<{ ok: boolean; message: string }> {
    if (API_BASE) {
      return request<{ ok: boolean; message: string }>('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 450));
    return {
      ok: true,
      message: 'Welcome to the world of NARMIRA. Thank you for subscribing.',
    };
  },
};
