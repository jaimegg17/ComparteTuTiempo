import { Controller, Post, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(), // Usar memoria para Cloudinary
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.startsWith('image/')) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const imageUrl = await this.cloudinaryService.uploadImage(file);
      
      return {
        success: true,
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        url: imageUrl,
      };
    } catch (error) {
      throw new BadRequestException('Error uploading image to Cloudinary');
    }
  }
}
