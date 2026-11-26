import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '../../database/generated/client';
import { PrismaService } from '../../database/prisma.service';
import type { AdminIdentity } from './admin-auth';
import type { AdminCreateDto, AdminUpdateDto, PageDto } from './admin.dto';
import { hashPassword, requestIdFrom } from './security';

@Injectable()
export class AdminAccountService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: PageDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.adminUser.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.adminUser.count(),
    ]);
    return { data, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }

  async create(actor: AdminIdentity, dto: AdminCreateDto, requestId?: string) {
    const email = dto.email.trim().toLowerCase();
    const passwordHash = await hashPassword(dto.password);
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.adminUser.create({ data: { name: dto.name.trim(), email, passwordHash, role: dto.role } });
      await tx.auditLog.create({ data: { adminId: actor.id, action: 'ADMIN_CREATED', entityType: 'ADMIN_USER', entityId: created.id, requestId, metadata: { role: created.role, email: created.email } } });
      return { id: created.id, name: created.name, email: created.email, role: created.role, isActive: created.isActive, createdAt: created.createdAt };
    }).catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('An administrator with this email already exists');
      throw error;
    });
  }

  async update(actor: AdminIdentity, targetId: string, dto: AdminUpdateDto, requestId?: string) {
    if (dto.role === undefined && dto.isActive === undefined) throw new UnprocessableEntityException('Provide a role or active status change');
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.adminUser.findUnique({ where: { id: targetId } });
      if (!target) throw new NotFoundException('Administrator not found');
      const becomesSuper = (dto.role ?? target.role) === 'SUPER_ADMIN';
      const remainsActive = dto.isActive ?? target.isActive;
      if (target.role === 'SUPER_ADMIN' && target.isActive && (!becomesSuper || !remainsActive)) {
        if (actor.id === target.id) throw new ConflictException('You cannot disable or demote your own administrator account');
        const count = await tx.adminUser.count({ where: { role: 'SUPER_ADMIN', isActive: true } });
        if (count <= 1) throw new ConflictException('At least one active super administrator must remain');
      }
      const updated = await tx.adminUser.update({ where: { id: targetId }, data: dto });
      if (dto.isActive === false) await tx.adminSession.updateMany({ where: { adminId: targetId, revokedAt: null }, data: { revokedAt: new Date() } });
      await tx.auditLog.create({ data: { adminId: actor.id, action: 'ADMIN_UPDATED', entityType: 'ADMIN_USER', entityId: targetId, requestId, metadata: { role: updated.role, isActive: updated.isActive } } });
      return { id: updated.id, name: updated.name, email: updated.email, role: updated.role, isActive: updated.isActive, updatedAt: updated.updatedAt };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async auditLogs(query: PageDto) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({ include: { admin: { select: { id: true, name: true, email: true, role: true } } }, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.pageSize, take: query.pageSize }),
      this.prisma.auditLog.count(),
    ]);
    return { data, pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
}
