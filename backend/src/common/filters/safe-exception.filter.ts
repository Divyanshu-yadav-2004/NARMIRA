import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../database/generated/client';

@Catch()
export class SafeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SafeExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const prismaStatus = exception instanceof Prisma.PrismaClientKnownRequestError
      ? ({ P2002: HttpStatus.CONFLICT, P2025: HttpStatus.NOT_FOUND, P2003: HttpStatus.UNPROCESSABLE_ENTITY, P2034: HttpStatus.CONFLICT } as Record<string, number>)[exception.code]
      : undefined;
    const status = exception instanceof HttpException ? exception.getStatus() : prismaStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const body = exception instanceof HttpException ? exception.getResponse() : null;
    const message = prismaStatus === HttpStatus.CONFLICT ? 'The requested change conflicts with existing data; reload and retry'
      : prismaStatus === HttpStatus.NOT_FOUND ? 'The requested resource was not found'
        : prismaStatus === HttpStatus.UNPROCESSABLE_ENTITY ? 'The request conflicts with related catalog data'
    : typeof body === 'object' && body && 'message' in body
      ? (body as { message: unknown }).message
      : typeof body === 'string' ? body : 'Internal server error';

    if (status >= 500) {
      this.logger.error(JSON.stringify({ event: 'http_error', status, method: request.method, path: request.path }));
    }
    response.status(status).json({ statusCode: status, message });
  }
}
