import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AdminCsrfGuard, AdminOriginGuard, AdminSessionGuard, AdminSession, CurrentAdmin, ADMIN_COOKIE, clearAdminCookie, type AdminIdentity } from './admin-auth';
import { AdminAuthService } from './admin-auth.service';
import { ChangePasswordDto, LoginDto } from './admin.dto';

type AdminRequest = Request & { requestId?: string };

@ApiTags('Admin Authentication')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService, private readonly config: ConfigService) {}

  @Post('login') @HttpCode(200) @Throttle({ default: { limit: 5, ttl: 60_000 } }) @UseGuards(AdminOriginGuard)
  @ApiOperation({ summary: 'Sign in to the admin API; returns a CSRF token and sets an HttpOnly session cookie' })
  async login(@Body() body: LoginDto, @Req() request: AdminRequest, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(body.email, body.password, request.requestId);
    response.cookie(ADMIN_COOKIE, result.rawToken, this.auth.cookieOptions());
    return { admin: result.admin, csrfToken: result.csrfToken, expiresAt: result.expiresAt };
  }

  @Get('me') @UseGuards(AdminSessionGuard)
  @ApiOperation({ summary: 'Get the current administrator profile' })
  me(@CurrentAdmin() admin: AdminIdentity) { return { admin }; }

  @Post('csrf') @HttpCode(200) @UseGuards(AdminOriginGuard, AdminSessionGuard)
  @ApiOperation({ summary: 'Rotate and return the session CSRF token after page reload' })
  async csrf(@AdminSession() session: { id: string }) { return { csrfToken: await this.auth.rotateCsrf(session.id) }; }

  @Post('logout') @HttpCode(200) @UseGuards(AdminOriginGuard, AdminSessionGuard, AdminCsrfGuard)
  @ApiOperation({ summary: 'Revoke the current admin session' })
  async logout(@CurrentAdmin() admin: AdminIdentity, @AdminSession() session: { id: string }, @Req() request: AdminRequest, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(admin.id, session.id, request.requestId);
    clearAdminCookie(response, this.config.get('NODE_ENV') === 'production', this.auth.cookiePath());
    return { success: true };
  }

  @Post('change-password') @HttpCode(200) @UseGuards(AdminOriginGuard, AdminSessionGuard, AdminCsrfGuard)
  @ApiOperation({ summary: 'Change password and revoke all active admin sessions' })
  async changePassword(@Body() body: ChangePasswordDto, @CurrentAdmin() admin: AdminIdentity, @AdminSession() session: { id: string }, @Req() request: AdminRequest, @Res({ passthrough: true }) response: Response) {
    await this.auth.changePassword(admin, session.id, body.currentPassword, body.newPassword, request.requestId);
    clearAdminCookie(response, this.config.get('NODE_ENV') === 'production', this.auth.cookiePath());
    return { success: true, reauthenticationRequired: true };
  }
}
