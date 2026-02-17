import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export interface UploadImageOptions {
  width?: number;
  height?: number;
  folder?: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('Cloudinary credentials not configured. Image upload will fail.');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  /**
   * Upload image to Cloudinary with intelligent transformations
   * @param file - Multer file object
   * @param options - Upload options (width, height, folder)
   * @returns Secure URL of uploaded image
   */
  async uploadImage(file: Express.Multer.File, options: UploadImageOptions = {}): Promise<string> {
    return new Promise((resolve, reject) => {
      const folder = options.folder || 'comparte-tu-tiempo';
      
      // Intelligent transformations based on image dimensions
      const transformations: any[] = [];
      
      // If image is larger than 1200px, resize it
      if (options.width && options.width > 1200) {
        transformations.push({ width: 1200, crop: 'limit' });
      } else if (options.height && options.height > 1200) {
        transformations.push({ height: 1200, crop: 'limit' });
      }
      
      // Always optimize quality and format
      transformations.push(
        { quality: 'auto:good' }, // Balance between quality and file size
        { fetch_format: 'auto' }, // Auto-optimize format (WebP when supported)
      );

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: folder,
          transformation: transformations.length > 0 ? transformations : undefined,
          // Store original filename for reference
          public_id: `${folder}/${file.originalname.split('.')[0]}_${Date.now()}`,
          // Overwrite existing images with same public_id
          overwrite: false,
          // Invalidate CDN cache
          invalidate: true,
        },
        (error, result) => {
          if (error) {
            this.logger.error(`Error uploading to Cloudinary: ${error.message}`, error.stack);
            const msg = error.message?.includes('api_key')
              ? 'El servidor no tiene configurado el almacenamiento de imágenes. Contacta con el administrador.'
              : `Error al subir la imagen: ${error.message}`;
            reject(new Error(msg));
          } else if (result) {
            this.logger.log(`Image uploaded successfully: ${result.public_id}`);
            resolve(result.secure_url);
          } else {
            this.logger.error('No result from Cloudinary upload');
            reject(new Error('No se recibió respuesta de Cloudinary'));
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { invalidate: true }, (error, result) => {
        if (error) {
          this.logger.error(`Error deleting from Cloudinary: ${error.message}`, error.stack);
          reject(new Error(`Error al eliminar la imagen: ${error.message}`));
        } else if (result && result.result === 'ok') {
          this.logger.log(`Image deleted successfully: ${publicId}`);
          resolve();
        } else {
          this.logger.warn(`Image deletion returned: ${result?.result}`);
          reject(new Error('No se pudo eliminar la imagen'));
        }
      });
    });
  }

  /**
   * Extract public_id from Cloudinary URL
   * @param url - Cloudinary secure URL
   * @returns Public ID of the image
   */
  extractPublicId(url: string): string {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}.{format}
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1) {
        throw new Error('Invalid Cloudinary URL');
      }

      // Get everything after 'upload'
      const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
      
      // Remove file extension
      const publicId = pathAfterUpload.split('.')[0];
      
      return publicId;
    } catch (error) {
      this.logger.error(`Error extracting public_id from URL: ${url}`, error);
      // Fallback: try to extract from filename
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      return filename.split('.')[0];
    }
  }
}
