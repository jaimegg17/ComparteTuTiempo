import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  UnauthorizedException,
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  ParseIntPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';
import { ExchangeStatus } from '@comparte-tu-tiempo/contracts';
import { CreateExchangeUseCase } from '../application/create-exchange.use-case';
import { ListExchangesUseCase } from '../application/list-exchanges.use-case';
import { UpdateExchangeUseCase } from '../application/update-exchange.use-case';
import { GetExchangeUseCase } from '../application/get-exchange.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { PrismaService } from '@/common/prisma/prisma.service';

export class CreateExchangeDto {
  @Type(() => Number)
  @IsNumber()
  serviceId: number;

  @IsOptional()
  @IsString()
  offeredById?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  exchangedTime?: number;
}

export class UpdateExchangeDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsEnum(ExchangeStatus)
  state?: (typeof ExchangeStatus)[keyof typeof ExchangeStatus];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  exchangedTime?: number;
}

type AuthenticatedRequest = { user?: { sub?: string; id?: string } };

type ExchangeContract = ReturnType<import('../domain/exchange.entity').ExchangeEntity['toContract']>;

export class ExchangeListQueryDto {
  @IsOptional()
  @IsString()
  requestedById?: string;

  @IsOptional()
  @IsString()
  offeredById?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceId?: number;

  @IsOptional()
  @IsEnum([
    ExchangeStatus.PENDING,
    ExchangeStatus.CONFIRMED,
    ExchangeStatus.IN_PROGRESS,
    ExchangeStatus.COMPLETED,
    ExchangeStatus.CANCELLED,
    ExchangeStatus.DISPUTED,
  ])
  state?: (typeof ExchangeStatus)[keyof typeof ExchangeStatus];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
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
    private readonly prisma: PrismaService,
  ) {}

  private async enrichExchanges(exchanges: ExchangeContract[]) {
    if (exchanges.length === 0) return [];

    const exchangeIds = exchanges.map((exchange) => exchange.id);
    const rows = await this.prisma.exchange.findMany({
      where: { id: { in: exchangeIds } },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            duration: true,
            category: true,
            imageUrl: true,
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        offeredBy: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
      },
    });

    const rowById = new Map(rows.map((row) => [row.id, row]));
    return exchanges.map((exchange) => {
      const row = rowById.get(exchange.id);
      return {
        ...exchange,
        service: row?.service ?? null,
        requestedBy: row?.requestedBy ?? null,
        offeredBy: row?.offeredBy ?? null,
      };
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicitar un servicio (crear intercambio)' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o créditos insuficientes' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createExchange(
    @Body() createExchangeDto: CreateExchangeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    
    const service = await this.prisma.service.findUnique({
      where: { id: createExchangeDto.serviceId },
      select: { id: true, userId: true, intent: true, duration: true, title: true },
    });

    if (!service) {
      throw new UnauthorizedException('Servicio no encontrado');
    }

    if (service.userId === userId) {
      throw new UnauthorizedException('No puedes iniciar un intercambio sobre tu propia publicación');
    }

    const requestedDate = createExchangeDto.date ? new Date(createExchangeDto.date) : new Date(Date.now() + 60_000);
    const safeDate = requestedDate <= new Date() ? new Date(Date.now() + 60_000) : requestedDate;

    const exchangeData = {
      serviceId: service.id,
      date: safeDate,
      exchangedTime: createExchangeDto.exchangedTime || service.duration,
      requestedById: service.intent === 'REQUEST' ? service.userId : userId,
      offeredById: service.intent === 'REQUEST' ? userId : service.userId,
    };
    
    const result = await this.createExchangeUseCase.execute({
      data: exchangeData,
      userId,
    });

    const exchange = result.exchange.toContract();
    const recipientId = exchange.requestedById === userId ? exchange.offeredById : exchange.requestedById;
    await this.prisma.userNotification.create({
      data: {
        userId: recipientId,
        type: 'EXCHANGE_REQUEST',
        title: service.intent === 'REQUEST' ? 'Nueva respuesta a tu solicitud' : 'Nueva solicitud de intercambio',
        body: service.intent === 'REQUEST'
          ? `Una persona se ha ofrecido a ayudarte con “${service.title}”.`
          : `Una persona ha solicitado tu servicio “${service.title}”.`,
        link: `/exchanges/${exchange.id}`,
      },
    }).catch(() => undefined);

    const [enrichedExchange] = await this.enrichExchanges([exchange]);

    return {
      message: 'Solicitud de servicio creada exitosamente',
      exchange: enrichedExchange,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis intercambios (solicitudes y ofertas)' })
  @ApiResponse({ status: 200, description: 'Lista de intercambios obtenida' })
  async listExchanges(
    @Query() query: ExchangeListQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    
    // Ensure page and pageSize are present
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      requestedById: query.requestedById,
      offeredById: query.offeredById,
      serviceId: query.serviceId,
      state: query.state,
    };

    const result = await this.listExchangesUseCase.execute({ 
      query: queryWithDefaults,
      userId 
    });

    const exchanges = result.exchanges.exchanges.map(exchange => exchange.toContract());

    return {
      message: 'Intercambios obtenidos exitosamente',
      ...result.exchanges,
      exchanges: await this.enrichExchanges(exchanges),
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
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const result = await this.getExchangeUseCase.execute({ id, userId });

    const [exchange] = await this.enrichExchanges([result.exchange.toContract()]);

    return {
      message: 'Intercambio obtenido exitosamente',
      exchange,
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
    @Body() updateExchangeDto: UpdateExchangeDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    
    const result = await this.updateExchangeUseCase.execute({
      id,
      data: updateExchangeDto,
      userId,
    });

    return {
      message: 'Intercambio actualizado exitosamente',
      exchange: result.exchange.toContract(),
    };
  }
}
