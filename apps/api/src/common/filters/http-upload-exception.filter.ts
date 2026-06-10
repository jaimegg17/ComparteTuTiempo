import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface UploadLikeError {
  code?: string;
  message?: string;
}

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
    const uploadError = exception as UploadLikeError;
    const isMulterOrUploadError =
      uploadError.code === 'LIMIT_FILE_SIZE' ||
      uploadError.message?.includes('File too large') ||
      uploadError.message?.includes('Unexpected end of form');

    if (isMulterOrUploadError) {
      const message =
        uploadError.message?.includes('File too large')
          ? 'El archivo es demasiado grande. Tamaño máximo: 10MB. Elige otra imagen o comprímela.'
          : 'El archivo no se pudo subir. Comprueba el tamaño (máx. 10MB) e intenta de nuevo.';
      this.logger.warn(`Upload/Multer error converted to 400: ${uploadError.message}`);
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
