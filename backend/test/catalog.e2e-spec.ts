import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SafeExceptionFilter } from '../src/common/filters/safe-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/interceptors/request-logging.interceptor';
import { DatabaseModule } from '../src/database/database.module';
import { PrismaService } from '../src/database/prisma.service';
import { CatalogModule } from '../src/modules/catalog/catalog.module';

describe('Catalog API (mocked database)', () => {
  let app: INestApplication;
  const prisma = {
    product: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
    category: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
    collection: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation((operation: unknown) =>
    typeof operation === 'function'
      ? (operation as (transaction: typeof prisma) => Promise<unknown>)(prisma)
      : Promise.all(operation as Promise<unknown>[]),
  );

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [DatabaseModule, CatalogModule] })
      .overrideProvider(PrismaService).useValue(prisma).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new SafeExceptionFilter());
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
    await app.init();
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => app?.close());

  it('serves paginated public listing and applies active product scope', async () => {
    prisma.product.findMany.mockResolvedValueOnce([]);
    prisma.product.count.mockResolvedValueOnce(0);
    await request(app.getHttpServer()).get('/api/v1/products?page=2&pageSize=10').expect(200)
      .expect({ data: [], pagination: { page: 2, pageSize: 10, total: 0, totalPages: 0 } });
    expect(prisma.product.findMany.mock.calls[0][0]).toMatchObject({ where: { status: 'ACTIVE' }, skip: 10, take: 10 });
  });

  it('rejects invalid pagination, price ranges, enum values and unknown filters', async () => {
    await request(app.getHttpServer()).get('/api/v1/products?pageSize=1000').expect(400);
    await request(app.getHttpServer()).get('/api/v1/products?minPrice=800&maxPrice=100').expect(400);
    await request(app.getHttpServer()).get('/api/v1/products?sort=random').expect(400);
    await request(app.getHttpServer()).get('/api/v1/products?admin=true').expect(400);
  });

  it('uses parameterized effective-price sorting and returns 404 for hidden products', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([]);
    prisma.product.count.mockResolvedValueOnce(0);
    await request(app.getHttpServer()).get('/api/v1/products?sort=price-asc&minPrice=100').expect(200);
    expect(prisma.$queryRaw.mock.calls[0][0].sql).toContain('COALESCE(p."salePrice", p."basePrice")');
    expect(prisma.$queryRaw.mock.calls[0][0].values).toContain(100);
    prisma.product.findFirst.mockResolvedValueOnce(null);
    await request(app.getHttpServer()).get('/api/v1/products/hidden-product').expect(404)
      .expect({ statusCode: 404, message: 'Product not found' });
  });

  it('serves active category and collection endpoints', async () => {
    prisma.category.findMany.mockResolvedValueOnce([]);
    prisma.category.count.mockResolvedValueOnce(0);
    await request(app.getHttpServer()).get('/api/v1/categories').expect(200);
    prisma.collection.findMany.mockResolvedValueOnce([]);
    prisma.collection.count.mockResolvedValueOnce(0);
    await request(app.getHttpServer()).get('/api/v1/collections').expect(200);
    expect(prisma.category.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
    expect(prisma.collection.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
    await request(app.getHttpServer()).get('/api/v1/categories/not--a-slug').expect(400);
  });

  it('publishes catalog routes and filters in the generated Swagger document', () => {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('NARMIRA API').setVersion('1').build());
    expect(document.paths['/api/v1/products']?.get?.parameters?.map((parameter) => 'name' in parameter ? parameter.name : '')).toEqual(
      expect.arrayContaining(['page', 'pageSize', 'search', 'category', 'collection', 'color', 'size', 'fabric', 'minPrice', 'maxPrice', 'sort']),
    );
    expect(document.paths['/api/v1/products/featured']?.get).toBeDefined();
    expect(document.paths['/api/v1/products/new-arrivals']?.get).toBeDefined();
    expect(document.paths['/api/v1/products/bestsellers']?.get).toBeDefined();
    expect(document.paths['/api/v1/categories/{slug}']?.get).toBeDefined();
    expect(document.paths['/api/v1/collections/{slug}']?.get).toBeDefined();
  });

  it('hides database errors from catalog clients', async () => {
    prisma.product.findMany.mockRejectedValueOnce(new Error('postgresql://private-credentials'));
    const response = await request(app.getHttpServer()).get('/api/v1/products').expect(500);
    expect(JSON.stringify(response.body)).not.toContain('private-credentials');
    expect(response.body.message).toBe('Internal server error');
  });
});
