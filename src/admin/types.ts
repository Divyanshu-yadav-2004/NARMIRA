export type AdminRole = 'SUPER_ADMIN' | 'CATALOG_ADMIN';
export interface AdminUser { id: string; name: string; email: string; role: AdminRole }
export interface Page<T> { data: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }
export interface Category { id: string; name: string; slug: string; description?: string | null; image?: string | null; isActive: boolean; createdAt: string; updatedAt: string }
export interface Collection extends Category {}
export interface Variant { id: string; name: string; colorName: string; colorCode: string; sku?: string | null; priceOverride?: string | null; isActive: boolean; images?: ProductImage[] }
export interface ProductSize { id: string; size: string; sku?: string | null; priceOverride?: string | null; isAvailable: boolean; sortOrder: number }
export interface ProductImage { id: string; imageUrl: string; altText?: string | null; variantId?: string | null; sortOrder: number; isPrimary: boolean }
export interface Inventory { id: string; productId: string; variantId?: string | null; sizeId?: string | null; stockQuantity: number; reservedQuantity: number; version: number; combinationKey: string }
export interface Product { id: string; name: string; slug: string; description: string; shortDescription?: string | null; sku?: string | null; basePrice: string; salePrice?: string | null; status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'; material?: string | null; weaveOrigin?: string | null; careInstructions?: string | null; details: string[]; tags: string[]; featured: boolean; bestseller: boolean; newArrival: boolean; categories: { category: Category }[]; collections: { collection: Collection }[]; variants: Variant[]; sizes: ProductSize[]; images: ProductImage[]; inventory: Inventory[]; createdAt: string; updatedAt: string }
export interface AuditEntry { id: string; admin: Pick<AdminUser, 'id'|'name'|'email'|'role'>; action: string; entityType: string; entityId: string; requestId?: string | null; metadata?: Record<string, unknown>; createdAt: string }
export interface ResourceInput { name: string; slug: string; description?: string; image?: string }
export interface ProductInput { name: string; slug: string; description: string; shortDescription?: string; sku?: string; basePrice: string; salePrice?: string | null; material?: string; weaveOrigin?: string; careInstructions?: string; details: string[]; tags: string[]; featured: boolean; bestseller: boolean; newArrival: boolean; categoryIds: string[]; collectionIds: string[] }
