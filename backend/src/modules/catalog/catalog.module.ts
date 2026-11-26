import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CatalogService } from './catalog.service';
import { CategoriesController, CollectionsController, ProductsController } from './catalog.controller';
import { SlugPipe } from './slug.pipe';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductsController, CategoriesController, CollectionsController],
  providers: [CatalogService, SlugPipe],
})
export class CatalogModule {}
