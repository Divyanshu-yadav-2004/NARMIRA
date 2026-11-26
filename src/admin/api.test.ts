import { afterEach, describe, expect, it, vi } from 'vitest';
import { adminApi } from './api';

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('admin API integration contract', () => {
  afterEach(() => {
    adminApi.resetCsrf();
    vi.unstubAllGlobals();
  });

  it('uses the admin auth route and includes credentials for login', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ message: 'Authentication required' }, 401))
      .mockResolvedValueOnce(json({ admin: { id: 'admin-1', name: 'Atelier', email: 'admin@example.test', role: 'SUPER_ADMIN' }, csrfToken: 'csrf-value', expiresAt: '2030-01-01T00:00:00Z' }));
    vi.stubGlobal('fetch', fetchMock);

    const admin = await adminApi.login('admin@example.test', 'private-password');

    expect(admin.role).toBe('SUPER_ADMIN');
    expect(String(fetchMock.mock.calls[0][0])).toContain('/api/v1/admin/auth/csrf');
    expect(String(fetchMock.mock.calls[1][0])).toContain('/api/v1/admin/auth/login');
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'include' });
    expect(fetchMock.mock.calls[1][1]?.body).toBe(JSON.stringify({ email: 'admin@example.test', password: 'private-password' }));
  });

  it('rotates CSRF once for concurrent writes after a page reload', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => String(input).endsWith('/auth/csrf')
      ? json({ csrfToken: 'rotated-token' })
      : json({ id: 'resource-1' }));
    vi.stubGlobal('fetch', fetchMock);
    adminApi.resetCsrf();

    await Promise.all([
      adminApi.updateResource('categories', 'one', { name: 'One' }),
      adminApi.updateResource('collections', 'two', { name: 'Two' }),
      adminApi.updateResource('categories', 'three', { name: 'Three' }),
    ]);

    expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/auth/csrf'))).toHaveLength(1);
    for (const [, init] of fetchMock.mock.calls.slice(1)) {
      expect(init?.credentials).toBe('include');
      expect(new Headers(init?.headers).get('x-csrf-token')).toBe('rotated-token');
    }
  });

  it('loads all product pages for accurate catalog totals', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ data: [{ id: 'p1' }], pagination: { page: 1, pageSize: 100, total: 101, totalPages: 2 } }))
      .mockResolvedValueOnce(json({ data: [{ id: 'p101' }], pagination: { page: 2, pageSize: 100, total: 101, totalPages: 2 } }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await adminApi.products();

    expect(result.data.map(product => product.id)).toEqual(['p1', 'p101']);
    expect(String(fetchMock.mock.calls[0][0])).toContain('page=1&pageSize=100');
    expect(String(fetchMock.mock.calls[1][0])).toContain('page=2&pageSize=100');
  });
});
