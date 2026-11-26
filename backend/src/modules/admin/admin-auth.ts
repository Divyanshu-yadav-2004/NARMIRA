import {
  CanActivate, createParamDecorator, ExecutionContext, ForbiddenException, Injectable, SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { tokenHash } from './security';

export const ADMIN_COOKIE = 'narmira_admin_session';
export interface AdminIdentity { id: string; name: string; email: string; role: 'SUPER_ADMIN' | 'CATALOG_ADMIN' }
type AdminRequest = Request & { admin?: AdminIdentity; adminSessionId?: string; csrfTokenHash?: string; requestId?: string };
export const CurrentAdmin = createParamDecorator((_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest<AdminRequest>().admin);
export const AdminSession = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AdminRequest>();
  return { id: request.adminSessionId, csrfTokenHash: request.csrfTokenHash };
});
export const Roles = (...roles: AdminIdentity['role'][]) => SetMetadata('admin:roles', roles);

@Injectable()
export class AdminOriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const allowed = this.config.getOrThrow<string>('FRONTEND_URL').split(',').map((origin) => origin.trim());
    const origin = request.headers.origin;
    let candidate = origin;
    if (!candidate && request.headers.referer) {
      try { candidate = new URL(request.headers.referer).origin; } catch { candidate = undefined; }
    }
    if (!candidate || !allowed.includes(candidate)) throw new ForbiddenException('Request origin is not allowed');
    return true;
  }
}

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const token = this.cookie(request, ADMIN_COOKIE);
    if (!token || !/^[A-Za-z0-9_-]{40,50}$/.test(token)) throw new UnauthorizedException('Authentication required');
    const session = await this.prisma.adminSession.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { admin: { select: { id: true, name: true, email: true, role: true, isActive: true, passwordChangedAt: true } } },
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.admin.isActive || session.createdAt < session.admin.passwordChangedAt) {
      throw new UnauthorizedException('Authentication required');
    }
    request.admin = { id: session.admin.id, name: session.admin.name, email: session.admin.email, role: session.admin.role };
    request.adminSessionId = session.id;
    request.csrfTokenHash = session.csrfTokenHash;
    return true;
  }
  private cookie(request: Request, name: string): string | undefined {
    const cookie = request.headers.cookie?.split(';').map((entry) => entry.trim()).find((entry) => entry.startsWith(`${name}=`));
    if (!cookie) return undefined;
    try { return decodeURIComponent(cookie.slice(name.length + 1)); } catch { return undefined; }
  }
}

@Injectable()
export class AdminCsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AdminRequest>();
    const presented = request.headers['x-csrf-token'];
    const digest = typeof presented === 'string' ? tokenHash(presented) : '';
    const expected = request.csrfTokenHash ?? '';
    const matches = digest.length === expected.length && digest.length > 0
      ? timingSafeEqual(Buffer.from(digest), Buffer.from(expected)) : false;
    if (!matches) {
      throw new ForbiddenException('A valid CSRF token is required');
    }
    return true;
  }
}

@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminIdentity['role'][]>('admin:roles', [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const admin = context.switchToHttp().getRequest<AdminRequest>().admin;
    if (!admin || !required.includes(admin.role)) throw new ForbiddenException('Insufficient administrator permissions');
    return true;
  }
}

export function clearAdminCookie(response: Response, secure: boolean, path: string): void {
  response.clearCookie(ADMIN_COOKIE, { httpOnly: true, secure, sameSite: 'strict', path });
}
