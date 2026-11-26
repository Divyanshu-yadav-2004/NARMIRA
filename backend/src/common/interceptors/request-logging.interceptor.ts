import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = randomUUID();
    (request as Request & { requestId: string }).requestId = requestId;
    response.setHeader('x-request-id', requestId);
    const startedAt = Date.now();
    return next.handle().pipe(tap(() => this.logger.log(JSON.stringify({
      event: 'http_request', method: request.method, path: request.path,
      statusCode: response.statusCode, durationMs: Date.now() - startedAt,
      requestId,
    }))));
  }
}
