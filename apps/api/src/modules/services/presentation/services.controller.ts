import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { createZodDto } from '@anatine/zod-nestjs';
import { ServiceCreateSchema, ServiceListQuerySchema } from '@comparte-tu-tiempo/contracts';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// DTOs generados desde Zod
export class CreateServiceDto extends createZodDto(ServiceCreateSchema) {}
export class ServiceListQueryDto extends createZodDto(ServiceListQuerySchema) {}

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly listServicesUseCase: ListServicesUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  @ApiResponse({ status: 201, description: 'Servicio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id || 1; // Temporal para testing
    const result = await this.createServiceUseCase.execute({
      data: createServiceDto,
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
      city: query.city,
      type: query.type,
      status: query.status,
    };

    const result = await this.listServicesUseCase.execute({ query: queryWithDefaults });

    return {
      message: 'Servicios obtenidos exitosamente',
      ...result.services,
    };
  }
}
