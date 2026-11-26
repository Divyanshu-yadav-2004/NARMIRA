import { INestApplication, ValidationPipe, Controller, Post, Body } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import request from 'supertest';
import { SafeExceptionFilter } from '../src/common/filters/safe-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/interceptors/request-logging.interceptor';
import { DatabaseModule } from '../src/database/database.module';
import { PrismaService } from '../src/database/prisma.service';
import { HealthModule } from '../src/modules/health/health.module';

class ProbeDto {
  @IsString()
  name!: string;
}

@Controller('validation-probe')
class ValidationProbeController {
  @Post()
  create(@Body() body: ProbeDto) { return body; }
}

describe('API foundation (e2e)', () => {
  let app: INestApplication;
  const prisma = { $queryRaw: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DatabaseModule, HealthModule],
      controllers: [ValidationProbeController],
    }).overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: ['http://localhost:5173'] });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new SafeExceptionFilter());
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
    await app.init();
  });

  afterAll(async () => app?.close());

  it('serves liveness and does not require a database for it', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200)
      .expect({ status: 'ok', service: 'narmira-api' });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('returns 503 for database-unavailable readiness', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('private connection details'));
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(503)
      .expect({ statusCode: 503, message: 'Service is temporarily unavailable' });
  });

  it('accepts configured frontend CORS and omits CORS permission for other origins', async () => {
    const allowed = await request(app.getHttpServer()).get('/api/v1/health').set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    const denied = await request(app.getHttpServer()).get('/api/v1/health').set('Origin', 'https://untrusted.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('rejects invalid payloads and unknown DTO fields', async () => {
    await request(app.getHttpServer()).post('/api/v1/validation-probe').send({ name: 42 }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/validation-probe').send({ name: 'valid', admin: true }).expect(400);
  });

  it('uses safe HTTP errors for unknown paths', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/not-found').expect(404);
    expect(response.body).toMatchObject({ statusCode: 404 });
    expect(JSON.stringify(response.body)).not.toContain('stack');
  });
});
