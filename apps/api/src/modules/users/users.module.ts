import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryModule } from '@/common/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [UsersController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class UsersModule {}
