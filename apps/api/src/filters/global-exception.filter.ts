import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiError, ApiResponse } from '@repo/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorResponse: ApiResponse<null, ApiError>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // If it's already in our ApiResponse format, use it
      if (this.isApiResponse(exceptionResponse)) {
        errorResponse = exceptionResponse as ApiResponse<null, ApiError>;
      } else {
        // Convert standard NestJS exception to our format
        const message = this.extractMessage(exceptionResponse, exception);

        errorResponse = {
          success: false,
          status,
          message: this.getDefaultMessage(status),
          error: {
            message,
            error: this.getDefaultMessage(status),
            statusCode: status,
          },
        };
      }
    } else {
      // Handle unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        success: false,
        status,
        message: 'Internal Server Error',
        error: {
          message: 'An unexpected error occurred',
          error: 'INTERNAL_SERVER_ERROR',
          statusCode: status,
        },
      };

      // Log unexpected errors for debugging
      const errorMessage =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        `Unexpected error: ${errorMessage}`,
        exception instanceof Error ? exception.stack : undefined,
        `${request.method} ${request.url}`,
      );
    }

    response.status(status).json(errorResponse);
  }

  private isApiResponse(obj: unknown): boolean {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'success' in obj &&
      'status' in obj &&
      'message' in obj
    );
  }

  private extractMessage(
    exceptionResponse: unknown,
    exception: HttpException,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const messageObj = exceptionResponse as Record<string, unknown>;
      const message = messageObj.message;

      if (Array.isArray(message)) {
        return String(message[0] || 'Unknown error');
      }

      return String(message);
    }

    return exception.message;
  }

  private getDefaultMessage(status: HttpStatus): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Validation Error';
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error';
      default:
        return 'Error';
    }
  }
}
