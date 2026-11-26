-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" VARCHAR(500),
    "sku" VARCHAR(80),
    "basePrice" DECIMAL(12,2) NOT NULL,
    "salePrice" DECIMAL(12,2),
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "bestseller" BOOLEAN NOT NULL DEFAULT false,
    "newArrival" BOOLEAN NOT NULL DEFAULT false,
    "material" VARCHAR(160),
    "weaveOrigin" VARCHAR(160),
    "careInstructions" TEXT,
    "details" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(2048),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(2048),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "productId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("productId","categoryId")
);

-- CreateTable
CREATE TABLE "ProductCollection" (
    "productId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("productId","collectionId")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "imageUrl" VARCHAR(2048) NOT NULL,
    "altText" VARCHAR(500),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "colorName" VARCHAR(80) NOT NULL,
    "colorCode" VARCHAR(16) NOT NULL,
    "sku" VARCHAR(80),
    "priceOverride" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" VARCHAR(40) NOT NULL,
    "sku" VARCHAR(80),
    "priceOverride" DECIMAL(12,2),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "sizeId" TEXT,
    "combinationKey" VARCHAR(180) NOT NULL DEFAULT 'default',
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_status_createdAt_idx" ON "Product"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Product_featured_status_idx" ON "Product"("featured", "status");

-- CreateIndex
CREATE INDEX "Product_bestseller_status_idx" ON "Product"("bestseller", "status");

-- CreateIndex
CREATE INDEX "Product_newArrival_status_idx" ON "Product"("newArrival", "status");

-- CreateIndex
CREATE INDEX "Product_material_idx" ON "Product"("material");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_isActive_name_idx" ON "Category"("isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_isActive_name_idx" ON "Collection"("isActive", "name");

-- CreateIndex
CREATE INDEX "ProductCategory_categoryId_productId_idx" ON "ProductCategory"("categoryId", "productId");

-- CreateIndex
CREATE INDEX "ProductCollection_collectionId_productId_idx" ON "ProductCollection"("collectionId", "productId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "ProductImage"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_sortOrder_idx" ON "ProductImage"("variantId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_isActive_idx" ON "ProductVariant"("productId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_colorName_key" ON "ProductVariant"("productId", "colorName");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_id_key" ON "ProductVariant"("productId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_sku_key" ON "ProductSize"("sku");

-- CreateIndex
CREATE INDEX "ProductSize_productId_isAvailable_idx" ON "ProductSize"("productId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_size_key" ON "ProductSize"("productId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_productId_id_key" ON "ProductSize"("productId", "id");

-- CreateIndex
CREATE INDEX "Inventory_productId_variantId_sizeId_idx" ON "Inventory"("productId", "variantId", "sizeId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_combinationKey_key" ON "Inventory"("productId", "combinationKey");

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_variantId_fkey" FOREIGN KEY ("productId", "variantId") REFERENCES "ProductVariant"("productId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_variantId_fkey" FOREIGN KEY ("productId", "variantId") REFERENCES "ProductVariant"("productId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_sizeId_fkey" FOREIGN KEY ("productId", "sizeId") REFERENCES "ProductSize"("productId", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Keep monetary and stock values valid even if future write paths bypass DTO validation.
ALTER TABLE "Product" ADD CONSTRAINT "Product_basePrice_positive_check" CHECK ("basePrice" > 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_salePrice_valid_check" CHECK ("salePrice" IS NULL OR ("salePrice" > 0 AND "salePrice" <= "basePrice"));
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_priceOverride_positive_check" CHECK ("priceOverride" IS NULL OR "priceOverride" > 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_colorCode_hex_check" CHECK ("colorCode" ~ '^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$');
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_priceOverride_positive_check" CHECK ("priceOverride" IS NULL OR "priceOverride" > 0);
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_sortOrder_nonnegative_check" CHECK ("sortOrder" >= 0);
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_quantities_valid_check" CHECK ("stockQuantity" >= 0 AND "reservedQuantity" >= 0 AND "reservedQuantity" <= "stockQuantity");
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_combinationKey_matches_refs_check" CHECK (
  ("variantId" IS NULL AND "sizeId" IS NULL AND "combinationKey" = 'default') OR
  ("combinationKey" = COALESCE("variantId", '-') || ':' || COALESCE("sizeId", '-'))
);
