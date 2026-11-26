import { hashPassword, randomToken, tokenHash, validImageReference, validSlug, verifyPassword } from './security';

describe('admin security helpers', () => {
  it('hashes passwords with a salted scrypt encoding and verifies safely', async () => {
    const first = await hashPassword('a-strong-test-password-123');
    const second = await hashPassword('a-strong-test-password-123');
    expect(first).not.toBe(second);
    await expect(verifyPassword('a-strong-test-password-123', first)).resolves.toBe(true);
    await expect(verifyPassword('wrong-password', first)).resolves.toBe(false);
    await expect(verifyPassword('x', 'invalid')).resolves.toBe(false);
  });

  it('generates opaque tokens and stores only one-way token digests', () => {
    const token = randomToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{40,50}$/);
    expect(tokenHash(token)).toHaveLength(64);
    expect(tokenHash(token)).not.toBe(token);
  });

  it('only accepts safe remote HTTPS and approved local image references', () => {
    expect(validImageReference('https://cdn.example.test/products/look.jpg')).toBe(true);
    expect(validImageReference('/images/products/look.jpg')).toBe(true);
    expect(validImageReference('/assets/look.webp')).toBe(true);
    expect(validImageReference('http://cdn.example.test/look.jpg')).toBe(false);
    expect(validImageReference('file:///etc/passwd')).toBe(false);
    expect(validImageReference('http://127.0.0.1/admin')).toBe(false);
    expect(validImageReference('/images/../secret.jpg')).toBe(false);
  });

  it('accepts only normalized path-safe slugs', () => {
    expect(validSlug('banarasi-saree-3')).toBe(true);
    expect(validSlug('Banarasi Saree')).toBe(false);
    expect(validSlug('../unsafe')).toBe(false);
  });
});
