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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      return response
        .status(status)
        .json(
          typeof errorResponse === 'string'
            ? { statusCode: status, message: errorResponse }
            : errorResponse,
        );
    }

    if (exception instanceof DomainError) {
      return response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.name,
      });
    }

    if (exception instanceof ApplicationError) {
      return response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.name,
      });
    }

    if (exception instanceof InfraError) {
      return response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        message: exception.message,
        error: exception.name,
      });
    }

    console.error(
      '🔥 Unhandled error caught by GlobalExceptionFilter:',
      exception,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
