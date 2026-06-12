import { Controller, Get, Put, Post, Delete, Param, Body, UseGuards, Request, ParseIntPipe, NotFoundException, BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { IsString, IsOptional, IsEmail, MaxLength, IsArray, IsDateString } from 'class-validator';

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

  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date of birth' })
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Gender must not exceed 50 characters' })
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Preferred language must not exceed 10 characters' })
  preferredLanguage?: string;
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

  private async ensureAdmin(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede acceder a esta información');
    }
  }

  @Get('admin/metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get basic admin metrics' })
  @ApiResponse({ status: 200, description: 'Admin metrics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAdminMetrics(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);
    await this.ensureAdmin(userId);

    const [
      users,
      services,
      exchanges,
      communities,
      organizations,
      pendingOrganizations,
      events,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.service.count(),
      this.prisma.exchange.count(),
      this.prisma.community.count({ where: { kind: 'COMMUNITY' } }),
      this.prisma.community.count({ where: { kind: 'ORGANIZATION', verificationStatus: 'APPROVED' } }),
      this.prisma.community.count({ where: { kind: 'ORGANIZATION', verificationStatus: 'PENDING' } }),
      this.prisma.event.count(),
    ]);

    return {
      message: 'Admin metrics retrieved successfully',
      metrics: {
        users,
        services,
        exchanges,
        communities,
        organizations,
        pendingOrganizations,
        events,
      },
    };
  }

  @Get('profile/:id')
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
        dateOfBirth: true,
        gender: true,
        preferredLanguage: true,
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

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user favorite services' })
  @ApiResponse({ status: 200, description: 'Favorite services retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyFavoriteServices(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);

    const favorites = await this.prisma.userFavoriteService.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        serviceId: true,
      },
    });

    return {
      message: 'Favorite services retrieved successfully',
      favoriteServiceIds: favorites.map((favorite) => favorite.serviceId),
    };
  }

  @Get('me/notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyNotifications(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);

    const notifications = await this.prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        isRead: true,
        createdAt: true,
        readAt: true,
      },
    });

    const unreadCount = await this.prisma.userNotification.count({
      where: { userId, isRead: false },
    });

    return {
      message: 'Notifications retrieved successfully',
      notifications,
      unreadCount,
    };
  }

  @Post('me/notifications/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all current user notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllMyNotificationsAsRead(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);

    await this.prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Notifications marked as read successfully',
    };
  }

  @Post('me/notifications/:notificationId/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark one current user notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markMyNotificationAsRead(
    @Param('notificationId', ParseIntPipe) notificationId: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const notification = await this.prisma.userNotification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.userNotification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      message: 'Notification marked as read successfully',
      notificationId,
    };
  }

  @Post('me/favorites/:serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a service to current user favorites' })
  @ApiResponse({ status: 201, description: 'Service added to favorites successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async addMyFavoriteService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    await this.prisma.userFavoriteService.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
      update: {},
      create: {
        userId,
        serviceId,
      },
    });

    const favoritesCount = await this.prisma.userFavoriteService.count({
      where: { userId },
    });

    return {
      message: 'Service added to favorites successfully',
      serviceId,
      favoritesCount,
    };
  }

  @Delete('me/favorites/:serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a service from current user favorites' })
  @ApiResponse({ status: 200, description: 'Service removed from favorites successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeMyFavoriteService(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    await this.prisma.userFavoriteService.deleteMany({
      where: {
        userId,
        serviceId,
      },
    });

    const favoritesCount = await this.prisma.userFavoriteService.count({
      where: { userId },
    });

    return {
      message: 'Service removed from favorites successfully',
      serviceId,
      favoritesCount,
    };
  }

  @Put('profile/:id')
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
        email: existingUser.email,
        bio: updateUserDto.bio,
        location: updateUserDto.location,
        phoneNumber: updateUserDto.phoneNumber,
        skills: updateUserDto.skills || [],
        imageUrl: updateUserDto.imageUrl,
        dateOfBirth: updateUserDto.dateOfBirth ? new Date(updateUserDto.dateOfBirth) : null,
        gender: updateUserDto.gender || null,
        preferredLanguage: updateUserDto.preferredLanguage || 'es',
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
        dateOfBirth: true,
        gender: true,
        preferredLanguage: true,
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
