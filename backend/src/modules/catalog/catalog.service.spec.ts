import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogQueryDto, ResourceQueryDto } from './catalog-query.dto';

describe('CatalogService', () => {
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
  const service = new CatalogService(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  const emptyProduct = (overrides: Record<string, unknown> = {}) => ({
    id: 'p1', name: 'Silk Saree', slug: 'silk-saree', description: 'Description', shortDescription: null,
    sku: 'SKU-1', basePrice: { toFixed: () => '100.00' }, salePrice: null, status: 'ACTIVE',
    featured: true, bestseller: false, newArrival: true, material: 'Silk', careInstructions: null,
    createdAt: new Date('2025-01-01'), updatedAt: new Date('2025-01-02'), images: [], variants: [],
    sizes: [], inventory: [], categories: [], collections: [], ...overrides,
  });

  it('lists only active products and paginates with bounded take/skip', async () => {
    prisma.product.findMany.mockResolvedValueOnce([emptyProduct()]);
    prisma.product.count.mockResolvedValueOnce(25);
    const result = await service.listProducts(Object.assign(new CatalogQueryDto(), { page: 2, pageSize: 10 }));
    expect(prisma.product.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: 'ACTIVE' }, skip: 10, take: 10,
    }));
    expect(result.pagination).toEqual({ page: 2, pageSize: 10, total: 25, totalPages: 3 });
  });

  it('builds safe search, relation, fabric, effective-price and flag filters', async () => {
    prisma.product.findMany.mockResolvedValueOnce([]);
    prisma.product.count.mockResolvedValueOnce(0);
    const query = Object.assign(new CatalogQueryDto(), {
      search: ' silk ', category: 'sarees', collection: 'festive', color: 'ivory', size: 'M',
      fabric: 'cotton', minPrice: 100, maxPrice: 500, featured: true,
    });
    await service.listProducts(query);
    const where = prisma.product.findMany.mock.calls[0][0].where;
    expect(where.status).toBe('ACTIVE');
    expect(where.featured).toBe(true);
    expect(where.AND).toEqual(expect.arrayContaining([
      expect.objectContaining({ OR: expect.arrayContaining([
        { name: { contains: 'silk', mode: 'insensitive' } },
        { sku: { contains: 'silk', mode: 'insensitive' } },
      ]) }),
      { categories: { some: { category: { slug: 'sarees', isActive: true } } } },
      { collections: { some: { collection: { slug: 'festive', isActive: true } } } },
      { variants: { some: { isActive: true, colorName: { contains: 'ivory', mode: 'insensitive' } } } },
      { sizes: { some: { size: 'M', isAvailable: true } } },
      { material: { contains: 'cotton', mode: 'insensitive' } },
    ]));
    expect(where.AND).toContainEqual({ OR: [
      { salePrice: { gte: 100, lte: 500 } },
      { salePrice: null, basePrice: { gte: 100, lte: 500 } },
    ] });
  });

  it.each([
    ['name', [{ name: 'asc' }, { id: 'asc' }]],
    ['newest', [{ createdAt: 'desc' }, { id: 'asc' }]],
  ] as const)('applies %s Prisma sort', async (sort, orderBy) => {
    prisma.product.findMany.mockResolvedValueOnce([]);
    prisma.product.count.mockResolvedValueOnce(0);
    await service.listProducts(Object.assign(new CatalogQueryDto(), { sort }));
    expect(prisma.product.findMany.mock.calls[0][0].orderBy).toEqual(orderBy);
  });

  it.each([['price-asc', 'ASC'], ['price-desc', 'DESC']] as const)(
    'sorts displayed sale/base prices exactly in %s order', async (sort, direction) => {
      prisma.$queryRaw.mockResolvedValueOnce([{ id: 'second' }, { id: 'first' }]);
      prisma.product.count.mockResolvedValueOnce(2);
      prisma.product.findMany.mockResolvedValueOnce([
        emptyProduct({ id: 'first', name: 'First' }), emptyProduct({ id: 'second', name: 'Second' }),
      ]);
      const result = await service.listProducts(Object.assign(new CatalogQueryDto(), { sort }));
      expect(prisma.$queryRaw.mock.calls[0][0].sql).toContain(`ORDER BY COALESCE(p."salePrice", p."basePrice") ${direction}`);
      expect(prisma.product.findMany.mock.calls.at(-1)?.[0].where).toEqual({ id: { in: ['second', 'first'] } });
      expect(result.data.map((product) => product.id)).toEqual(['second', 'first']);
    },
  );

  it('backs featured, new arrival and bestseller routes with database flags', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    prisma.product.count.mockResolvedValue(0);
    for (const flag of ['featured', 'newArrival', 'bestseller'] as const) {
      await service.listProducts(new CatalogQueryDto(), { [flag]: true });
      expect(prisma.product.findMany.mock.calls.at(-1)?.[0].where[flag]).toBe(true);
    }
  });

  it('returns product gallery, variant gallery, exact decimal strings and availability', async () => {
    prisma.product.findFirst.mockResolvedValueOnce(emptyProduct({
      basePrice: { toFixed: () => '2500.00' },
      images: [{ id: 'i1', imageUrl: '/catalog/front.jpg', altText: 'Front', sortOrder: 0, isPrimary: true }],
      variants: [{ id: 'v1', name: 'Ivory', colorName: 'Ivory', colorCode: '#ffffff', sku: null,
        priceOverride: { toFixed: () => '2600.00' }, isActive: true,
        images: [{ id: 'vi1', imageUrl: '/catalog/ivory.jpg', altText: null, sortOrder: 0, isPrimary: true }],
        inventory: [{ stockQuantity: 5, reservedQuantity: 2 }],
      }],
      inventory: [{ stockQuantity: 5, reservedQuantity: 2 }],
      sizes: [{ id: 's1', size: 'M', sku: null, priceOverride: null, isAvailable: true,
        inventory: [{ stockQuantity: 5, reservedQuantity: 2 }] }],
    }));
    const result = await service.getProduct('silk-saree');
    expect(prisma.product.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: 'silk-saree', status: 'ACTIVE' } }));
    expect(result.basePrice).toBe('2500.00');
    expect(result.images[0].url).toBe('/catalog/front.jpg');
    expect(result.variants[0].images[0].url).toBe('/catalog/ivory.jpg');
    expect(result.variants[0].inStock).toBe(true);
    expect(result.sizes[0].isAvailable).toBe(true);
  });

  it('returns 404 for missing or inactive public product', async () => {
    prisma.product.findFirst.mockResolvedValueOnce(null);
    await expect(service.getProduct('draft-product')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lists only active categories and paginates their products', async () => {
    prisma.category.findMany.mockResolvedValueOnce([{ id: 'c1', slug: 'sarees', isActive: true }]);
    prisma.category.count.mockResolvedValueOnce(1);
    await expect(service.listCategories(new ResourceQueryDto())).resolves.toMatchObject({
      data: [{ slug: 'sarees' }], pagination: { page: 1, pageSize: 24, total: 1 },
    });
    prisma.category.findFirst.mockResolvedValueOnce({ id: 'c1', slug: 'sarees', isActive: true });
    prisma.product.findMany.mockResolvedValueOnce([]);
    prisma.product.count.mockResolvedValueOnce(0);
    const category = await service.getCategory('sarees', new ResourceQueryDto());
    expect(prisma.category.findFirst).toHaveBeenCalledWith({ where: { slug: 'sarees', isActive: true } });
    expect(category.products.pagination.total).toBe(0);
    expect(prisma.product.findMany.mock.calls.at(-1)?.[0].where).toMatchObject({
      status: 'ACTIVE', categories: { some: { categoryId: 'c1' } },
    });
  });

  it('lists only active collections and paginates their products', async () => {
    prisma.collection.findMany.mockResolvedValueOnce([{ id: 'col1', slug: 'festive', isActive: true }]);
    prisma.collection.count.mockResolvedValueOnce(1);
    await expect(service.listCollections(new ResourceQueryDto())).resolves.toMatchObject({ data: [{ slug: 'festive' }] });
    prisma.collection.findFirst.mockResolvedValueOnce({ id: 'col1', slug: 'festive', isActive: true });
    prisma.product.findMany.mockResolvedValueOnce([]);
    prisma.product.count.mockResolvedValueOnce(0);
    const collection = await service.getCollection('festive', new ResourceQueryDto());
    expect(prisma.collection.findFirst).toHaveBeenCalledWith({ where: { slug: 'festive', isActive: true } });
    expect(prisma.product.findMany.mock.calls.at(-1)?.[0].where).toMatchObject({
      status: 'ACTIVE', collections: { some: { collectionId: 'col1' } },
    });
    expect(collection.products.pagination.total).toBe(0);
  });

  it('hides inactive categories and collections and propagates database errors safely', async () => {
    prisma.category.findFirst.mockResolvedValueOnce(null);
    await expect(service.getCategory('hidden', new ResourceQueryDto())).rejects.toBeInstanceOf(NotFoundException);
    prisma.collection.findFirst.mockResolvedValueOnce(null);
    await expect(service.getCollection('hidden', new ResourceQueryDto())).rejects.toBeInstanceOf(NotFoundException);
    prisma.product.findMany.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(service.listProducts(new CatalogQueryDto())).rejects.toThrow('database unavailable');
  });
});
