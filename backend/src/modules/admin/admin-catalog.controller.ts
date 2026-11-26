import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminCsrfGuard, AdminOriginGuard, AdminRolesGuard, AdminSessionGuard, CurrentAdmin, Roles, type AdminIdentity } from './admin-auth';
import { AdminCatalogService } from './admin-catalog.service';
import { CatalogListDto, ImageDto, ProductDto, ResourceDto, ResourceUpdateDto, SizeDto, StockDto, VariantDto } from './admin.dto';

type AdminRequest = Request & { requestId?: string };
const roles = Roles('SUPER_ADMIN', 'CATALOG_ADMIN');

@ApiTags('Admin Catalog')
@Controller('admin')
@UseGuards(AdminSessionGuard, AdminRolesGuard)
@roles
export class AdminCatalogController {
  constructor(private readonly catalog: AdminCatalogService) {}

  @Get('products') @ApiOperation({ summary: 'List products in all lifecycle states' })
  listProducts(@Query() query: CatalogListDto) { return this.catalog.listProducts(query); }
  @Get('products/:idOrSlug') @ApiOperation({ summary: 'Get a product by ID or slug' })
  getProduct(@Param('idOrSlug') key: string) { return this.catalog.getProduct(key); }
  @Post('products') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Create a product as a draft' })
  createProduct(@CurrentAdmin() admin: AdminIdentity, @Body() dto: ProductDto, @Req() req: AdminRequest) { return this.catalog.createProduct(admin, dto, req); }
  @Patch('products/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Update product information and relationships' })
  updateProduct(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Body() dto: ProductDto, @Req() req: AdminRequest) { return this.catalog.updateProduct(admin, id, dto, req); }
  @Post('products/:id/publish') @Roles('SUPER_ADMIN') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Validate and publish a product' })
  publishProduct(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.publishProduct(admin, id, req); }
  @Post('products/:id/unpublish') @Roles('SUPER_ADMIN') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Unpublish a product to draft' })
  unpublishProduct(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.unpublishProduct(admin, id, req); }
  @Post('products/:id/archive') @Roles('SUPER_ADMIN') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Archive a product' })
  archiveProduct(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.archiveProduct(admin, id, req); }
  @Post('products/:id/restore') @Roles('SUPER_ADMIN') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Restore an archived product to draft' })
  restoreProduct(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.restoreProduct(admin, id, req); }

  @Post('products/:productId/variants') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Add a color variant' })
  createVariant(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Body() dto: VariantDto, @Req() req: AdminRequest) { return this.catalog.createVariant(admin, productId, dto, req); }
  @Patch('products/:productId/variants/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  updateVariant(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Param('id') id: string, @Body() dto: VariantDto, @Req() req: AdminRequest) { return this.catalog.updateVariant(admin, productId, id, dto, req); }
  @Delete('products/:productId/variants/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  deactivateVariant(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.deactivateVariant(admin, productId, id, req); }

  @Post('products/:productId/sizes') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Add a product size' })
  createSize(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Body() dto: SizeDto, @Req() req: AdminRequest) { return this.catalog.createSize(admin, productId, dto, req); }
  @Patch('products/:productId/sizes/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  updateSize(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Param('id') id: string, @Body() dto: SizeDto, @Req() req: AdminRequest) { return this.catalog.updateSize(admin, productId, id, dto, req); }
  @Delete('products/:productId/sizes/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  deactivateSize(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.updateSize(admin, productId, id, { isAvailable: false } as SizeDto, req); }

  @Post('products/:productId/images') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Add a validated product image reference' })
  createImage(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Body() dto: ImageDto, @Req() req: AdminRequest) { return this.catalog.createImage(admin, productId, dto, req); }
  @Patch('products/:productId/images/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  updateImage(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Param('id') id: string, @Body() dto: ImageDto, @Req() req: AdminRequest) { return this.catalog.updateImage(admin, productId, id, dto, req); }
  @Delete('products/:productId/images/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  deleteImage(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.deleteImage(admin, productId, id, req); }

  @Post('products/:productId/inventory') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Set stock with optimistic version and an audit movement record' })
  setInventory(@CurrentAdmin() admin: AdminIdentity, @Param('productId') productId: string, @Body() dto: StockDto, @Req() req: AdminRequest) { return this.catalog.setInventory(admin, productId, dto, req); }

  @Get('categories') @ApiOperation({ summary: 'List categories including deactivated records' })
  listCategories(@Query() query: CatalogListDto) { return this.catalog.listResources('category', query); }
  @Get('categories/:id') getCategory(@Param('id') id: string) { return this.catalog.getResource('category', id); }
  @Post('categories') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  createCategory(@CurrentAdmin() admin: AdminIdentity, @Body() dto: ResourceDto, @Req() req: AdminRequest) { return this.catalog.createResource(admin, 'category', dto, req); }
  @Patch('categories/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  updateCategory(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Body() dto: ResourceUpdateDto, @Req() req: AdminRequest) { return this.catalog.updateResource(admin, 'category', id, dto, req); }
  @Delete('categories/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  deactivateCategory(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.deleteResource(admin, 'category', id, req); }

  @Get('collections') @ApiOperation({ summary: 'List collections including deactivated records' })
  listCollections(@Query() query: CatalogListDto) { return this.catalog.listResources('collection', query); }
  @Get('collections/:id') getCollection(@Param('id') id: string) { return this.catalog.getResource('collection', id); }
  @Post('collections') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  createCollection(@CurrentAdmin() admin: AdminIdentity, @Body() dto: ResourceDto, @Req() req: AdminRequest) { return this.catalog.createResource(admin, 'collection', dto, req); }
  @Patch('collections/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  updateCollection(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Body() dto: ResourceUpdateDto, @Req() req: AdminRequest) { return this.catalog.updateResource(admin, 'collection', id, dto, req); }
  @Delete('collections/:id') @UseGuards(AdminOriginGuard, AdminCsrfGuard)
  deactivateCollection(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Req() req: AdminRequest) { return this.catalog.deleteResource(admin, 'collection', id, req); }
}
