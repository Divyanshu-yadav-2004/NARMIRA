import type { AdminUser, AuditEntry, Category, Collection, Page, Product, ProductImage, ProductInput, ResourceInput } from './types';

const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const apiRoot = `${base}/api/v1/admin`;
let csrfToken: string | null = null;
let csrfRefresh: Promise<void> | null = null;

export class AdminApiError extends Error {
  readonly status: number;
  readonly issues?: string[];
  constructor(message: string, status: number, issues?: string[]) { super(message); this.name = 'AdminApiError'; this.status = status; this.issues = issues; }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!csrfToken) {
      try {
        csrfRefresh ??= refreshCsrf().finally(() => { csrfRefresh = null; });
        await csrfRefresh;
      }
      catch (error) {
        if (path !== '/auth/login') throw error;
      }
    }
    if (csrfToken) headers.set('x-csrf-token', csrfToken);
  }
  let response: Response;
  try {
    response = await fetch(`${apiRoot}${path}`, { ...init, headers, credentials: 'include' });
  } catch {
    throw new AdminApiError('Could not reach the NARMIRA API. Check that the backend is running and try again.', 0);
  }
  const payload = await response.json().catch(() => ({})) as { message?: string | string[]; issues?: string[]; error?: string };
  if (!response.ok) {
    const message = Array.isArray(payload.message) ? payload.message.join('. ') : payload.message || payload.error || `Request failed (${response.status})`;
    if (response.status === 401 && !path.startsWith('/auth/login')) {
      csrfToken = null;
      window.dispatchEvent(new CustomEvent('narmira:session-expired'));
    }
    throw new AdminApiError(message, response.status, payload.issues);
  }
  return payload as T;
}

async function refreshCsrf(): Promise<void> {
  const response = await fetch(`${apiRoot}/auth/csrf`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) throw new AdminApiError('Your admin session has expired. Please sign in again.', response.status);
  const result = await response.json() as { csrfToken: string };
  csrfToken = result.csrfToken;
}

async function allPages<T>(path: string): Promise<Page<T>> {
  const first = await request<Page<T>>(`${path}?page=1&pageSize=100`);
  const remaining = await Promise.all(Array.from({ length: Math.max(0, first.pagination.totalPages - 1) }, (_, index) => request<Page<T>>(`${path}?page=${index + 2}&pageSize=100`)));
  return { ...first, data: [...first.data, ...remaining.flatMap(page => page.data)] };
}

export const adminApi = {
  async login(email: string, password: string) {
    const result = await request<{ admin: AdminUser; csrfToken: string; expiresAt: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    csrfToken = result.csrfToken;
    return result.admin;
  },
  async me() { return (await request<{ admin: AdminUser }>('/auth/me')).admin; },
  async logout() { await request<{ success: boolean }>('/auth/logout', { method: 'POST', body: '{}' }); csrfToken = null; },
  products() { return allPages<Product>('/products'); },
  product(id: string) { return request<Product>(`/products/${encodeURIComponent(id)}`); },
  createProduct(data: ProductInput) { return request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }); },
  updateProduct(id: string, data: ProductInput) { return request<Product>(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  lifecycle(id: string, action: 'publish'|'unpublish'|'archive'|'restore') { return request<Product>(`/products/${encodeURIComponent(id)}/${action}`, { method: 'POST', body: '{}' }); },
  categories() { return allPages<Category>('/categories'); },
  collections() { return allPages<Collection>('/collections'); },
  createResource(kind: 'categories'|'collections', data: ResourceInput) { return request<Category|Collection>(`/${kind}`, { method: 'POST', body: JSON.stringify(data) }); },
  updateResource(kind: 'categories'|'collections', id: string, data: Partial<ResourceInput> & { isActive?: boolean }) { return request<Category|Collection>(`/${kind}/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  deactivateResource(kind: 'categories'|'collections', id: string) { return request<Category|Collection>(`/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE', body: '{}' }); },
  addImage(productId: string, imageUrl: string, altText: string, sortOrder: number) { return request<ProductImage>(`/products/${productId}/images`, { method: 'POST', body: JSON.stringify({ imageUrl, altText, sortOrder, isPrimary: sortOrder === 0 }) }); },
  updateImage(productId: string, imageId: string, data: { imageUrl: string; altText: string; sortOrder: number; isPrimary: boolean }) { return request<ProductImage>(`/products/${productId}/images/${imageId}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  deleteImage(productId: string, imageId: string) { return request<{ success: boolean }>(`/products/${productId}/images/${imageId}`, { method: 'DELETE', body: '{}' }); },
  addVariant(productId: string, data: { name: string; colorName: string; colorCode: string; sku?: string }) { return request(`/products/${productId}/variants`, { method: 'POST', body: JSON.stringify(data) }); },
  updateVariant(productId: string, variantId: string, data: { name?: string; colorName?: string; colorCode?: string; sku?: string }) { return request(`/products/${productId}/variants/${variantId}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  addSize(productId: string, size: string, sortOrder: number) { return request(`/products/${productId}/sizes`, { method: 'POST', body: JSON.stringify({ size, sortOrder, isAvailable: true }) }); },
  updateSize(productId: string, sizeId: string, data: { size?: string; sortOrder?: number; isAvailable?: boolean }) { return request(`/products/${productId}/sizes/${sizeId}`, { method: 'PATCH', body: JSON.stringify(data) }); },
  setInventory(productId: string, data: { variantId?: string; sizeId?: string; quantity: number; version: number; reason: string }) { return request(`/products/${productId}/inventory`, { method: 'POST', body: JSON.stringify(data) }); },
  audit() { return request<Page<AuditEntry>>('/audit-logs?pageSize=100'); },
  resetCsrf() { csrfToken = null; csrfRefresh = null; },
};
