import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { createZodDto } from '@anatine/zod-nestjs';
import { 
  ExchangeCreateSchema, 
  ExchangeUpdateSchema, 
  ExchangeListQuerySchema 
} from '@comparte-tu-tiempo/contracts';
import { CreateExchangeUseCase } from '../application/create-exchange.use-case';
import { ListExchangesUseCase } from '../application/list-exchanges.use-case';
import { UpdateExchangeUseCase } from '../application/update-exchange.use-case';
import { GetExchangeUseCase } from '../application/get-exchange.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// DTOs generados desde Zod
export class CreateExchangeDto extends createZodDto(ExchangeCreateSchema) {}
export class UpdateExchangeDto extends createZodDto(ExchangeUpdateSchema) {}

// Simple query DTO without validation for now
export class ExchangeListQueryDto {
  requestedById?: string;
  offeredById?: string;
  serviceId?: number;
  state?: string;
  page?: number;
  pageSize?: number;
}

@ApiTags('exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(
    private readonly createExchangeUseCase: CreateExchangeUseCase,
    private readonly listExchangesUseCase: ListExchangesUseCase,
    private readonly updateExchangeUseCase: UpdateExchangeUseCase,
    private readonly getExchangeUseCase: GetExchangeUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicitar un servicio (crear intercambio)' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o créditos insuficientes' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createExchange(
    @Body() body: any, // Temporal: sin validación estricta
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // Ensure requestedById is set to the current user
    const exchangeData = {
      ...body,
      requestedById: userId,
    };
    
    const result = await this.createExchangeUseCase.execute({
      data: exchangeData,
      userId,
    });

    return {
      message: 'Solicitud de servicio creada exitosamente',
      exchange: result.exchange.toContract(),
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis intercambios (solicitudes y ofertas)' })
  @ApiResponse({ status: 200, description: 'Lista de intercambios obtenida' })
  async listExchanges(
    @Query() query: ExchangeListQueryDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'auth0|test-user-1';
    
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      requestedById: query.requestedById,
      offeredById: query.offeredById,
      serviceId: query.serviceId,
      state: query.state as any,
    };

    const result = await this.listExchangesUseCase.execute({ 
      query: queryWithDefaults,
      userId 
    });

    return {
      message: 'Intercambios obtenidos exitosamente',
      ...result.exchanges,
      exchanges: result.exchanges.exchanges.map(exchange => exchange.toContract()),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener un intercambio específico' })
  @ApiParam({ name: 'id', description: 'ID del intercambio' })
  @ApiResponse({ status: 200, description: 'Intercambio obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Intercambio no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado para ver este intercambio' })
  async getExchange(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'auth0|test-user-1';
    const result = await this.getExchangeUseCase.execute({ id, userId });

    return {
      message: 'Intercambio obtenido exitosamente',
      exchange: result.exchange.toContract(),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aceptar/Rechazar/Completar un intercambio' })
  @ApiParam({ name: 'id', description: 'ID del intercambio' })
  @ApiResponse({ status: 200, description: 'Intercambio actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o créditos insuficientes' })
  @ApiResponse({ status: 404, description: 'Intercambio no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar este intercambio' })
  async updateExchange(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any, // Temporal: sin validación estricta
    @Request() req: any,
  ) {
    const userId = req.user?.sub || 'auth0|test-user-1';
    const result = await this.updateExchangeUseCase.execute({
      id,
      data: body,
      userId,
    });

    return {
      message: 'Intercambio actualizado exitosamente',
      exchange: result.exchange.toContract(),
    };
  }
}
