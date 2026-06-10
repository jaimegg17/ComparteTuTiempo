import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, ParseIntPipe, Put, Delete, HttpCode, HttpStatus, UnauthorizedException, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, MinLength, Min, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCreateWithImage } from '../domain/service.types';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { GetServiceUseCase } from '../application/get-service.use-case';
import { UpdateServiceUseCase } from '../application/update-service.use-case';
import { DeleteServiceUseCase } from '../application/delete-service.use-case';

const CATEGORIES = ['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'] as const;
const TYPES = ['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'] as const;
const INTENTS = ['OFFER', 'REQUEST'] as const;

// DTOs con class-validator para compatibilidad con ValidationPipe global
export class CreateServiceDto {
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  description: string;

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  duration: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  formattedAddress?: string;

  @IsOptional()
  @IsString()
  placeId?: string;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsEnum(CATEGORIES)
  category: (typeof CATEGORIES)[number];

  @IsEnum(TYPES)
  type: (typeof TYPES)[number];

  @IsOptional()
  @IsEnum(INTENTS)
  intent?: (typeof INTENTS)[number];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsUrl()
  @IsString()
  imageUrl?: string | null;
}

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  description?: string;

  @IsOptional()
  @IsString()
  detailedDescription?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  duration?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number | null;

  @IsOptional()
  @IsString()
  formattedAddress?: string | null;

  @IsOptional()
  @IsString()
  placeId?: string | null;

  @IsOptional()
  @IsString()
  availability?: string;

  @IsOptional()
  @IsEnum(CATEGORIES)
  category?: (typeof CATEGORIES)[number];

  @IsOptional()
  @IsEnum(TYPES)
  type?: (typeof TYPES)[number];

  @IsOptional()
  @IsEnum(INTENTS)
  intent?: (typeof INTENTS)[number];

  @IsOptional()
  @IsEnum(['ACTIVO', 'INACTIVO', 'COMPLETADO'])
  status?: 'ACTIVO' | 'INACTIVO' | 'COMPLETADO';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsUrl()
  @IsString()
  imageUrl?: string | null;
}

// Query DTO for searching and filtering services
export class ServiceListQueryDto {
  @IsOptional()
  @IsString()
  q?: string; // Search term (title or description)
  
  @IsOptional()
  @IsEnum(['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'])
  category?: 'EDUCACION' | 'HOGAR' | 'TECNOLOGIA' | 'SALUD' | 'DEPORTES' | 'ARTE' | 'OTROS';
  
  @IsOptional()
  @IsString()
  location?: string; // Location filter
  
  @IsOptional()
  @IsEnum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'])
  type?: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';

  @IsOptional()
  @IsEnum(['OFFER', 'REQUEST'])
  intent?: 'OFFER' | 'REQUEST';
  
  @IsOptional()
  @IsEnum(['ACTIVO', 'INACTIVO', 'COMPLETADO'])
  status?: 'ACTIVO' | 'INACTIVO' | 'COMPLETADO';
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nearLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nearLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radiusKm?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number;
  
