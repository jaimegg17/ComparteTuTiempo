import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, ParseIntPipe, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { createZodDto } from '@anatine/zod-nestjs';
import { ServiceCreateSchema, ServiceListQuerySchema } from '@comparte-tu-tiempo/contracts';
import { CreateServiceUseCase } from '../application/create-service.use-case';
import { ListServicesUseCase } from '../application/list-services.use-case';
import { GetServiceUseCase } from '../application/get-service.use-case';
import { UpdateServiceUseCase } from '../application/update-service.use-case';
import { DeleteServiceUseCase } from '../application/delete-service.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// DTOs generados desde Zod
export class CreateServiceDto extends createZodDto(ServiceCreateSchema) {}

// Simple query DTO without validation for now
export class ServiceListQueryDto {
  q?: string;
  category?: string;
  city?: string;
  type?: string;
  status?: string;
  page?: number;
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
      category: query.category as any, // Cast to avoid type issues
      city: query.city,
      type: query.type as any, // Cast to avoid type issues
      status: query.status as any, // Cast to avoid type issues
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
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  @ApiResponse({ status: 200, description: 'Servicio obtenido' })
  @ApiResponse({ status: 404, description: 'Servicio no encontrado' })
  async getService(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getServiceUseCase.execute({ id });
    return { message: 'Servicio obtenido exitosamente', service: result.service.toContract() };
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
    const userId = req.user?.id;
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
    const userId = req.user?.id;
    await this.deleteServiceUseCase.execute({ id, userId });
    return { message: 'Servicio eliminado exitosamente' };
  }
}
