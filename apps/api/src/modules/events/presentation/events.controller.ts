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
import { PrismaService } from '@/common/prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IsDateString, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import type { EventListQuery } from '@comparte-tu-tiempo/contracts';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsDateString()
  date!: string | Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @IsNumber()
  @Type(() => Number)
  communityId!: number;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string | Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity?: number;
}

export class EventListQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  communityId?: number;

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
  communityId: query.communityId,
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
    private readonly prisma: PrismaService,
  ) {}

  private getAuthenticatedUserId(req: { user?: { sub?: string; id?: string } }): string {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }

  private async canManageCommunity(communityId: number, userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role === 'ADMIN') return true;

    const membership = await this.prisma.communityMembership.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
      select: { role: true, status: true },
    });

    return membership?.role === 'OWNER' && membership?.status === 'ACTIVE';
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
    if (!(await this.canManageCommunity(createEventDto.communityId, userId))) {
      throw new ForbiddenException('No autorizado para crear eventos en esta comunidad');
    }
    const result = await this.createEventUseCase.execute({
      data: { ...createEventDto, date: new Date(createEventDto.date), creatorId: userId },
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

  @Get('me/registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis inscripciones a eventos' })
  @ApiResponse({ status: 200, description: 'Inscripciones obtenidas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async listMyRegistrations(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);

    const registrations = await this.prisma.eventRegistration.findMany({
      where: { userId },
      orderBy: { registeredAt: 'desc' },
      select: {
        eventId: true,
      },
    });

    return {
      message: 'Inscripciones obtenidas exitosamente',
      registeredEventIds: registrations.map((registration) => registration.eventId),
    };
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscribirse en un evento' })
  @ApiResponse({ status: 201, description: 'Inscripción realizada' })
  @ApiResponse({ status: 400, description: 'Aforo completo o inscripción inválida' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async registerForEvent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (typeof event.capacity === 'number' && event._count.registrations >= event.capacity) {
      throw new ForbiddenException('El evento ha alcanzado su aforo máximo');
    }

    await this.prisma.eventRegistration.upsert({
      where: {
        eventId_userId: {
          eventId: id,
          userId,
        },
      },
      update: {},
      create: {
        eventId: id,
        userId,
      },
    });

    await this.prisma.userNotification.create({
      data: {
        userId,
        type: 'EVENT_REGISTRATION',
        title: 'Inscripción confirmada',
        body: `Te has apuntado al evento "${event.title}".`,
        link: `/communities/${event.communityId}`,
      },
    });

    const registrationsCount = await this.prisma.eventRegistration.count({
      where: { eventId: id },
    });

    return {
      message: 'Inscripción realizada exitosamente',
      eventId: id,
      registrationsCount,
    };
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar inscripción a un evento' })
  @ApiResponse({ status: 200, description: 'Inscripción cancelada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async unregisterFromEvent(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        title: true,
        communityId: true,
      },
    });

    await this.prisma.eventRegistration.deleteMany({
      where: {
        eventId: id,
        userId,
      },
    });

    if (event) {
      await this.prisma.userNotification.create({
        data: {
          userId,
          type: 'EVENT_UNREGISTRATION',
          title: 'Inscripción cancelada',
          body: `Has cancelado tu inscripción al evento "${event.title}".`,
          link: `/communities/${event.communityId}`,
        },
      });
    }

    const registrationsCount = await this.prisma.eventRegistration.count({
      where: { eventId: id },
    });

    return {
      message: 'Inscripción cancelada exitosamente',
      eventId: id,
      registrationsCount,
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
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const existing = await this.prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (!(await this.canManageCommunity(existing.communityId, userId))) {
      throw new ForbiddenException('No autorizado para actualizar este evento');
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...(updateEventDto.title !== undefined ? { title: updateEventDto.title } : {}),
        ...(updateEventDto.description !== undefined ? { description: updateEventDto.description } : {}),
        ...(updateEventDto.date !== undefined ? { date: new Date(updateEventDto.date) } : {}),
        ...(updateEventDto.location !== undefined ? { location: updateEventDto.location } : {}),
        ...(updateEventDto.capacity !== undefined ? { capacity: updateEventDto.capacity } : {}),
      },
    });

    return {
      message: 'Evento actualizado exitosamente',
      event: updated,
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
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const existing = await this.prisma.event.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (!(await this.canManageCommunity(existing.communityId, userId))) {
      throw new ForbiddenException('No autorizado para eliminar este evento');
    }

    await this.prisma.event.delete({ where: { id } });

    return {
      message: 'Evento eliminado exitosamente',
      event: { id },
    };
  }
}
