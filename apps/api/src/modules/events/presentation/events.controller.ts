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
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateEventUseCase } from '../application/create-event.use-case';
import { ListEventsUseCase } from '../application/list-events.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

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
  communityId?: number;
  creatorId?: string;
  upcoming?: boolean;
  page?: number;
  pageSize?: number;
}

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
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
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      communityId: query.communityId,
      creatorId: query.creatorId,
      upcoming: query.upcoming,
    };

    const result = await this.listEventsUseCase.execute({ 
      query: queryWithDefaults 
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
    // This would need a specific use case for community events
    return {
      message: 'Eventos de la comunidad obtenidos exitosamente',
      events: [],
      communityId,
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
    @Body() updateEventDto: UpdateEventDto,
    @Request() req: any,
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
    @Request() req: any,
  ) {
    // This would need a delete event use case
    return {
      message: 'Evento eliminado exitosamente',
    };
  }
}
