import { Controller, Get, Put, Param, Body, UseGuards, Request, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IsString, IsOptional, IsEmail, MaxLength, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Location must not exceed 100 characters' })
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone number must not exceed 20 characters' })
  phoneNumber?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private getAuthenticatedUserId(req: { user?: { sub?: string; id?: string } }): string {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserProfile(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        location: true,
        bio: true,
        skills: true,
        imageUrl: true,
        role: true,
        timeCredits: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            services: true,
            ratings: true,
            requestedExchanges: true,
            offeredExchanges: true,
          }
        }
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User profile retrieved successfully',
      user,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    // Verificar que el usuario solo puede actualizar su propio perfil
    if (userId !== id) {
      throw new BadRequestException('You can only update your own profile');
    }

    // Verificar que el usuario existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const previousImageUrl = existingUser.imageUrl ?? null;
    const hasImageUrlUpdate = Object.prototype.hasOwnProperty.call(updateUserDto, 'imageUrl');
    const nextImageUrl = hasImageUrlUpdate ? updateUserDto.imageUrl ?? null : previousImageUrl;

    // Actualizar el usuario
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        bio: updateUserDto.bio,
        location: updateUserDto.location,
        phoneNumber: updateUserDto.phoneNumber,
        skills: updateUserDto.skills || [],
        imageUrl: updateUserDto.imageUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        location: true,
        bio: true,
        skills: true,
        imageUrl: true,
        role: true,
        timeCredits: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const shouldDeletePreviousImage = Boolean(
      hasImageUrlUpdate &&
        previousImageUrl &&
        previousImageUrl !== nextImageUrl &&
        previousImageUrl.includes('res.cloudinary.com'),
    );

    if (shouldDeletePreviousImage && previousImageUrl) {
      try {
        const publicId = this.cloudinaryService.extractPublicId(previousImageUrl);
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        console.warn(
          `No se pudo limpiar imagen anterior del usuario ${id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    return {
      message: 'User profile updated successfully',
      user: updatedUser,
    };
  }
}
