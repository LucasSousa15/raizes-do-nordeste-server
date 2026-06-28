import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DomainError } from './domain.error';
import { ApplicationError } from './application.error';
import { InfraError } from './infra.error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_SERVER_ERROR';
    let message = 'Erro interno do servidor';
    let details: any[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse: any = exception.getResponse();

      if (typeof errorResponse === 'object' && errorResponse !== null) {
        error = errorResponse.error || exception.name;
        if (Array.isArray(errorResponse.message)) {
          error = 'VALIDATION_ERROR';
          message = 'Erro de validação de dados.';
          details = errorResponse.message.map((msg: string) => {
            const parts = msg.split(' ');
            const field = parts[0];
            const issue = parts.slice(1).join(' ');
            return { field, issue };
          });
        } else {
          message = errorResponse.message || exception.message;
        }
      } else {
        message = errorResponse || exception.message;
      }
    } else if (
      exception instanceof DomainError ||
      exception instanceof ApplicationError ||
      exception instanceof InfraError
    ) {
      status = exception.statusCode;
      error = exception.name;
      message = exception.message;
      if ('details' in exception && Array.isArray((exception as any).details)) {
        details = (exception as any).details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Convert PascalCase / camelCase name to SNAKE_CASE
    error = error
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase()
      .replace(/_ERROR$/, '');

    return response.status(status).json({
      error,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

