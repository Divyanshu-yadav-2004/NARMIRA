import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { CatalogQueryDto, ResourceQueryDto } from './catalog-query.dto';
import { SlugPipe } from './slug.pipe';

describe('Catalog query validation', () => {
  it('accepts bounded pagination, filters, and typed booleans', async () => {
    const query = plainToInstance(CatalogQueryDto, {
      page: '3', pageSize: '40', minPrice: '100.25', maxPrice: '900', featured: 'false', sort: 'price-asc',
    });
    expect(await validate(query)).toHaveLength(0);
    expect(query).toMatchObject({ page: 3, pageSize: 40, minPrice: 100.25, featured: false });
  });

  it.each([
    [{ page: '0' }], [{ page: '10001' }], [{ pageSize: '101' }], [{ search: 'x'.repeat(101) }],
    [{ minPrice: '-1' }], [{ minPrice: '100', maxPrice: '99' }], [{ featured: 'sometimes' }],
    [{ sort: 'random' }],
  ])('rejects invalid product query %j', async (value) => {
    const query = plainToInstance(CatalogQueryDto, value);
    expect(await validate(query)).not.toHaveLength(0);
  });

  it('rejects excessive resource page sizes', async () => {
    const query = plainToInstance(ResourceQueryDto, { page: '2', pageSize: '500' });
    expect(await validate(query)).not.toHaveLength(0);
  });

  it('rejects unknown query parameters using the application validation pipe', async () => {
    const pipe = new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true });
    await expect(pipe.transform({ unexpected: 'filter' }, { type: 'query', metatype: CatalogQueryDto }))
      .rejects.toThrow();
  });

  it('validates URL slugs before database access', () => {
    const pipe = new SlugPipe();
    expect(pipe.transform('heritage-collection')).toBe('heritage-collection');
    expect(() => pipe.transform('../product')).toThrow();
    expect(() => pipe.transform('UPPERCASE')).toThrow();
  });
});
