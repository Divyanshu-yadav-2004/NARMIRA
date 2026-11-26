import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminCsrfGuard, AdminOriginGuard, AdminRolesGuard, AdminSessionGuard, CurrentAdmin, Roles, type AdminIdentity } from './admin-auth';
import { AdminAccountService } from './admin-account.service';
import { AdminCreateDto, AdminUpdateDto, PageDto } from './admin.dto';

type AdminRequest = Request & { requestId?: string };
@ApiTags('Admin Accounts and Audit')
@Controller('admin')
@UseGuards(AdminSessionGuard, AdminRolesGuard)
export class AdminAccountController {
  constructor(private readonly accounts: AdminAccountService) {}

  @Get('administrators') @Roles('SUPER_ADMIN') @ApiOperation({ summary: 'List administrator accounts; super administrator only' })
  list(@Query() query: PageDto) { return this.accounts.list(query); }
  @Post('administrators') @Roles('SUPER_ADMIN') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Create an administrator; super administrator only' })
  create(@CurrentAdmin() admin: AdminIdentity, @Body() dto: AdminCreateDto, @Req() req: AdminRequest) { return this.accounts.create(admin, dto, req.requestId); }
  @Patch('administrators/:id') @Roles('SUPER_ADMIN') @UseGuards(AdminOriginGuard, AdminCsrfGuard) @ApiOperation({ summary: 'Update administrator role or active status' })
  update(@CurrentAdmin() admin: AdminIdentity, @Param('id') id: string, @Body() dto: AdminUpdateDto, @Req() req: AdminRequest) { return this.accounts.update(admin, id, dto, req.requestId); }
  @Get('audit-logs') @Roles('SUPER_ADMIN') @ApiOperation({ summary: 'Read append-only administrative audit history' })
  auditLogs(@Query() query: PageDto) { return this.accounts.auditLogs(query); }
}
