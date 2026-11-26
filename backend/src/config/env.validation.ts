export interface AppEnvironment {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  HOST: string;
  API_PREFIX: string;
  FRONTEND_URL: string;
  ENABLE_SWAGGER: boolean;
  DATABASE_URL: string;
}

export function validateEnvironment(input: Record<string, unknown>): AppEnvironment {
  const nodeEnv = String(input.NODE_ENV || 'development');
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  const port = Number(input.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const host = String(input.HOST || (nodeEnv === 'production' ? '0.0.0.0' : '127.0.0.1'));
  if (host.length > 253 || !/^[a-zA-Z0-9.:-]+$/.test(host)) {
    throw new Error('HOST must be a valid hostname or IP address');
  }

  const apiPrefix = String(input.API_PREFIX || 'api/v1').replace(/^\/+|\/+$/g, '');
  if (!apiPrefix || apiPrefix.includes('..')) throw new Error('API_PREFIX is invalid');

  const frontendUrl = String(input.FRONTEND_URL || 'http://localhost:5173');
  const origins = frontendUrl.split(',').map((origin) => origin.trim());
  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
        throw new Error();
    }
    } catch {
      throw new Error('FRONTEND_URL must contain comma-separated origins without paths');
    }
  }
  if (nodeEnv === 'production' && origins.includes('*')) {
    throw new Error('Wildcard CORS origins are not allowed in production');
  }

  const databaseUrl = String(input.DATABASE_URL || '');
  if (nodeEnv !== 'test' && !databaseUrl) throw new Error('DATABASE_URL is required');
  if (databaseUrl && !databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }

  const enableSwagger = String(input.ENABLE_SWAGGER ?? 'false').toLowerCase();
  if (!['true', 'false'].includes(enableSwagger)) throw new Error('ENABLE_SWAGGER must be true or false');

  return {
    NODE_ENV: nodeEnv as AppEnvironment['NODE_ENV'],
    PORT: port,
    HOST: host,
    API_PREFIX: apiPrefix,
    FRONTEND_URL: frontendUrl,
    ENABLE_SWAGGER: enableSwagger === 'true',
    DATABASE_URL: databaseUrl,
  };
}
