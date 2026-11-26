import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { SafeExceptionFilter } from '../src/common/filters/safe-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/interceptors/request-logging.interceptor';
import { hashPassword, tokenHash } from '../src/modules/admin/security';

describe('Admin catalog API (real PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let superAgent: ReturnType<typeof request.agent>;
  let catalogAgent: ReturnType<typeof request.agent>;
  let csrf = '';
  let catalogCsrf = '';
  let adminId = '';
  let catalogAdminId = '';
  let categoryId = '';
  let productId = '';
  let safeDatabaseConfirmed = false;
  const suffix = `qa-phase3-${Date.now()}`;
  const productSlug = `${suffix}-draft-product`;
  const catalogSlug = `${suffix}-catalog-admin-product`;
  const password = 'Temporary-QA-Password-Only-47391';
  const origin = 'http://localhost:5173';

  beforeAll(async () => {
    if (process.env.NARMIRA_POSTGRES_TESTS !== '1') throw new Error('Set NARMIRA_POSTGRES_TESTS=1 to run temporary-record PostgreSQL tests.');
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new SafeExceptionFilter());
    app.useGlobalInterceptors(new RequestLoggingInterceptor());
    await app.init();
    prisma = app.get(PrismaService);
    const [target] = await prisma.$queryRaw<Array<{ database: string; address: string | null; port: string }>>`
      SELECT current_database() AS database, host(inet_server_addr()) AS address, current_setting('port') AS port
    `;
    if (target.database !== 'narmira' || target.address !== '127.0.0.1' || target.port !== '55432') throw new Error('Refusing QA fixture writes outside the isolated loopback NARMIRA database on port 55432.');
    safeDatabaseConfirmed = true;
    adminId = `${suffix}-super-admin`;
    catalogAdminId = `${suffix}-catalog-admin`;
    categoryId = `${suffix}-category`;
    await prisma.adminUser.create({ data: { id: adminId, name: 'Temporary Phase 3 QA Super Admin', email: `${suffix}@example.test`, passwordHash: await hashPassword(password), role: 'SUPER_ADMIN' } });
    await prisma.adminUser.create({ data: { id: catalogAdminId, name: 'Temporary Phase 3 QA Catalog Admin', email: `catalog-${suffix}@example.test`, passwordHash: await hashPassword(password), role: 'CATALOG_ADMIN' } });
    await prisma.category.create({ data: { id: categoryId, name: 'Temporary Phase 3 QA Category', slug: `${suffix}-category` } });
    superAgent = request.agent(app.getHttpServer());
    catalogAgent = request.agent(app.getHttpServer());
  }, 60000);

  afterAll(async () => {
    if (safeDatabaseConfirmed) {
      await prisma.$transaction(async (tx) => {
        const products = await tx.product.findMany({ where: { slug: { in: [productSlug, catalogSlug] } }, select: { id: true } });
        const ids = products.map(({ id }) => id);
        if (ids.length) {
          await tx.inventoryAdjustment.deleteMany({ where: { productId: { in: ids } } });
          await tx.auditLog.deleteMany({ where: { entityId: { in: ids } } });
          await tx.product.deleteMany({ where: { id: { in: ids } } });
        }
        await tx.auditLog.deleteMany({ where: { adminId: { in: [adminId, catalogAdminId] } } });
        await tx.adminUser.deleteMany({ where: { id: { in: [adminId, catalogAdminId] } } });
        await tx.category.deleteMany({ where: { id: categoryId } });
      });
    }
    await app?.close();
  }, 30000);

  it('authenticates, enforces origin/CSRF, and grants role-appropriate API access', async () => {
    const invalid = await request(app.getHttpServer()).post('/api/v1/admin/auth/login').set('Origin', origin)
      .send({ email: `${suffix}@example.test`, password: 'wrong-password' });
    expect(invalid.status).toBe(401);
    const missingOrigin = await request(app.getHttpServer()).post('/api/v1/admin/auth/login')
      .send({ email: `${suffix}@example.test`, password });
    expect(missingOrigin.status).toBe(403);

    const login = await superAgent.post('/api/v1/admin/auth/login').set('Origin', origin)
      .send({ email: `${suffix}@example.test`, password }).expect(200);
    csrf = login.body.csrfToken;
    expect(login.headers['set-cookie'][0]).toContain('HttpOnly');
    expect(login.headers['set-cookie'][0]).toContain('SameSite=Strict');
    const me = await superAgent.get('/api/v1/admin/auth/me').expect(200);
    expect(me.body.admin.role).toBe('SUPER_ADMIN');
    await superAgent.post('/api/v1/admin/products').set('Origin', origin).send({}).expect(403);
    await superAgent.post('/api/v1/admin/products').set('Origin', origin).set('x-csrf-token', csrf).send({}).expect(422);
    await superAgent.post('/api/v1/admin/products').set('Origin', origin).set('x-csrf-token', 'incorrect-token').send({}).expect(403);

    const catalogLogin = await catalogAgent.post('/api/v1/admin/auth/login').set('Origin', origin)
      .send({ email: `catalog-${suffix}@example.test`, password }).expect(200);
    catalogCsrf = catalogLogin.body.csrfToken;
    await catalogAgent.get('/api/v1/admin/administrators').expect(403);
    const created = await catalogAgent.post('/api/v1/admin/products').set('Origin', origin).set('x-csrf-token', catalogCsrf)
      .send({ name: 'Temporary QA Catalog Draft', slug: catalogSlug, description: 'Temporary test record', basePrice: '1500.00', categoryIds: [categoryId] }).expect(201);
    expect(created.body.status).toBe('DRAFT');
    await catalogAgent.post(`/api/v1/admin/products/${created.body.id}/publish`).set('Origin', origin).set('x-csrf-token', catalogCsrf).expect(403);
  }, 60000);

  it('manages a draft through image, stock, publication, public visibility and audit history', async () => {
    const created = await superAgent.post('/api/v1/admin/products').set('Origin', origin).set('x-csrf-token', csrf)
      .send({ name: 'Temporary QA Saree', slug: productSlug, description: 'Temporary test record', basePrice: '12000.00', salePrice: '11000.00', categoryIds: [categoryId] }).expect(201);
    productId = created.body.id;
    expect(created.body.status).toBe('DRAFT');
    await request(app.getHttpServer()).get(`/api/v1/products/${productSlug}`).expect(404);
    await superAgent.post(`/api/v1/admin/products/${productId}/publish`).set('Origin', origin).set('x-csrf-token', csrf).expect(422);

    await superAgent.post(`/api/v1/admin/products/${productId}/images`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ imageUrl: 'file:///secret.jpg' }).expect(422);
    await superAgent.post(`/api/v1/admin/products/${productId}/images`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ imageUrl: 'https://cdn.example.test/qa-only.jpg', altText: 'Temporary QA fixture' }).expect(201);
    const variant = await superAgent.post(`/api/v1/admin/products/${productId}/variants`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ name: 'QA Maroon', colorName: 'Maroon', colorCode: '#632D35' }).expect(201);
    const size = await superAgent.post(`/api/v1/admin/products/${productId}/sizes`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ size: 'M', sortOrder: 1 }).expect(201);
    const stock = await superAgent.post(`/api/v1/admin/products/${productId}/inventory`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ variantId: variant.body.id, sizeId: size.body.id, quantity: 8, version: 0, reason: 'Initial QA stock' }).expect(201);
    expect(stock.body.deltaQuantity).toBe(8);
    expect(stock.body.version).toBe(1);

    const published = await superAgent.post(`/api/v1/admin/products/${productId}/publish`).set('Origin', origin).set('x-csrf-token', csrf).expect(201);
    expect(published.body.status).toBe('ACTIVE');
    const publicProduct = await request(app.getHttpServer()).get(`/api/v1/products/${productSlug}`).expect(200);
    expect(publicProduct.body.basePrice).toBe('12000.00');
    expect(publicProduct.body.variants[0].colorName).toBe('Maroon');

    const adjustment = await superAgent.post(`/api/v1/admin/products/${productId}/inventory`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ variantId: variant.body.id, sizeId: size.body.id, quantity: 10, version: 1, reason: 'QA correction' }).expect(201);
    expect(adjustment.body.deltaQuantity).toBe(2);
    await superAgent.post(`/api/v1/admin/products/${productId}/inventory`).set('Origin', origin).set('x-csrf-token', csrf)
      .send({ variantId: variant.body.id, sizeId: size.body.id, quantity: 12, version: 1, reason: 'Stale QA update' }).expect(409);

    const simultaneous = await Promise.all([
      superAgent.post(`/api/v1/admin/products/${productId}/inventory`).set('Origin', origin).set('x-csrf-token', csrf)
        .send({ variantId: variant.body.id, sizeId: size.body.id, quantity: 11, version: 2, reason: 'Concurrent QA update A' }),
      superAgent.post(`/api/v1/admin/products/${productId}/inventory`).set('Origin', origin).set('x-csrf-token', csrf)
        .send({ variantId: variant.body.id, sizeId: size.body.id, quantity: 12, version: 2, reason: 'Concurrent QA update B' }),
    ]);
    expect(simultaneous.map(({ status }) => status).sort()).toEqual([201, 409]);

    await superAgent.post(`/api/v1/admin/products/${productId}/unpublish`).set('Origin', origin).set('x-csrf-token', csrf).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/products/${productSlug}`).expect(404);
    await superAgent.post(`/api/v1/admin/products/${productId}/publish`).set('Origin', origin).set('x-csrf-token', csrf).expect(201);
    await superAgent.post(`/api/v1/admin/products/${productId}/archive`).set('Origin', origin).set('x-csrf-token', csrf).expect(201);
    await request(app.getHttpServer()).get(`/api/v1/products/${productSlug}`).expect(404);
    await superAgent.post(`/api/v1/admin/products/${productId}/restore`).set('Origin', origin).set('x-csrf-token', csrf).expect(201);
    await superAgent.post(`/api/v1/admin/products/${productId}/publish`).set('Origin', origin).set('x-csrf-token', csrf).expect(201);

    const logs = await superAgent.get('/api/v1/admin/audit-logs').expect(200);
    expect(logs.body.data.some((row: { entityId: string }) => row.entityId === productId)).toBe(true);
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: adminId } });
    expect(user.passwordHash).not.toBe(password);
    const sessions = await prisma.adminSession.findMany({ where: { adminId } });
    expect(sessions.every((session) => /^[a-f0-9]{64}$/.test(session.tokenHash) && /^[a-f0-9]{64}$/.test(session.csrfTokenHash))).toBe(true);
  }, 60000);

  it('revokes sessions on logout and denies disabled administrators', async () => {
    await catalogAgent.post('/api/v1/admin/auth/logout').set('Origin', origin).set('x-csrf-token', catalogCsrf).expect(200);
    await catalogAgent.get('/api/v1/admin/auth/me').expect(401);
    await prisma.adminUser.update({ where: { id: catalogAdminId }, data: { isActive: false } });
    await request(app.getHttpServer()).post('/api/v1/admin/auth/login').set('Origin', origin)
      .send({ email: `catalog-${suffix}@example.test`, password }).expect(401);
  });

  it('rejects expired sessions and revokes the current session after password change', async () => {
    const expiredRawToken = 'x'.repeat(43);
    await prisma.adminSession.create({ data: {
      adminId, tokenHash: tokenHash(expiredRawToken), csrfTokenHash: 'b'.repeat(64), expiresAt: new Date(Date.now() - 1000),
    } });
    await request(app.getHttpServer()).get('/api/v1/admin/auth/me')
      .set('Cookie', `narmira_admin_session=${expiredRawToken}`).expect(401);

    await superAgent.post('/api/v1/admin/auth/change-password').set('Origin', origin).set('x-csrf-token', csrf)
      .send({ currentPassword: password, newPassword: 'Temporary-QA-Password-Changed-73518' }).expect(200);
    await superAgent.get('/api/v1/admin/auth/me').expect(401);
  }, 60000);

  it('strictly rate-limits repeated admin login attempts', async () => {
    await request(app.getHttpServer()).post('/api/v1/admin/auth/login').set('Origin', origin)
      .send({ email: `unknown-${suffix}@example.test`, password: 'incorrect-password' }).expect(429);
  });
});
