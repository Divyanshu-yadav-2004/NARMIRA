import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto';
const COST = 32768;
const BLOCK_SIZE = 8;
const PARALLEL = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => scryptCallback(password, salt, keyLength,
    { N: COST, r: BLOCK_SIZE, p: PARALLEL, maxmem: 64 * 1024 * 1024 },
    (error, key) => error ? reject(error) : resolve(key)));
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, KEY_LENGTH);
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLEL}$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallel, saltText, keyText, extra] = encoded.split('$');
  if (algorithm !== 'scrypt' || cost !== String(COST) || blockSize !== String(BLOCK_SIZE) || parallel !== String(PARALLEL) || !saltText || !keyText || extra !== undefined) return false;
  try {
    const salt = Buffer.from(saltText, 'base64url');
    const expected = Buffer.from(keyText, 'base64url');
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = await derive(password, salt, expected.length);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function validImageReference(value: string): boolean {
  if (value.length > 2048 || value.includes('\\') || value.startsWith('//') || /[\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith('/')) {
    if (!/^\/(images|assets)\/[A-Za-z0-9_./%~-]+$/.test(value)) return false;
    try {
      const segments = decodeURIComponent(value).split('/');
      return !segments.some((segment) => segment === '.' || segment === '..');
    } catch { return false; }
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function validSlug(value: string): boolean {
  return value.length <= 200 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function requestIdFrom(request: { requestId?: string }): string | undefined {
  return request.requestId;
}
