import { HttpException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const prisma = { $queryRaw: jest.fn() };
  const controller = new HealthController(prisma as never);

  beforeEach(() => jest.clearAllMocks());

  it('returns a non-database liveness response', () => {
    expect(controller.getHealth()).toEqual({ status: 'ok', service: 'narmira-api' });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('reports readiness when the database responds', async () => {
    prisma.$queryRaw.mockResolvedValueOnce(1);
    await expect(controller.getReadiness()).resolves.toEqual({ status: 'ready', service: 'narmira-api' });
  });

  it('returns 503 without exposing database errors', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('postgresql://secret@host/db'));
    try {
      await controller.getReadiness();
      throw new Error('Expected readiness to reject');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(503);
      expect((error as HttpException).getResponse()).toEqual({
        status: 'unavailable',
        service: 'narmira-api',
        message: 'Service is temporarily unavailable',
      });
      expect(JSON.stringify((error as HttpException).getResponse())).not.toContain('secret');
    }
  });
});
