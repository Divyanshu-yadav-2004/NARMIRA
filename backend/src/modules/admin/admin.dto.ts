import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayUnique, IsArray, IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional,
  IsString, Matches, Max, MaxLength, Min, MinLength, ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(128) password!: string;
}
export class ChangePasswordDto {
  @ApiProperty() @IsString() @MaxLength(128) currentPassword!: string;
  @ApiProperty() @IsString() @MinLength(15) @MaxLength(128) newPassword!: string;
}
export class ProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(180) name!: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(200) slug!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(10000) description!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) shortDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) sku?: string;
  @ApiPropertyOptional({ example: '12500.00' }) @IsOptional() @Matches(/^\d{1,10}(?:\.\d{1,2})?$/) basePrice!: string;
  @ApiPropertyOptional({ example: '10500.00' }) @IsOptional() @Matches(/^\d{1,10}(?:\.\d{1,2})?$/) salePrice?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) material?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) weaveOrigin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(10000) careInstructions?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(40) @ArrayUnique() @IsString({ each: true }) details?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(40) @ArrayUnique() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() featured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() bestseller?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() newArrival?: boolean;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(40) @ArrayUnique() @IsString({ each: true }) categoryIds?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(40) @ArrayUnique() @IsString({ each: true }) collectionIds?: string[];
}
export class VariantDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(80) colorName!: string;
  @ApiPropertyOptional({ example: '#632D35' }) @IsOptional() @Matches(/^#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?$/) colorCode!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) sku?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^\d{1,10}(?:\.\d{1,2})?$/) priceOverride?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
export class SizeDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(40) size!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80) sku?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^\d{1,10}(?:\.\d{1,2})?$/) priceOverride?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAvailable?: boolean;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) sortOrder?: number;
}
export class ImageDto {
  @ApiProperty() @IsString() @MaxLength(2048) imageUrl!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) altText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() variantId?: string | null;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrimary?: boolean;
}
export class StockDto {
  @ApiProperty() @IsOptional() @IsString() variantId?: string | null;
  @ApiProperty() @IsOptional() @IsString() sizeId?: string | null;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(0) @Max(1000000) quantity!: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(0) version!: number;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(500) reason!: string;
}
export class ResourceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(140) slug!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2048) image?: string;
}
export class AdminCreateDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120) name!: string;
  @ApiProperty() @IsEmail() @MaxLength(254) email!: string;
  @ApiProperty() @IsString() @MinLength(15) @MaxLength(128) password!: string;
  @ApiProperty({ enum: ['SUPER_ADMIN', 'CATALOG_ADMIN'] }) @IsEnum(['SUPER_ADMIN', 'CATALOG_ADMIN']) role!: 'SUPER_ADMIN' | 'CATALOG_ADMIN';
}
export class AdminUpdateDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ enum: ['SUPER_ADMIN', 'CATALOG_ADMIN'] }) @IsOptional() @IsEnum(['SUPER_ADMIN', 'CATALOG_ADMIN']) role?: 'SUPER_ADMIN' | 'CATALOG_ADMIN';
}
export class PageDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 50;
}
export class CatalogListDto extends PageDto {
  @ApiPropertyOptional() @IsOptional() @IsEnum(['DRAFT', 'ACTIVE', 'ARCHIVED']) status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
}
export class ResourceUpdateDto extends ResourceDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
