import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Query, 
  Param,
  ParseIntPipe,
  UseGuards, 
  Request,
  UnauthorizedException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateEventUseCase } from '../application/create-event.use-case';
import { ListEventsUseCase } from '../application/list-events.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { EventListQuery } from '@comparte-tu-tiempo/contracts';

// Simple DTOs without Zod for now
export class CreateEventDto {
  title!: string;
  description!: string;
  date!: Date;
  location?: string;
  groupId!: number;
}

export class UpdateEventDto {
  title?: string;
  description?: string;
  date?: Date;
  location?: string;
}

export class EventListQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  communityId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  groupId?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;
}

export const normalizeEventListQuery = (query: EventListQueryDto): EventListQuery => ({
  page: query.page || 1,
  pageSize: query.pageSize || 20,
  groupId: query.groupId ?? query.communityId,
  q: query.q,
  dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
  dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
  location: query.location,
});

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
  ) {}

  private getAuthenticatedUserId(req: { user?: { sub?: string; id?: string } }): string {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const result = await this.createEventUseCase.execute({
      data: { ...createEventDto, creatorId: userId },
      userId,
    });

    return {
      message: 'Evento creado exitosamente',
      event: result.event.toContract(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de eventos obtenida' })
  async listEvents(@Query() query: EventListQueryDto) {
    const queryWithDefaults = normalizeEventListQuery(query);

    const result = await this.listEventsUseCase.execute({
      query: queryWithDefaults,
    });

    return {
      message: 'Eventos obtenidos exitosamente',
      ...result.events,
      events: result.events.events.map(event => event.toContract()),
    };
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Listar eventos próximos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos próximos obtenida' })
  async listUpcomingEvents() {
    // This would need a specific use case for upcoming events
    return {
      message: 'Eventos próximos obtenidos exitosamente',
      events: [],
    };
  }

  @Get('past')
  @ApiOperation({ summary: 'Listar eventos pasados' })
  @ApiResponse({ status: 200, description: 'Lista de eventos pasados obtenida' })
  async listPastEvents() {
    // This would need a specific use case for past events
    return {
      message: 'Eventos pasados obtenidos exitosamente',
      events: [],
    };
  }

  @Get('community/:communityId')
  @ApiOperation({ summary: 'Listar eventos de una comunidad específica' })
  @ApiParam({ name: 'communityId', description: 'ID de la comunidad' })
  @ApiResponse({ status: 200, description: 'Lista de eventos de la comunidad obtenida' })
  async listEventsByCommunity(@Param('communityId', ParseIntPipe) communityId: number) {
    const result = await this.listEventsUseCase.execute({
      query: normalizeEventListQuery({ communityId, page: 1, pageSize: 20 }),
    });

    return {
      message: 'Eventos de la comunidad obtenidos exitosamente',
      ...result.events,
      events: result.events.events.map(event => event.toContract()),
      communityId, // Compatibilidad para clientes legados
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Evento obtenido' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async getEvent(@Param('id', ParseIntPipe) id: number) {
    // This would need a get event use case
    return {
      message: 'Evento obtenido exitosamente',
      event: { id },
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un evento por ID' })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Evento actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar este evento' })
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
  ) {
    // This would need an update event use case
    return {
      message: 'Evento actualizado exitosamente',
      event: { id },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un evento por ID' })
  @ApiParam({ name: 'id', description: 'ID del evento' })
  @ApiResponse({ status: 204, description: 'Evento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado para eliminar este evento' })
  async deleteEvent(
    @Param('id', ParseIntPipe) id: number,
  ) {
    // This would need a delete event use case
    return {
      message: 'Evento eliminado exitosamente',
      event: { id },
    };
  }
}
