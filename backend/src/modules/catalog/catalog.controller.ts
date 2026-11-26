import { applyDecorators, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CatalogQueryDto, ResourceQueryDto } from './catalog-query.dto';
import { CatalogService } from './catalog.service';
import { SlugPipe } from './slug.pipe';

const ApiCatalogQuery = () => applyDecorators(
  ApiQuery({ name: 'page', required: false, type: Number, minimum: 1, maximum: 10000 }),
  ApiQuery({ name: 'pageSize', required: false, type: Number, minimum: 1, maximum: 100 }),
  ApiQuery({ name: 'search', required: false, type: String, maxLength: 100 }),
  ApiQuery({ name: 'category', required: false, type: String, maxLength: 140, description: 'Category slug' }),
  ApiQuery({ name: 'collection', required: false, type: String, maxLength: 140, description: 'Collection slug' }),
  ApiQuery({ name: 'color', required: false, type: String, maxLength: 80 }),
  ApiQuery({ name: 'size', required: false, type: String, maxLength: 40 }),
  ApiQuery({ name: 'fabric', required: false, type: String, maxLength: 160 }),
  ApiQuery({ name: 'minPrice', required: false, type: Number, minimum: 0 }),
  ApiQuery({ name: 'maxPrice', required: false, type: Number, minimum: 0 }),
  ApiQuery({ name: 'featured', required: false, type: Boolean }),
  ApiQuery({ name: 'bestseller', required: false, type: Boolean }),
  ApiQuery({ name: 'newArrival', required: false, type: Boolean }),
  ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price-asc', 'price-desc', 'name'] }),
);

const ApiResourceQuery = () => applyDecorators(
  ApiQuery({ name: 'page', required: false, type: Number, minimum: 1, maximum: 10000 }),
  ApiQuery({ name: 'pageSize', required: false, type: Number, minimum: 1, maximum: 100 }),
);

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('featured')
  @ApiOperation({ summary: 'List active featured products' })
  @ApiCatalogQuery()
  featured(@Query() query: CatalogQueryDto) { return this.catalog.listProducts(query, { featured: true }); }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'List active new arrivals' })
  @ApiCatalogQuery()
  newArrivals(@Query() query: CatalogQueryDto) { return this.catalog.listProducts(query, { newArrival: true }); }

  @Get('bestsellers')
  @ApiOperation({ summary: 'List active bestsellers' })
  @ApiCatalogQuery()
  bestsellers(@Query() query: CatalogQueryDto) { return this.catalog.listProducts(query, { bestseller: true }); }

  @Get()
  @ApiOperation({ summary: 'Browse active products with filters and pagination' })
  @ApiCatalogQuery()
  list(@Query() query: CatalogQueryDto) { return this.catalog.listProducts(query); }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an active product by slug' })
  @ApiParam({ name: 'slug' })
  detail(@Param('slug', SlugPipe) slug: string) { return this.catalog.getProduct(slug); }
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List active categories' })
  @ApiResourceQuery()
  list(@Query() query: ResourceQueryDto) { return this.catalog.listCategories(query); }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an active category and paginated active products' })
  @ApiResourceQuery()
  @ApiParam({ name: 'slug' })
  detail(@Param('slug', SlugPipe) slug: string, @Query() query: ResourceQueryDto) {
    return this.catalog.getCategory(slug, query);
  }
}

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List active collections' })
  @ApiResourceQuery()
  list(@Query() query: ResourceQueryDto) { return this.catalog.listCollections(query); }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an active collection and paginated active products' })
  @ApiResourceQuery()
  @ApiParam({ name: 'slug' })
  detail(@Param('slug', SlugPipe) slug: string, @Query() query: ResourceQueryDto) {
    return this.catalog.getCollection(slug, query);
  }
}
