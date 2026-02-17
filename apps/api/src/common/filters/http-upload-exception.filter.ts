import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Catches Multer and upload-related errors (e.g. LIMIT_FILE_SIZE) so the API
 * returns 400 with a clear message instead of 500, allowing the UI to show a
 * controlled error and retry. Use on upload controller only.
 */
@Catch()
export class HttpUploadExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpUploadExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isMulterOrUploadError =
      (exception as any)?.code === 'LIMIT_FILE_SIZE' ||
      (exception as any)?.message?.includes?.('File too large') ||
      (exception as any)?.message?.includes?.('Unexpected end of form');

    if (isMulterOrUploadError) {
      const message =
        (exception as any)?.message?.includes?.('File too large')
          ? 'El archivo es demasiado grande. Tamaño máximo: 10MB. Elige otra imagen o comprímela.'
          : 'El archivo no se pudo subir. Comprueba el tamaño (máx. 10MB) e intenta de nuevo.';
      this.logger.warn(`Upload/Multer error converted to 400: ${(exception as any)?.message}`);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message,
      });
      return;
    }

    throw exception;
  }
}
