import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { SafeExceptionFilter } from '../src/common/filters/safe-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/interceptors/request-logging.interceptor';

describe('Catalog API (real PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let safeDatabaseConfirmed = false;
  const suffix = `qa-phase2-${Date.now()}`;
  const slugs = {
    activeA: `${suffix}-silk`,
    activeB: `${suffix}-cotton`,
    draft: `${suffix}-draft`,
    archived: `${suffix}-archived`,
    category: `${suffix}-category`,
    collection: `${suffix}-collection`,
  };
  const ids = {
    productA: `${suffix}-product-a`, productB: `${suffix}-product-b`,
    draft: `${suffix}-product-draft`, archived: `${suffix}-product-archived`,
    variantA: `${suffix}-variant-a`, variantB: `${suffix}-variant-b`,
    sizeA: `${suffix}-size-a`, sizeB: `${suffix}-size-b`,
    category: `${suffix}-category-id`, collection: `${suffix}-collection-id`,
  };

  beforeAll(async () => {
    if (process.env.NARMIRA_POSTGRES_TESTS !== '1') {
      throw new Error('Set NARMIRA_POSTGRES_TESTS=1 to run temporary-record PostgreSQL tests.');
    }
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new SafeExceptionFilter());
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
    await app.init();
    prisma = app.get(PrismaService);

    const [target] = await prisma.$queryRaw<Array<{ database: string; address: string | null; port: string }>>`
      SELECT current_database() AS database, host(inet_server_addr()) AS address, current_setting('port') AS port
    `;
    if (target.database !== 'narmira' || target.address !== '127.0.0.1' || target.port !== '55432') {
      throw new Error('Refusing QA fixture writes outside the isolated loopback NARMIRA database on port 55432.');
    }
    safeDatabaseConfirmed = true;

    await prisma.category.create({ data: {
      id: ids.category, name: `QA fixture ${suffix}`, slug: slugs.category, isActive: true,
    } });
    await prisma.collection.create({ data: {
      id: ids.collection, name: `QA fixture ${suffix}`, slug: slugs.collection, isActive: true,
    } });

    await prisma.product.create({ data: {
      id: ids.productA, name: `QA fixture ${suffix} silk`, slug: slugs.activeA, sku: `${suffix}-sku-a`,
      description: 'Temporary automated test record; not a NARMIRA catalog item.',
      shortDescription: 'Temporary QA record', basePrice: '200.00', salePrice: '100.00', status: 'ACTIVE',
      featured: true, newArrival: true, bestseller: false, material: 'QA Silk', weaveOrigin: 'QA only',
      createdAt: new Date('2025-01-01T00:00:00.000Z'),
      categories: { create: { categoryId: ids.category } },
      collections: { create: { collectionId: ids.collection } },
    } });
    await prisma.product.create({ data: {
      id: ids.productB, name: `QA fixture ${suffix} cotton`, slug: slugs.activeB, sku: `${suffix}-sku-b`,
      description: 'Temporary automated test record; not a NARMIRA catalog item.',
      shortDescription: 'Temporary QA record', basePrice: '150.00', status: 'ACTIVE',
      featured: false, newArrival: false, bestseller: true, material: 'QA Cotton',
      createdAt: new Date('2025-01-02T00:00:00.000Z'),
    } });
    await prisma.product.create({ data: {
      id: ids.draft, name: `QA fixture ${suffix} draft`, slug: slugs.draft, sku: `${suffix}-sku-draft`,
      description: 'Temporary automated test record; not a NARMIRA catalog item.',
      basePrice: '125.00', status: 'DRAFT',
    } });
    await prisma.product.create({ data: {
      id: ids.archived, name: `QA fixture ${suffix} archived`, slug: slugs.archived, sku: `${suffix}-sku-archived`,
      description: 'Temporary automated test record; not a NARMIRA catalog item.',
      basePrice: '125.00', status: 'ARCHIVED',
    } });

    await prisma.productVariant.create({ data: {
      id: ids.variantA, productId: ids.productA, name: 'QA Maroon', colorName: 'Maroon', colorCode: '#632D35', sku: `${suffix}-variant-sku-a`,
    } });
    await prisma.productVariant.create({ data: {
      id: ids.variantB, productId: ids.productB, name: 'QA Ivory', colorName: 'Ivory', colorCode: '#F8F5EF', sku: `${suffix}-variant-sku-b`,
    } });
    await prisma.productSize.create({ data: { id: ids.sizeA, productId: ids.productA, size: 'M', sku: `${suffix}-size-sku-a` } });
    await prisma.productSize.create({ data: { id: ids.sizeB, productId: ids.productB, size: 'S', sku: `${suffix}-size-sku-b` } });
    await prisma.productImage.create({
      data: { productId: ids.productA, variantId: ids.variantA, imageUrl: '/qa-test-only/not-a-real-product-photo.jpg', altText: 'Temporary QA fixture image path' },
    });
    await prisma.inventory.create({ data: {
      productId: ids.productA, variantId: ids.variantA, sizeId: ids.sizeA,
      combinationKey: `${ids.variantA}:${ids.sizeA}`, stockQuantity: 5, reservedQuantity: 1,
    } });
    await prisma.inventory.create({ data: {
      productId: ids.productB, variantId: ids.variantB, sizeId: ids.sizeB,
      combinationKey: `${ids.variantB}:${ids.sizeB}`, stockQuantity: 2, reservedQuantity: 0,
    } });
  }, 30000);

  afterAll(async () => {
    if (prisma && safeDatabaseConfirmed) {
      await prisma.product.deleteMany({ where: { id: { in: Object.values(ids).filter((id) => id.includes('product-')) } } });
      await prisma.category.deleteMany({ where: { id: ids.category } });
      await prisma.collection.deleteMany({ where: { id: ids.collection } });
    }
    await app?.close();
  }, 30000);

  it('executes search, pagination, slug detail, and public badge endpoints against PostgreSQL', async () => {
    const search = encodeURIComponent(suffix);
    const page1 = await request(app.getHttpServer()).get(`/api/v1/products?search=${search}&pageSize=1`).expect(200);
    expect(page1.body.pagination).toMatchObject({ page: 1, pageSize: 1, total: 2, totalPages: 2 });
    const page2 = await request(app.getHttpServer()).get(`/api/v1/products?search=${search}&page=2&pageSize=1`).expect(200);
    expect(page2.body.data).toHaveLength(1);
    await request(app.getHttpServer()).get(`/api/v1/products?search=${encodeURIComponent(`${suffix}-sku-b`)}`).expect(200)
      .expect((response) => expect(response.body.data.map((product: { id: string }) => product.id)).toEqual([ids.productB]));
    await request(app.getHttpServer()).get(`/api/v1/products/${slugs.activeA}`).expect(200)
      .expect((response) => expect(response.body.variants[0]).toMatchObject({ id: ids.variantA, colorName: 'Maroon' }));
    await request(app.getHttpServer()).get(`/api/v1/products/${slugs.draft}`).expect(404);
    await request(app.getHttpServer()).get(`/api/v1/products/${slugs.archived}`).expect(404);
    await request(app.getHttpServer()).get(`/api/v1/products/featured?search=${search}`).expect(200)
      .expect((response) => expect(response.body.data.map((product: { id: string }) => product.id)).toEqual([ids.productA]));
    await request(app.getHttpServer()).get(`/api/v1/products/new-arrivals?search=${search}`).expect(200)
      .expect((response) => expect(response.body.data.map((product: { id: string }) => product.id)).toEqual([ids.productA]));
    await request(app.getHttpServer()).get(`/api/v1/products/bestsellers?search=${search}`).expect(200)
      .expect((response) => expect(response.body.data.map((product: { id: string }) => product.id)).toEqual([ids.productB]));
  });

  it('executes category, collection, color, size, fabric, price, and combined filters', async () => {
    const search = `search=${encodeURIComponent(suffix)}`;
    const cases: string[] = [
      `category=${slugs.category}`, `collection=${slugs.collection}`, 'color=Maroon', 'size=M',
      'fabric=QA%20Silk', 'minPrice=95&maxPrice=105',
    ];
    for (const filter of cases) {
      const result = await request(app.getHttpServer()).get(`/api/v1/products?${search}&${filter}`).expect(200);
      expect(result.body.data.map((product: { id: string }) => product.id)).toContain(ids.productA);
    }
    const combined = await request(app.getHttpServer()).get(
      `/api/v1/products?${search}&category=${slugs.category}&collection=${slugs.collection}&color=Maroon&size=M&fabric=Silk&minPrice=95&maxPrice=105`,
    ).expect(200);
    expect(combined.body.data.map((product: { id: string }) => product.id)).toEqual([ids.productA]);
    await request(app.getHttpServer()).get(`/api/v1/categories/${slugs.category}?pageSize=1`).expect(200)
      .expect((response) => expect(response.body.products.data[0].id).toBe(ids.productA));
    await request(app.getHttpServer()).get(`/api/v1/collections/${slugs.collection}?pageSize=1`).expect(200)
      .expect((response) => expect(response.body.products.data[0].id).toBe(ids.productA));
  });

  it('sorts by effective prices, newest, and name against PostgreSQL', async () => {
    const search = `search=${encodeURIComponent(suffix)}`;
    const idsFor = async (sort: string) => (await request(app.getHttpServer()).get(`/api/v1/products?${search}&sort=${sort}`).expect(200))
      .body.data.map((product: { id: string }) => product.id);
    expect(await idsFor('price-asc')).toEqual([ids.productA, ids.productB]);
    expect(await idsFor('price-desc')).toEqual([ids.productB, ids.productA]);
    expect(await idsFor('newest')).toEqual([ids.productB, ids.productA]);
    expect(await idsFor('name')).toEqual([ids.productB, ids.productA]);
  });

  it('enforces database price, color, inventory, relationship, slug, and SKU constraints', async () => {
    const invalidProduct = {
      name: `QA invalid ${suffix}`, slug: `${suffix}-invalid`, description: 'Temporary invalid QA row', basePrice: '10.00',
    };
    await expect(prisma.product.create({ data: { ...invalidProduct, basePrice: '-1.00' } })).rejects.toThrow();
    await expect(prisma.product.create({ data: {
      ...invalidProduct, slug: `${suffix}-invalid-sale`, basePrice: '10.00', salePrice: '11.00',
    } })).rejects.toThrow();
    await expect(prisma.product.create({ data: {
      ...invalidProduct, slug: slugs.activeA, basePrice: '10.00',
    } })).rejects.toThrow();
    await expect(prisma.product.create({ data: {
      ...invalidProduct, slug: `${suffix}-duplicate-sku`, sku: `${suffix}-sku-a`, basePrice: '10.00',
    } })).rejects.toThrow();
    await expect(prisma.productVariant.create({ data: {
      productId: ids.productA, name: 'QA invalid color', colorName: 'Invalid', colorCode: 'maroon',
    } })).rejects.toThrow();
    await expect(prisma.inventory.create({ data: {
      productId: ids.productA, variantId: ids.variantA, sizeId: ids.sizeA,
      combinationKey: `${ids.variantA}:${ids.sizeA}`, stockQuantity: 1, reservedQuantity: 2,
    } })).rejects.toThrow();
    await expect(prisma.inventory.create({ data: {
      productId: ids.productA, variantId: ids.variantA, sizeId: ids.sizeA,
      combinationKey: `${ids.variantA}:${ids.sizeA}`, stockQuantity: 5, reservedQuantity: 0,
    } })).rejects.toThrow();
    await expect(prisma.inventory.create({ data: {
      productId: ids.productB, variantId: ids.variantA, sizeId: ids.sizeA,
      combinationKey: `${ids.variantA}:${ids.sizeA}`, stockQuantity: 1, reservedQuantity: 0,
    } })).rejects.toThrow();
  });

  it('handles invalid query values and SQL injection-shaped search as data', async () => {
    await request(app.getHttpServer()).get('/api/v1/products?pageSize=1000').expect(400);
    await request(app.getHttpServer()).get(`/api/v1/products?search=${encodeURIComponent("' OR 1=1 --")}`).expect(200)
      .expect((response) => expect(response.body.data).toHaveLength(0));
  });
});
