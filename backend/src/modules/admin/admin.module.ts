import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminCsrfGuard, AdminOriginGuard, AdminRolesGuard, AdminSessionGuard } from './admin-auth';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminAccountController } from './admin-account.controller';
import { AdminAccountService } from './admin-account.service';

@Module({
  controllers: [AdminAuthController, AdminCatalogController, AdminAccountController],
  providers: [AdminAuthService, AdminCatalogService, AdminAccountService, AdminSessionGuard, AdminCsrfGuard, AdminOriginGuard, AdminRolesGuard],
})
export class AdminModule {}
