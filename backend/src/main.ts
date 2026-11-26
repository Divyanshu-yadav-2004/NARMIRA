import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SafeExceptionFilter } from './common/filters/safe-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false, bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useLogger(['error', 'warn', 'log']);
  app.use(helmet());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ limit: '100kb', extended: true }));
  const allowedOrigins = config.getOrThrow<string>('FRONTEND_URL').split(',').map((origin) => origin.trim());
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || (allowedOrigins.includes('*') && config.get('NODE_ENV') !== 'production') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.setGlobalPrefix(config.getOrThrow<string>('API_PREFIX'));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, disableErrorMessages: config.get('NODE_ENV') === 'production' }));
  app.useGlobalFilters(new SafeExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  const nodeEnv = config.getOrThrow<string>('NODE_ENV');
  if (nodeEnv !== 'production' || config.get<boolean>('ENABLE_SWAGGER')) {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder()
      .setTitle('NARMIRA API').setDescription('NARMIRA ecommerce API').setVersion('1.0.0').build());
    SwaggerModule.setup('api/docs', app, document, { jsonDocumentUrl: 'api/docs-json' });
  }

  app.enableShutdownHooks();
  const port = config.getOrThrow<number>('PORT');
  const host = config.getOrThrow<string>('HOST');
  await app.listen(port, host);
  logger.log(JSON.stringify({ event: 'server_listening', host, port, environment: nodeEnv }));
}

void bootstrap().catch(() => {
  // Never print environment values or dependency exceptions that may contain URLs.
  new Logger('Bootstrap').error('Application startup failed. Check configuration and database availability.');
  process.exitCode = 1;
});
