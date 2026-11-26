import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const valid = { NODE_ENV: 'test', DATABASE_URL: '', FRONTEND_URL: 'http://localhost:5173' };

  it('provides validated defaults', () => {
    expect(validateEnvironment(valid)).toMatchObject({ PORT: 5000, HOST: '127.0.0.1', API_PREFIX: 'api/v1', NODE_ENV: 'test' });
  });

  it('keeps development bound to loopback unless explicitly configured', () => {
    expect(validateEnvironment({ ...valid, NODE_ENV: 'development', DATABASE_URL: 'postgresql://local/db' }).HOST).toBe('127.0.0.1');
    expect(validateEnvironment({ ...valid, NODE_ENV: 'production', DATABASE_URL: 'postgresql://local/db' }).HOST).toBe('0.0.0.0');
    expect(() => validateEnvironment({ ...valid, HOST: '0.0.0.0;evil' })).toThrow('HOST');
  });

  it('rejects invalid ports and malformed origins', () => {
    expect(() => validateEnvironment({ ...valid, PORT: '70000' })).toThrow('PORT');
    expect(() => validateEnvironment({ ...valid, FRONTEND_URL: 'https://shop.example/path' })).toThrow('FRONTEND_URL');
  });

  it('requires PostgreSQL configuration outside tests', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production', FRONTEND_URL: 'https://shop.example' })).toThrow('DATABASE_URL');
    expect(() => validateEnvironment({ ...valid, DATABASE_URL: 'file:./local.db' })).toThrow('PostgreSQL');
  });
});
