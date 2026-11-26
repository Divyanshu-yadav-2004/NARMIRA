import { Controller, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API process health' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok', service: 'narmira-api' } } })
  getHealth() {
    return { status: 'ok', service: 'narmira-api' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Check API and database readiness' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ready', service: 'narmira-api' } } })
  @ApiResponse({ status: 503, description: 'Database is unavailable' })
  async getReadiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', service: 'narmira-api' };
    } catch (error) {
      const errorCode = error && typeof error === 'object' && 'code' in error
        && typeof error.code === 'string' ? error.code : undefined;
      this.logger.warn(JSON.stringify({ event: 'database_readiness_failed', errorCode }));
      throw new HttpException(
        { status: 'unavailable', service: 'narmira-api', message: 'Service is temporarily unavailable' },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
