import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, ParseIntPipe, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, MinLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceCreateSchema, ServiceListQuerySchema } from '@comparte-tu-tiempo/contracts';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { GetServiceUseCase } from '../application/get-service.use-case';
import { UpdateServiceUseCase } from '../application/update-service.use-case';
import { DeleteServiceUseCase } from '../application/delete-service.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { PrismaService } from '@/common/prisma/prisma.service';

// DTO con validación completa
export class CreateServiceDto {
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  title: string;

  @IsString()
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  description: string;

  @IsNumber()
  @Min(1, { message: 'La duración debe ser positiva' })
  duration: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsEnum(['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS'])
  category: 'EDUCACION' | 'HOGAR' | 'TECNOLOGIA' | 'SALUD' | 'DEPORTES' | 'ARTE' | 'OTROS';

  @IsEnum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO'])
  type: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDO';

  @IsNumber()
  @Min(1, { message: 'El precio debe ser positivo' })
  price: number;
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
  @IsEnum(['ACTIVO', 'INACTIVO', 'COMPLETADO'])
  status?: 'ACTIVO' | 'INACTIVO' | 'COMPLETADO';
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;
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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createService(
    @Body() body: any, // Temporal: sin validación estricta
    @Request() req: any,
  ) {
    // Usar userId del JWT o un fallback temporal para testing
    let userId = req.user?.sub || 'auth0|test-user-1';
    
    // Upsert user if doesn't exist
    if (userId) {
      await this.prisma.user.upsert({
        where: { id: userId },
        update: {},  // No actualizar nada si ya existe
        create: {
          id: userId,
          email: req.user?.email || `${userId}@example.com`,
          password: 'auth0-user', // Placeholder password for Auth0 users
          name: req.user?.name || 'Usuario',
          timeCredits: 0, // Default time credits for new users
        },
      });
    }
    
    const result = await this.createServiceUseCase.execute({
      data: body,
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
  async listServices(@Query() query: ServiceListQueryDto) {
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      q: query.q,
      category: query.category,
      location: query.location,
      type: query.type,
      status: query.status,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    };

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

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID con información completa' })
  @ApiResponse({ status: 200, description: 'Servicio obtenido' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async getService(@Param('id', ParseIntPipe) id: number) {
    // Get raw service data with relations
    const serviceData = await this.prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            location: true,
            bio: true,
            skills: true,
            timeCredits: true,
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
      throw new Error('Servicio no encontrado');
    }

    // Calculate average rating
    const avgRating = serviceData.ratings.length > 0
      ? serviceData.ratings.reduce((sum, r) => sum + r.score, 0) / serviceData.ratings.length
      : 0;

    return { 
      message: 'Servicio obtenido exitosamente', 
      service: {
        ...serviceData,
        averageRating: Number(avgRating.toFixed(1)),
        totalRatings: serviceData._count.ratings,
        totalExchanges: serviceData._count.exchanges,
      }
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un servicio por ID' })
  @ApiResponse({ status: 200, description: 'Servicio actualizado' })
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'auth0|test-user-1'; // Fallback para testing
    const result = await this.updateServiceUseCase.execute({ id, data, userId });
    return { message: 'Servicio actualizado exitosamente', service: result.service.toContract() };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un servicio por ID' })
  @ApiResponse({ status: 204, description: 'Servicio eliminado' })
  async deleteService(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user?.sub || 'auth0|test-user-1'; // Fallback para testing
    await this.deleteServiceUseCase.execute({ id, userId });
    return { message: 'Servicio eliminado exitosamente' };
  }
}
