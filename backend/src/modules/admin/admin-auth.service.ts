import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../../database/generated/client';
import { PrismaService } from '../../database/prisma.service';
import type { AdminIdentity } from './admin-auth';
import { hashPassword, randomToken, tokenHash, verifyPassword } from './security';

const SESSION_HOURS = 8;

@Injectable()
export class AdminAuthService {
  private readonly dummyHashPromise = hashPassword(randomToken());
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async login(emailInput: string, password: string, requestId?: string) {
    const email = emailInput.trim().toLowerCase();
    const admin = await this.prisma.adminUser.findUnique({ where: { email } });
    const storedHash = admin?.passwordHash ?? await this.dummyHashPromise;
    const valid = await verifyPassword(password, storedHash);
    if (!admin || !admin.isActive || !valid) throw new UnauthorizedException('Invalid email or password');

    const rawToken = randomToken();
    const csrfToken = randomToken();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
      await tx.adminSession.create({ data: {
        adminId: admin.id, tokenHash: tokenHash(rawToken), csrfTokenHash: tokenHash(csrfToken), expiresAt,
      } });
      await tx.auditLog.create({ data: { adminId: admin.id, action: 'LOGIN', entityType: 'ADMIN_SESSION', requestId, metadata: { expiresAt: expiresAt.toISOString() } } });
      return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
    });
    return { admin: updated as AdminIdentity, rawToken, csrfToken, expiresAt };
  }

  async rotateCsrf(sessionId: string) {
    const csrfToken = randomToken();
    await this.prisma.adminSession.update({ where: { id: sessionId }, data: { csrfTokenHash: tokenHash(csrfToken), lastUsedAt: new Date() } });
    return csrfToken;
  }

  async logout(adminId: string, sessionId: string, requestId?: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.adminSession.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({ data: { adminId, action: 'LOGOUT', entityType: 'ADMIN_SESSION', entityId: sessionId, requestId } });
    });
  }

  async changePassword(admin: AdminIdentity, sessionId: string, currentPassword: string, newPassword: string, requestId?: string) {
    const record = await this.prisma.adminUser.findUnique({ where: { id: admin.id } });
    if (!record || !await verifyPassword(currentPassword, record.passwordHash)) throw new UnauthorizedException('Current password is incorrect');
    if (currentPassword === newPassword) throw new ConflictException('Choose a password different from the current password');
    const passwordHash = await hashPassword(newPassword);
    await this.prisma.$transaction(async (tx) => {
      await tx.adminUser.update({ where: { id: admin.id }, data: { passwordHash, passwordChangedAt: new Date() } });
      await tx.adminSession.updateMany({ where: { adminId: admin.id, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({ data: { adminId: admin.id, action: 'PASSWORD_CHANGED', entityType: 'ADMIN_USER', entityId: admin.id, requestId, metadata: { revokedCurrentSession: sessionId } } });
    });
  }

  cookieOptions() {
    return {
      httpOnly: true as const,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict' as const,
      path: `/${this.config.getOrThrow<string>('API_PREFIX')}/admin`,
      maxAge: SESSION_HOURS * 60 * 60 * 1000,
    };
  }

  cookiePath() { return this.cookieOptions().path; }
}
