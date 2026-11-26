import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, Validate,
  ValidatorConstraint, type ValidationArguments, type ValidatorConstraintInterface,
} from 'class-validator';

export const PRODUCT_SORTS = ['newest', 'price-asc', 'price-desc', 'name'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

@ValidatorConstraint({ name: 'paginationOffsetLimit', async: false })
class PaginationOffsetLimit implements ValidatorConstraintInterface {
  validate(page: number | undefined, args: ValidationArguments) {
    const params = args.object as { pageSize?: number };
    return page === undefined || params.pageSize === undefined || (page - 1) * params.pageSize <= 100000;
  }
  defaultMessage() { return 'Requested page is too deep; pagination offset cannot exceed 100000'; }
}

@ValidatorConstraint({ name: 'maxPriceAtLeastMinPrice', async: false })
class MaxPriceAtLeastMinPrice implements ValidatorConstraintInterface {
  validate(maxPrice: number | undefined, args: ValidationArguments) {
    const minPrice = (args.object as CatalogQueryDto).minPrice;
    return maxPrice === undefined || minPrice === undefined || maxPrice >= minPrice;
  }
  defaultMessage() { return 'maxPrice must be greater than or equal to minPrice'; }
}

export class CatalogQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 10000, default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10000) @Validate(PaginationOffsetLimit)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 24 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize = 24;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional() @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString() @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ maxLength: 140, description: 'Category slug' })
  @IsOptional() @IsString() @MaxLength(140)
  category?: string;

  @ApiPropertyOptional({ maxLength: 140, description: 'Collection slug' })
  @IsOptional() @IsString() @MaxLength(140)
  collection?: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional() @IsString() @MaxLength(80)
  color?: string;

  @ApiPropertyOptional({ maxLength: 40 })
  @IsOptional() @IsString() @MaxLength(40)
  size?: string;

  @ApiPropertyOptional({ maxLength: 160 })
  @IsOptional() @IsString() @MaxLength(160)
  fabric?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 10000000 })
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(10000000)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 10000000 })
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(10000000) @Validate(MaxPriceAtLeastMinPrice)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional() @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value) @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value) @IsBoolean()
  bestseller?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value) @IsBoolean()
  newArrival?: boolean;

  @ApiPropertyOptional({ enum: PRODUCT_SORTS, default: 'newest' })
  @IsOptional() @IsIn(PRODUCT_SORTS)
  sort: ProductSort = 'newest';
}

export class ResourceQueryDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 10000, default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10000) @Validate(PaginationOffsetLimit)
  page = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 24 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  pageSize = 24;
}