  @IsOptional()
  @IsString()
  userId?: string; // Filter by user ID
}

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly deleteServiceUseCase: DeleteServiceUseCase,
    private readonly prisma: PrismaService,
  ) {}

  private getAuthenticatedUser(req: { user?: { sub?: string; id?: string; email?: string; name?: string } }) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return {
      userId,
      email: req.user?.email,
      name: req.user?.name,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createService(
    @Body() body: CreateServiceDto,
    @Request() req: { user?: { sub?: string; id?: string; email?: string; name?: string } },
  ) {
    // Convert DTO to ServiceCreateWithImage
    const serviceData: ServiceCreateWithImage = {
      title: body.title,
      description: body.description,
      detailedDescription: body.detailedDescription,
      duration: body.duration,
      location: body.location,
      latitude: body.latitude,
      longitude: body.longitude,
      formattedAddress: body.formattedAddress,
      placeId: body.placeId,
      availability: body.availability,
      category: body.category,
      type: body.type,
      intent: body.intent || 'OFFER',
      price: body.price,
      imageUrl: body.imageUrl,
    };
    const authUser = this.getAuthenticatedUser(req);
    const { userId } = authUser;
    
    // Upsert user if doesn't exist
    if (userId) {
      await this.prisma.user.upsert({
        where: { id: userId },
        update: {},  // No actualizar nada si ya existe
        create: {
          id: userId,
          email: authUser.email || `${userId}@example.com`,
          password: 'auth0-user', // Placeholder password for Auth0 users
          name: authUser.name || 'Usuario',
        },
      });
    }
    
    const result = await this.createServiceUseCase.execute({
      data: serviceData,
      userId,
    });

    return {
      message: 'Servicio creado exitosamente',
      service: result.service.toContract(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar servicios con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de servicios obtenida' })
  async listServices(
    @Query() query: ServiceListQueryDto,
    @Request() req: { user?: { sub?: string } },
  ) {
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      q: query.q,
      category: query.category,
      location: query.location,
      type: query.type,
      intent: query.intent,
      status: query.status,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      nearLat: query.nearLat,
      nearLng: query.nearLng,
      radiusKm: query.radiusKm,
      userId: query.userId, // Filtrar por usuario si se proporciona
    };

    // Si se proporciona userId, verificar que el usuario solo pueda ver sus propios servicios
    if (queryWithDefaults.userId && req.user && req.user.sub !== queryWithDefaults.userId) {
      throw new ForbiddenException('No tienes permisos para ver estos servicios');
    }

    const result = await this.listServicesUseCase.execute({ query: queryWithDefaults });
    return {
      message: 'Servicios obtenidos exitosamente',
      services: result.services,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }

  @Get('nearby/search')
  @ApiOperation({ summary: 'Listar servicios cercanos a una coordenada' })
  @ApiResponse({ status: 200, description: 'Servicios cercanos obtenidos' })
  async listNearbyServices(
    @Query() query: ServiceListQueryDto,
  ) {
    if (query.nearLat === undefined || query.nearLng === undefined) {
      throw new BadRequestException('nearLat y nearLng son requeridos para búsqueda cercana');
    }

    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      q: query.q,
      category: query.category,
      location: query.location,
      type: query.type,
      intent: query.intent,
      status: query.status,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      nearLat: query.nearLat,
      nearLng: query.nearLng,
      radiusKm: query.radiusKm || 10,
      userId: query.userId,
    };

    const result = await this.listServicesUseCase.execute({ query: queryWithDefaults });
    return {
      message: 'Servicios cercanos obtenidos exitosamente',
      services: result.services,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }


  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID con información completa' })
  @ApiResponse({ status: 200, description: 'Servicio obtenido' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async getService(@Param('id', ParseIntPipe) id: number) {
    // Use the repository instead of direct Prisma call
    const serviceData = await this.prisma.service.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        detailedDescription: true,
        duration: true,
        location: true,
        availability: true,
        category: true,
        type: true,
        intent: true,
        status: true,
        price: true,
        imageUrl: true, // Include imageUrl
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            location: true,
            bio: true,
            skills: true,
            createdAt: true,
          }
        },
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10,
        },
        _count: {
          select: {
            ratings: true,
            exchanges: true,
          }
        }
      },
    });

    if (!serviceData) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Calculate average rating
    // Get total count and average from database for accuracy
    const ratingsStats = await this.prisma.rating.aggregate({
      where: { serviceId: id },
      _avg: { score: true },
      _count: { id: true },
    });

    const averageRating = ratingsStats._avg.score ? Number(ratingsStats._avg.score.toFixed(1)) : 0;
    const totalRatingsCount = ratingsStats._count.id;

    const serviceWithMeta = serviceData as typeof serviceData & {
      imageUrl?: string | null;
      _count?: { exchanges?: number };
    };

    return {
      message: 'Servicio obtenido exitosamente',
      service: {
        ...serviceWithMeta,
        imageUrl: serviceWithMeta.imageUrl || null,
        averageRating,
        totalRatings: totalRatingsCount,
        totalExchanges: serviceWithMeta._count?.exchanges || 0,
      }
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un servicio por ID' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar este servicio' })
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const { userId } = this.getAuthenticatedUser(req);
    
    const result = await this.updateServiceUseCase.execute({ id, data: updateServiceDto, userId });
    return { message: 'Servicio actualizado exitosamente', service: result.service.toContract() };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un servicio por ID' })
  @ApiResponse({ status: 204, description: 'Servicio eliminado' })
  @ApiResponse({ status: 403, description: 'No autorizado para eliminar este servicio' })
  async deleteService(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const { userId } = this.getAuthenticatedUser(req);
    
    await this.deleteServiceUseCase.execute({ id, userId });
    return { message: 'Servicio eliminado exitosamente' };
  }
}
