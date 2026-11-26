import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminCsrfGuard, AdminOriginGuard, AdminRolesGuard } from './admin-auth';

function context(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}), getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('admin request guards', () => {
  it('requires a matching CSRF token', () => {
    const guard = new AdminCsrfGuard();
    const req = { headers: { 'x-csrf-token': 'given' }, csrfTokenHash: undefined };
    expect(() => guard.canActivate(context(req))).toThrow(ForbiddenException);
  });

  it('enforces the configured exact request origin', () => {
    const guard = new AdminOriginGuard({ getOrThrow: () => 'https://shop.example.test' } as never);
    expect(guard.canActivate(context({ headers: { origin: 'https://shop.example.test' } }))).toBe(true);
    expect(() => guard.canActivate(context({ headers: { origin: 'https://evil.example.test' } }))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context({ headers: {} }))).toThrow(ForbiddenException);
  });

  it('enforces role metadata on protected handlers', () => {
    const reflector = { getAllAndOverride: () => ['SUPER_ADMIN'] } as unknown as Reflector;
    const guard = new AdminRolesGuard(reflector);
    expect(() => guard.canActivate(context({ admin: { role: 'CATALOG_ADMIN' } }))).toThrow(ForbiddenException);
    expect(guard.canActivate(context({ admin: { role: 'SUPER_ADMIN' } }))).toBe(true);
  });
});
