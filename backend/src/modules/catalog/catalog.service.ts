import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../database/generated/client';
import { PrismaService } from '../../database/prisma.service';
import type { CatalogQueryDto, ProductSort, ResourceQueryDto } from './catalog-query.dto';

const productInclude = {
  images: { where: { variantId: null }, orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] },
  variants: {
    where: { isActive: true },
    orderBy: { createdAt: 'asc' as const },
    include: { images: { orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] }, inventory: true },
  },
  sizes: { orderBy: { createdAt: 'asc' as const }, include: { inventory: true } },
  inventory: true,
  categories: { include: { category: true } },
  collections: { include: { collection: true } },
} satisfies Prisma.ProductInclude;

type ProductRecord = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: CatalogQueryDto, forced: Partial<Pick<CatalogQueryDto, 'featured' | 'bestseller' | 'newArrival'>> = {}) {
    const { page, pageSize } = query;
    const where = this.productWhere(query, forced);
    if (query.sort === 'price-asc' || query.sort === 'price-desc') {
      return this.prisma.$transaction(async (tx) => {
        const orderedIds = await tx.$queryRaw<{ id: string }[]>(this.productPriceIdsQuery(query, forced));
        const total = await tx.product.count({ where });
        const records = orderedIds.length
          ? await tx.product.findMany({
            where: { id: { in: orderedIds.map(({ id }) => id) } },
            include: productInclude,
          })
          : [];
        const byId = new Map(records.map((record) => [record.id, record]));
        return this.page(orderedIds.flatMap(({ id }) => {
          const record = byId.get(id);
          return record ? [this.toProduct(record)] : [];
        }), total, page, pageSize);
      }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    }
    return this.prisma.$transaction(async (tx) => {
      const records = await tx.product.findMany({
        where,
        include: productInclude,
        orderBy: this.orderBy(query.sort),
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      const total = await tx.product.count({ where });
      return this.page(records.map((record) => this.toProduct(record)), total, page, pageSize);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async getProduct(slug: string) {
    const record = await this.prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: productInclude,
    });
    if (!record) throw new NotFoundException('Product not found');
    return this.toProduct(record);
  }

  async listCategories(query: ResourceQueryDto) {
    const where = { isActive: true };
    return this.prisma.$transaction(async (tx) => {
      const records = await tx.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      });
      const total = await tx.category.count({ where });
      return this.page(records, total, query.page, query.pageSize);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async getCategory(slug: string, query: ResourceQueryDto) {
    const category = await this.prisma.category.findFirst({ where: { slug, isActive: true } });
    if (!category) throw new NotFoundException('Category not found');
    const productWhere: Prisma.ProductWhereInput = {
      status: 'ACTIVE', categories: { some: { categoryId: category.id } },
    };
    const products = await this.prisma.$transaction(async (tx) => {
      const records = await tx.product.findMany({
        where: productWhere,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      });
      const total = await tx.product.count({ where: productWhere });
      return this.page(records.map((record) => this.toProduct(record)), total, query.page, query.pageSize);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return { ...category, products };
  }

  async listCollections(query: ResourceQueryDto) {
    const where = { isActive: true };
    return this.prisma.$transaction(async (tx) => {
      const records = await tx.collection.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      });
      const total = await tx.collection.count({ where });
      return this.page(records, total, query.page, query.pageSize);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
  }

  async getCollection(slug: string, query: ResourceQueryDto) {
    const collection = await this.prisma.collection.findFirst({ where: { slug, isActive: true } });
    if (!collection) throw new NotFoundException('Collection not found');
    const productWhere: Prisma.ProductWhereInput = {
      status: 'ACTIVE', collections: { some: { collectionId: collection.id } },
    };
    const products = await this.prisma.$transaction(async (tx) => {
      const records = await tx.product.findMany({
        where: productWhere,
        include: productInclude,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      });
      const total = await tx.product.count({ where: productWhere });
      return this.page(records.map((record) => this.toProduct(record)), total, query.page, query.pageSize);
    }, { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead });
    return { ...collection, products };
  }

  private productWhere(query: CatalogQueryDto, forced: Partial<Pick<CatalogQueryDto, 'featured' | 'bestseller' | 'newArrival'>>): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };
    const AND: Prisma.ProductWhereInput[] = [];
    const search = query.search?.trim();
    if (search) {
      AND.push({ OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ] });
    }
    if (query.category) AND.push({ categories: { some: { category: { slug: query.category, isActive: true } } } });
    if (query.collection) AND.push({ collections: { some: { collection: { slug: query.collection, isActive: true } } } });
    if (query.color) AND.push({ variants: { some: { isActive: true, colorName: { contains: query.color, mode: 'insensitive' } } } });
    if (query.size) AND.push({ sizes: { some: { size: query.size, isAvailable: true } } });
    if (query.fabric) AND.push({ material: { contains: query.fabric, mode: 'insensitive' } });
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const range: Prisma.DecimalFilter<'Product'> = {};
      if (query.minPrice !== undefined) range.gte = query.minPrice;
      if (query.maxPrice !== undefined) range.lte = query.maxPrice;
      AND.push({ OR: [{ salePrice: range }, { salePrice: null, basePrice: range }] });
    }
    for (const flag of ['featured', 'bestseller', 'newArrival'] as const) {
      const value = forced[flag] ?? query[flag];
      if (value !== undefined) where[flag] = value;
    }
    if (AND.length) where.AND = AND;
    return where;
  }

  private orderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case 'price-asc':
      case 'price-desc': return [{ createdAt: 'desc' }, { id: 'asc' }];
      case 'name': return [{ name: 'asc' }, { id: 'asc' }];
      default: return [{ createdAt: 'desc' }, { id: 'asc' }];
    }
  }

  private productPriceIdsQuery(
    query: CatalogQueryDto,
    forced: Partial<Pick<CatalogQueryDto, 'featured' | 'bestseller' | 'newArrival'>>,
  ) {
    const clauses: Prisma.Sql[] = [Prisma.sql`p."status" = 'ACTIVE'`];
    const search = query.search?.trim();
    if (search) clauses.push(Prisma.sql`(p."name" ILIKE ${`%${search}%`} OR p."sku" ILIKE ${`%${search}%`})`);
    if (query.category) clauses.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ProductCategory" pc JOIN "Category" c ON c."id" = pc."categoryId"
      WHERE pc."productId" = p."id" AND c."slug" = ${query.category} AND c."isActive" = true
    )`);
    if (query.collection) clauses.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ProductCollection" pcl JOIN "Collection" c ON c."id" = pcl."collectionId"
      WHERE pcl."productId" = p."id" AND c."slug" = ${query.collection} AND c."isActive" = true
    )`);
    if (query.color) clauses.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ProductVariant" v WHERE v."productId" = p."id" AND v."isActive" = true
      AND v."colorName" ILIKE ${`%${query.color}%`}
    )`);
    if (query.size) clauses.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "ProductSize" s WHERE s."productId" = p."id" AND s."isAvailable" = true AND s."size" = ${query.size}
    )`);
    if (query.fabric) clauses.push(Prisma.sql`p."material" ILIKE ${`%${query.fabric}%`}`);
    if (query.minPrice !== undefined) clauses.push(Prisma.sql`COALESCE(p."salePrice", p."basePrice") >= ${query.minPrice}`);
    if (query.maxPrice !== undefined) clauses.push(Prisma.sql`COALESCE(p."salePrice", p."basePrice") <= ${query.maxPrice}`);
    for (const flag of ['featured', 'bestseller', 'newArrival'] as const) {
      const value = forced[flag] ?? query[flag];
      if (value !== undefined) clauses.push(Prisma.sql`p.${Prisma.raw(`"${flag}"`)} = ${value}`);
    }
    const direction = query.sort === 'price-desc' ? Prisma.raw('DESC') : Prisma.raw('ASC');
    return Prisma.sql`SELECT p."id"
      FROM "Product" p
      WHERE ${Prisma.join(clauses, ' AND ')}
      ORDER BY COALESCE(p."salePrice", p."basePrice") ${direction}, p."id" ASC
      LIMIT ${query.pageSize} OFFSET ${(query.page - 1) * query.pageSize}`;
  }

  private toProduct(product: ProductRecord) {
    const image = (entry: ProductRecord['images'][number]) => ({
      id: entry.id, url: entry.imageUrl, alt: entry.altText, sortOrder: entry.sortOrder, isPrimary: entry.isPrimary,
    });
    const available = (stock: number, reserved: number) => Math.max(0, stock - reserved) > 0;
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      sku: product.sku,
      basePrice: product.basePrice.toFixed(2),
      salePrice: product.salePrice?.toFixed(2) ?? null,
      status: product.status,
      featured: product.featured,
      bestseller: product.bestseller,
      newArrival: product.newArrival,
      material: product.material,
      weaveOrigin: product.weaveOrigin,
      careInstructions: product.careInstructions,
      details: product.details,
      tags: product.tags,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      images: product.images.map(image),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        colorName: variant.colorName,
        colorCode: variant.colorCode,
        sku: variant.sku,
        priceOverride: variant.priceOverride?.toFixed(2) ?? null,
        isActive: variant.isActive,
        images: variant.images.map(image),
        inStock: product.inventory.length === 0 || variant.inventory.some((entry) => available(entry.stockQuantity, entry.reservedQuantity)),
      })),
      sizes: product.sizes.map((size) => ({
        id: size.id,
        size: size.size,
        sku: size.sku,
        priceOverride: size.priceOverride?.toFixed(2) ?? null,
        isAvailable: size.isAvailable && (product.inventory.length === 0 || size.inventory.some((entry) => available(entry.stockQuantity, entry.reservedQuantity))),
      })),
      inStock: product.inventory.length === 0 || product.inventory.some((entry) => available(entry.stockQuantity, entry.reservedQuantity)),
      categories: product.categories.filter(({ category }) => category.isActive).map(({ category }) => ({ id: category.id, name: category.name, slug: category.slug })),
      collections: product.collections.filter(({ collection }) => collection.isActive).map(({ collection }) => ({ id: collection.id, name: collection.name, slug: collection.slug })),
    };
  }

  private page<T>(data: T[], total: number, page: number, pageSize: number) {
    return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }
}
