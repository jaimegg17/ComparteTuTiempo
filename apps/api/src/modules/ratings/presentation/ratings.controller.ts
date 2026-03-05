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
  HttpStatus,
  UnauthorizedException
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateRatingUseCase } from '../application/create-rating.use-case';
import { ListRatingsUseCase } from '../application/list-ratings.use-case';
import { UpdateRatingUseCase } from '../application/update-rating.use-case';
import { DeleteRatingUseCase } from '../application/delete-rating.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { createZodDto } from '@anatine/zod-nestjs';
import { 
  RatingCreateSchema, 
  RatingUpdateSchema, 
  RatingListQuerySchema 
} from '@comparte-tu-tiempo/contracts';

// DTOs generados desde Zod
export class CreateRatingDto extends createZodDto(RatingCreateSchema) {}
export class UpdateRatingDto extends createZodDto(RatingUpdateSchema) {}
export class RatingListQueryDto extends createZodDto(RatingListQuerySchema) {}

@ApiTags('ratings')
@Controller('ratings')
export class RatingsController {
  constructor(
    private readonly createRatingUseCase: CreateRatingUseCase,
    private readonly listRatingsUseCase: ListRatingsUseCase,
    private readonly updateRatingUseCase: UpdateRatingUseCase,
    private readonly deleteRatingUseCase: DeleteRatingUseCase,
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
  @ApiOperation({ summary: 'Crear una nueva valoración' })
  @ApiResponse({ status: 201, description: 'Valoración creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe una valoración para este servicio' })
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const result = await this.createRatingUseCase.execute({
      data: { ...createRatingDto, userId },
      userId,
    });

    return {
      message: 'Valoración creada exitosamente',
      rating: result.rating.toContract(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar valoraciones con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de valoraciones obtenida' })
  async listRatings(@Query() query: RatingListQueryDto) {
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      userId: query.userId,
      serviceId: query.serviceId,
      score: query.score,
    };

    const result = await this.listRatingsUseCase.execute({ 
      query: queryWithDefaults 
    });

    return {
      message: 'Valoraciones obtenidas exitosamente',
      ...result.ratings,
      ratings: result.ratings.ratings.map(rating => rating.toContract()),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una valoración por ID' })
  @ApiParam({ name: 'id', description: 'ID de la valoración' })
  @ApiResponse({ status: 200, description: 'Valoración actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Valoración no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar esta valoración' })
  async updateRating(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const result = await this.updateRatingUseCase.execute({
      id,
      data: updateRatingDto,
      userId,
    });

    return {
      message: 'Valoración actualizada exitosamente',
      rating: result.rating.toContract(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una valoración por ID' })
  @ApiParam({ name: 'id', description: 'ID de la valoración' })
  @ApiResponse({ status: 204, description: 'Valoración eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Valoración no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado para eliminar esta valoración' })
  async deleteRating(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);

    await this.deleteRatingUseCase.execute({ id, userId });
  }
}
