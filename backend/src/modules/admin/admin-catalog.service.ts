import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '../../database/generated/client';
import { PrismaService } from '../../database/prisma.service';
import type { AdminIdentity } from './admin-auth';
import type { CatalogListDto, ImageDto, ProductDto, ResourceDto, SizeDto, StockDto, VariantDto } from './admin.dto';
import { requestIdFrom, validImageReference, validSlug } from './security';

const productInclude = {
  categories: { include: { category: true } }, collections: { include: { collection: true } },
  variants: { include: { images: { orderBy: { sortOrder: 'asc' as const } } } },
  sizes: { orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }] },
  images: { orderBy: { sortOrder: 'asc' as const } }, inventory: true,
} satisfies Prisma.ProductInclude;

type RequestMeta = { requestId?: string };
const cleanOptional = (value: string | null | undefined) => value?.trim() || null;
const decimal = (value: string | null | undefined) => value == null || value === '' ? null : new Prisma.Decimal(value);

@Injectable()
export class AdminCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async listProducts(query: CatalogListDto) {
    const where: Prisma.ProductWhereInput = query.status ? { status: query.status } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: productInclude, orderBy: { updatedAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.product.count({ where }),
    ]);
    return { data, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }

  async getProduct(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }, include: productInclude });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(admin: AdminIdentity, dto: ProductDto, meta: RequestMeta) {
    if (!dto.name?.trim() || !dto.slug || !dto.description?.trim() || !dto.basePrice) throw new UnprocessableEntityException('Name, slug, description and base price are required');
    this.validateProductPrice(dto.basePrice, dto.salePrice);
    this.requireSlug(dto.slug);
    await this.validateRelations(dto.categoryIds ?? [], dto.collectionIds ?? []);
    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: {
        name: dto.name!.trim(), slug: dto.slug!, description: dto.description!.trim(), shortDescription: cleanOptional(dto.shortDescription),
        sku: cleanOptional(dto.sku)?.toUpperCase() ?? null, basePrice: new Prisma.Decimal(dto.basePrice), salePrice: decimal(dto.salePrice),
        status: 'DRAFT', material: cleanOptional(dto.material), weaveOrigin: cleanOptional(dto.weaveOrigin), careInstructions: cleanOptional(dto.careInstructions),
        details: dto.details?.map((value) => value.trim()).filter(Boolean) ?? [], tags: dto.tags?.map((value) => value.trim()).filter(Boolean) ?? [],
        featured: dto.featured ?? false, bestseller: dto.bestseller ?? false, newArrival: dto.newArrival ?? false,
        categories: { create: (dto.categoryIds ?? []).map((categoryId) => ({ categoryId })) },
        collections: { create: (dto.collectionIds ?? []).map((collectionId) => ({ collectionId })) },
      } });
      await this.audit(tx, admin.id, 'PRODUCT_CREATED', 'PRODUCT', created.id, meta);
      return created;
    });
    return this.getProduct(product.id);
  }

  async updateProduct(admin: AdminIdentity, id: string, dto: ProductDto, meta: RequestMeta) {
    const existing = await this.getProduct(id);
    const basePrice = dto.basePrice ?? existing.basePrice.toFixed(2);
    const salePrice = dto.salePrice === undefined ? existing.salePrice?.toFixed(2) ?? null : dto.salePrice;
    this.validateProductPrice(basePrice, salePrice);
    if (dto.slug) this.requireSlug(dto.slug);
    if (dto.categoryIds !== undefined || dto.collectionIds !== undefined) {
      await this.validateRelations(dto.categoryIds ?? [], dto.collectionIds ?? []);
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: existing.id }, data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}), ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}), ...(dto.shortDescription !== undefined ? { shortDescription: cleanOptional(dto.shortDescription) } : {}),
        ...(dto.sku !== undefined ? { sku: cleanOptional(dto.sku)?.toUpperCase() ?? null } : {}),
        ...(dto.basePrice !== undefined ? { basePrice: new Prisma.Decimal(dto.basePrice) } : {}),
        ...(dto.salePrice !== undefined ? { salePrice: decimal(dto.salePrice) } : {}),
        ...(dto.material !== undefined ? { material: cleanOptional(dto.material) } : {}), ...(dto.weaveOrigin !== undefined ? { weaveOrigin: cleanOptional(dto.weaveOrigin) } : {}),
        ...(dto.careInstructions !== undefined ? { careInstructions: cleanOptional(dto.careInstructions) } : {}),
        ...(dto.details !== undefined ? { details: dto.details.map((value) => value.trim()).filter(Boolean) } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags.map((value) => value.trim()).filter(Boolean) } : {}),
        ...(dto.featured !== undefined ? { featured: dto.featured } : {}), ...(dto.bestseller !== undefined ? { bestseller: dto.bestseller } : {}), ...(dto.newArrival !== undefined ? { newArrival: dto.newArrival } : {}),
        ...(dto.categoryIds !== undefined ? { categories: { deleteMany: {}, create: dto.categoryIds.map((categoryId) => ({ categoryId })) } } : {}),
        ...(dto.collectionIds !== undefined ? { collections: { deleteMany: {}, create: dto.collectionIds.map((collectionId) => ({ collectionId })) } } : {}),
      } });
      await this.audit(tx, admin.id, 'PRODUCT_UPDATED', 'PRODUCT', existing.id, meta);
    });
    return this.getProduct(existing.id);
  }

  async archiveProduct(admin: AdminIdentity, id: string, meta: RequestMeta) { return this.setStatus(admin, id, 'ARCHIVED', 'PRODUCT_ARCHIVED', meta); }
  async unpublishProduct(admin: AdminIdentity, id: string, meta: RequestMeta) { return this.setStatus(admin, id, 'DRAFT', 'PRODUCT_UNPUBLISHED', meta); }
  async restoreProduct(admin: AdminIdentity, id: string, meta: RequestMeta) { return this.setStatus(admin, id, 'DRAFT', 'PRODUCT_RESTORED', meta); }

  async publishProduct(admin: AdminIdentity, id: string, meta: RequestMeta) {
    await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id }, include: productInclude });
      if (!product) throw new NotFoundException('Product not found');
      const issues: string[] = [];
      if (!product.name.trim()) issues.push('A product name is required');
      if (!validSlug(product.slug)) issues.push('A valid product slug is required');
      if (!product.basePrice.isFinite() || !product.basePrice.gt(0)) issues.push('A positive base price is required');
      if (product.salePrice && (!product.salePrice.gt(0) || product.salePrice.gt(product.basePrice))) issues.push('Sale price must be positive and no greater than base price');
      if (product.categories.length === 0 || product.categories.every(({ category }) => !category.isActive)) issues.push('At least one active category is required');
      if (product.images.length === 0) issues.push('At least one product image is required');
      if (product.images.some((image) => !validImageReference(image.imageUrl))) issues.push('All product image references must be safe HTTPS URLs or approved local references');
      const activeVariants = product.variants.filter((variant) => variant.isActive);
      if (product.variants.length && activeVariants.length === 0) issues.push('At least one active color variant is required');
      if (product.sizes.length && !product.sizes.some((size) => size.isAvailable)) issues.push('At least one available size is required');
      const validVariants = activeVariants.length ? activeVariants : [null];
      const validSizes = product.sizes.filter((size) => size.isAvailable);
      const sizes = validSizes.length ? validSizes : [null];
      for (const variant of validVariants) for (const size of sizes) {
        const key = variant || size ? `${variant?.id ?? '-'}:${size?.id ?? '-'}` : 'default';
        if (!product.inventory.some((row) => row.combinationKey === key)) issues.push(`Missing inventory record for ${variant?.colorName ?? 'default color'} / ${size?.size ?? 'default size'}`);
      }
      if (issues.length) throw new UnprocessableEntityException({ message: 'Product cannot be published', issues });
      await tx.product.update({ where: { id }, data: { status: 'ACTIVE' } });
      await this.audit(tx, admin.id, 'PRODUCT_PUBLISHED', 'PRODUCT', id, meta, { status: 'ACTIVE' });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return this.getProduct(id);
  }

  async createVariant(admin: AdminIdentity, productId: string, dto: VariantDto, meta: RequestMeta) {
    if (!dto.name?.trim() || !dto.colorName?.trim() || !dto.colorCode) throw new UnprocessableEntityException('Variant name, color name and color code are required');
    await this.getProduct(productId);
    if (await this.prisma.productVariant.count({ where: { productId } }) >= 32) throw new UnprocessableEntityException('A product can have at most 32 color variants');
    this.validateOptionalPrice(dto.priceOverride);
    const variant = await this.prisma.$transaction(async (tx) => {
      const created = await tx.productVariant.create({ data: {
        productId, name: dto.name.trim(), colorName: dto.colorName.trim(), colorCode: dto.colorCode.toUpperCase(), sku: cleanOptional(dto.sku)?.toUpperCase() ?? null,
        priceOverride: decimal(dto.priceOverride), isActive: dto.isActive ?? true,
      } });
      await this.audit(tx, admin.id, 'VARIANT_CREATED', 'PRODUCT_VARIANT', created.id, meta);
      return created;
    });
    return variant;
  }

  async updateVariant(admin: AdminIdentity, productId: string, id: string, dto: VariantDto, meta: RequestMeta) {
    await this.requireOwned('productVariant', productId, id);
    this.validateOptionalPrice(dto.priceOverride);
    await this.prisma.$transaction(async (tx) => {
      await tx.productVariant.update({ where: { id }, data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}), ...(dto.colorName !== undefined ? { colorName: dto.colorName.trim() } : {}),
        ...(dto.colorCode !== undefined ? { colorCode: dto.colorCode.toUpperCase() } : {}), ...(dto.sku !== undefined ? { sku: cleanOptional(dto.sku)?.toUpperCase() ?? null } : {}),
        ...(dto.priceOverride !== undefined ? { priceOverride: decimal(dto.priceOverride) } : {}), ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      } });
      await this.audit(tx, admin.id, 'VARIANT_UPDATED', 'PRODUCT_VARIANT', id, meta);
    });
    return this.prisma.productVariant.findUnique({ where: { id }, include: { images: true } });
  }

  async deactivateVariant(admin: AdminIdentity, productId: string, id: string, meta: RequestMeta) {
    await this.updateVariant(admin, productId, id, { isActive: false } as VariantDto, meta);
    return { success: true };
  }

  async createSize(admin: AdminIdentity, productId: string, dto: SizeDto, meta: RequestMeta) {
    if (!dto.size?.trim()) throw new UnprocessableEntityException('A size label is required');
    await this.getProduct(productId);
    if (await this.prisma.productSize.count({ where: { productId } }) >= 20) throw new UnprocessableEntityException('A product can have at most 20 sizes');
    this.validateOptionalPrice(dto.priceOverride);
    const size = await this.prisma.$transaction(async (tx) => {
      const created = await tx.productSize.create({ data: {
        productId, size: dto.size.trim(), sku: cleanOptional(dto.sku)?.toUpperCase() ?? null, priceOverride: decimal(dto.priceOverride),
        isAvailable: dto.isAvailable ?? true, sortOrder: dto.sortOrder ?? 0,
      } });
      await this.audit(tx, admin.id, 'SIZE_CREATED', 'PRODUCT_SIZE', created.id, meta);
      return created;
    });
    return size;
  }

  async updateSize(admin: AdminIdentity, productId: string, id: string, dto: SizeDto, meta: RequestMeta) {
    await this.requireOwned('productSize', productId, id);
    this.validateOptionalPrice(dto.priceOverride);
    await this.prisma.$transaction(async (tx) => {
      await tx.productSize.update({ where: { id }, data: {
        ...(dto.size !== undefined ? { size: dto.size.trim() } : {}), ...(dto.sku !== undefined ? { sku: cleanOptional(dto.sku)?.toUpperCase() ?? null } : {}),
        ...(dto.priceOverride !== undefined ? { priceOverride: decimal(dto.priceOverride) } : {}), ...(dto.isAvailable !== undefined ? { isAvailable: dto.isAvailable } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
      } });
      await this.audit(tx, admin.id, 'SIZE_UPDATED', 'PRODUCT_SIZE', id, meta);
    });
    return this.prisma.productSize.findUnique({ where: { id } });
  }

  async createImage(admin: AdminIdentity, productId: string, dto: ImageDto, meta: RequestMeta) {
    if (!validImageReference(dto.imageUrl)) throw new UnprocessableEntityException('Image must be an HTTPS URL or a path under /images or /assets');
    await this.getProduct(productId);
    if (dto.variantId) await this.requireOwned('productVariant', productId, dto.variantId);
    return this.prisma.$transaction(async (tx) => {
      const count = await tx.productImage.count({ where: { productId, variantId: dto.variantId ?? null } });
      if (count >= (dto.variantId ? 12 : 24)) throw new UnprocessableEntityException('Image gallery maximum reached');
      if (dto.isPrimary) await tx.productImage.updateMany({ where: { productId, variantId: dto.variantId ?? null }, data: { isPrimary: false } });
      const image = await tx.productImage.create({ data: {
        productId, variantId: dto.variantId ?? null, imageUrl: dto.imageUrl, altText: cleanOptional(dto.altText),
        sortOrder: dto.sortOrder ?? count, isPrimary: dto.isPrimary ?? count === 0,
      } });
      await this.audit(tx, admin.id, 'PRODUCT_IMAGE_CREATED', 'PRODUCT_IMAGE', image.id, meta);
      return image;
    });
  }

  async updateImage(admin: AdminIdentity, productId: string, id: string, dto: ImageDto, meta: RequestMeta) {
    const image = await this.prisma.productImage.findFirst({ where: { id, productId } });
    if (!image) throw new NotFoundException('Image not found');
    if (dto.imageUrl !== undefined && !validImageReference(dto.imageUrl)) throw new UnprocessableEntityException('Image must be an HTTPS URL or a path under /images or /assets');
    if (dto.variantId !== undefined && dto.variantId !== null) await this.requireOwned('productVariant', productId, dto.variantId);
    const galleryVariantId = dto.variantId === undefined ? image.variantId : dto.variantId;
    return this.prisma.$transaction(async (tx) => {
      if (dto.isPrimary) await tx.productImage.updateMany({ where: { productId, variantId: galleryVariantId, NOT: { id } }, data: { isPrimary: false } });
      const updated = await tx.productImage.update({ where: { id }, data: {
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}), ...(dto.altText !== undefined ? { altText: cleanOptional(dto.altText) } : {}),
        ...(dto.variantId !== undefined ? { variantId: dto.variantId } : {}), ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}), ...(dto.isPrimary !== undefined ? { isPrimary: dto.isPrimary } : {}),
      } });
      await this.audit(tx, admin.id, 'PRODUCT_IMAGE_UPDATED', 'PRODUCT_IMAGE', id, meta);
      return updated;
    });
  }

  async deleteImage(admin: AdminIdentity, productId: string, id: string, meta: RequestMeta) {
    await this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findFirst({ where: { id, productId } });
      if (!image) throw new NotFoundException('Image not found');
      await tx.productImage.delete({ where: { id } });
      await this.audit(tx, admin.id, 'PRODUCT_IMAGE_DELETED', 'PRODUCT_IMAGE', id, meta);
    });
    return { success: true };
  }

  async setInventory(admin: AdminIdentity, productId: string, dto: StockDto, meta: RequestMeta) {
    const product = await this.getProduct(productId);
    if (dto.variantId) await this.requireOwned('productVariant', product.id, dto.variantId);
    if (dto.sizeId) await this.requireOwned('productSize', product.id, dto.sizeId);
    const combinationKey = dto.variantId || dto.sizeId ? `${dto.variantId ?? '-'}:${dto.sizeId ?? '-'}` : 'default';
    return this.prisma.$transaction(async (tx) => {
      let current = await tx.inventory.findUnique({ where: { productId_combinationKey: { productId, combinationKey } } });
      if (!current) {
        if (dto.version !== 0) throw new ConflictException('Inventory changed; reload and retry');
        try {
          current = await tx.inventory.create({ data: { productId, variantId: dto.variantId ?? null, sizeId: dto.sizeId ?? null, combinationKey, stockQuantity: 0, version: 0 } });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Inventory changed; reload and retry');
          throw error;
        }
      }
      if (current.version !== dto.version) throw new ConflictException('Inventory changed; reload and retry');
      if (dto.quantity < current.reservedQuantity) throw new UnprocessableEntityException('Stock cannot be lower than already reserved quantity');
      const changed = await tx.inventory.updateMany({
        where: { id: current.id, version: dto.version }, data: { stockQuantity: dto.quantity, version: { increment: 1 } },
      });
      if (changed.count !== 1) throw new ConflictException('Inventory changed; reload and retry');
      const movement = await tx.inventoryAdjustment.create({ data: {
        inventoryId: current.id, productId, variantId: current.variantId, sizeId: current.sizeId, adminId: admin.id,
        previousQuantity: current.stockQuantity, newQuantity: dto.quantity, deltaQuantity: dto.quantity - current.stockQuantity, reason: dto.reason.trim(),
      } });
      await this.audit(tx, admin.id, 'INVENTORY_ADJUSTED', 'INVENTORY', current.id, meta, { adjustmentId: movement.id, previousQuantity: current.stockQuantity, newQuantity: dto.quantity, deltaQuantity: movement.deltaQuantity });
      return { ...movement, version: current.version + 1 };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async listResources(kind: 'category' | 'collection', query: CatalogListDto) {
    const [data, total] = kind === 'category'
      ? await this.prisma.$transaction([
        this.prisma.category.findMany({ orderBy: { updatedAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
        this.prisma.category.count(),
      ])
      : await this.prisma.$transaction([
        this.prisma.collection.findMany({ orderBy: { updatedAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
        this.prisma.collection.count(),
      ]);
    return { data, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }

  async getResource(kind: 'category' | 'collection', id: string) {
    const resource = kind === 'category'
      ? await this.prisma.category.findUnique({ where: { id } })
      : await this.prisma.collection.findUnique({ where: { id } });
    if (!resource) throw new NotFoundException(`${kind === 'category' ? 'Category' : 'Collection'} not found`);
    return resource;
  }

  async createResource(admin: AdminIdentity, kind: 'category' | 'collection', dto: ResourceDto, meta: RequestMeta) {
    if (!dto.name?.trim() || !dto.slug) throw new UnprocessableEntityException('Name and slug are required');
    this.requireSlug(dto.slug!, 140);
    if (dto.image && !validImageReference(dto.image)) throw new UnprocessableEntityException('Image must be an HTTPS URL or a path under /images or /assets');
    const data = { name: dto.name!.trim(), slug: dto.slug!, description: cleanOptional(dto.description), image: cleanOptional(dto.image) };
    return this.prisma.$transaction(async (tx) => {
      const created = kind === 'category' ? await tx.category.create({ data }) : await tx.collection.create({ data });
      await this.audit(tx, admin.id, `${kind.toUpperCase()}_CREATED`, kind.toUpperCase(), created.id, meta);
      return created;
    });
  }

  async updateResource(admin: AdminIdentity, kind: 'category' | 'collection', id: string, dto: ResourceDto & { isActive?: boolean }, meta: RequestMeta) {
    if (dto.slug) this.requireSlug(dto.slug, 140);
    if (dto.image && !validImageReference(dto.image)) throw new UnprocessableEntityException('Image must be an HTTPS URL or a path under /images or /assets');
    const update = {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}), ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
      ...(dto.description !== undefined ? { description: cleanOptional(dto.description) } : {}), ...(dto.image !== undefined ? { image: cleanOptional(dto.image) } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };
    return this.prisma.$transaction(async (tx) => {
      const updated = kind === 'category'
        ? await tx.category.update({ where: { id }, data: update })
        : await tx.collection.update({ where: { id }, data: update });
      await this.audit(tx, admin.id, `${kind.toUpperCase()}_UPDATED`, kind.toUpperCase(), id, meta, { isActive: dto.isActive });
      return updated;
    });
  }

  async deleteResource(admin: AdminIdentity, kind: 'category' | 'collection', id: string, meta: RequestMeta) {
    return this.prisma.$transaction(async (tx) => {
      const resource = kind === 'category'
        ? await tx.category.update({ where: { id }, data: { isActive: false } })
        : await tx.collection.update({ where: { id }, data: { isActive: false } });
      await this.audit(tx, admin.id, `${kind.toUpperCase()}_DEACTIVATED`, kind.toUpperCase(), id, meta);
      return resource;
    });
  }

  private async setStatus(admin: AdminIdentity, id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED', action: string, meta: RequestMeta) {
    const existing = await this.getProduct(id);
    await this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: existing.id }, data: { status } });
      await this.audit(tx, admin.id, action, 'PRODUCT', id, meta, { status });
    });
    return this.getProduct(existing.id);
  }

  private async validateRelations(categoryIds: string[], collectionIds: string[]) {
    const [categories, collections] = await Promise.all([
      categoryIds.length ? this.prisma.category.findMany({ where: { id: { in: categoryIds }, isActive: true }, select: { id: true } }) : [],
      collectionIds.length ? this.prisma.collection.findMany({ where: { id: { in: collectionIds }, isActive: true }, select: { id: true } }) : [],
    ]);
    if (categories.length !== new Set(categoryIds).size) throw new UnprocessableEntityException('One or more category IDs are invalid or inactive');
    if (collections.length !== new Set(collectionIds).size) throw new UnprocessableEntityException('One or more collection IDs are invalid or inactive');
  }

  private async requireOwned(model: 'productVariant' | 'productSize', productId: string, id: string) {
    const record = model === 'productVariant'
      ? await this.prisma.productVariant.findFirst({ where: { id, productId }, select: { id: true } })
      : await this.prisma.productSize.findFirst({ where: { id, productId }, select: { id: true } });
    if (!record) throw new NotFoundException('Catalog relationship not found');
  }

  private validateProductPrice(base: string, sale?: string | null) {
    const basePrice = new Prisma.Decimal(base);
    const salePrice = decimal(sale);
    if (!basePrice.gt(0)) throw new UnprocessableEntityException('Base price must be greater than zero');
    if (salePrice && (!salePrice.gt(0) || salePrice.gt(basePrice))) throw new UnprocessableEntityException('Sale price must be positive and no greater than base price');
  }

  private validateOptionalPrice(value?: string | null) {
    if (value !== undefined && value !== null && value !== '' && !new Prisma.Decimal(value).gt(0)) throw new UnprocessableEntityException('Price override must be greater than zero');
  }

  private requireSlug(slug: string, max = 200) {
    if (slug.length > max || !validSlug(slug)) throw new UnprocessableEntityException('Slug must use lowercase letters, numbers and hyphens');
  }

  private async audit(tx: Prisma.TransactionClient, adminId: string, action: string, entityType: string, entityId: string, meta: RequestMeta, metadata: Prisma.InputJsonValue = {}) {
    await tx.auditLog.create({ data: { adminId, action, entityType, entityId, requestId: requestIdFrom(meta), metadata } });
  }

}
