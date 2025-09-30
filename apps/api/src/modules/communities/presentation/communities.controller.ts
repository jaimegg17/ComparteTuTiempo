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
import { CreateCommunityUseCase } from '../application/create-community.use-case';
import { ListCommunitiesUseCase } from '../application/list-communities.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// Simple DTOs without Zod for now
export class CreateCommunityDto {
  name!: string;
  description!: string;
  isPrivate!: boolean;
}

export class UpdateCommunityDto {
  name?: string;
  description?: string;
  isPrivate?: boolean;
}

export class CommunityListQueryDto {
  creatorId?: string;
  isPrivate?: boolean;
  page?: number;
  pageSize?: number;
}

@ApiTags('communities')
@Controller('communities')
export class CommunitiesController {
  constructor(
    private readonly createCommunityUseCase: CreateCommunityUseCase,
    private readonly listCommunitiesUseCase: ListCommunitiesUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva comunidad' })
  @ApiResponse({ status: 201, description: 'Comunidad creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const result = await this.createCommunityUseCase.execute({
      data: { ...createCommunityDto, creatorId: userId },
      userId,
    });

    return {
      message: 'Comunidad creada exitosamente',
      community: result.community.toContract(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar comunidades con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de comunidades obtenida' })
  async listCommunities(@Query() query: CommunityListQueryDto) {
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      creatorId: query.creatorId,
      isPrivate: query.isPrivate,
    };

    const result = await this.listCommunitiesUseCase.execute({ 
      query: queryWithDefaults 
    });

    return {
      message: 'Comunidades obtenidas exitosamente',
      ...result.communities,
      communities: result.communities.communities.map(community => community.toContract()),
    };
  }

  @Get('public')
  @ApiOperation({ summary: 'Listar solo comunidades públicas' })
  @ApiResponse({ status: 200, description: 'Lista de comunidades públicas obtenida' })
  async listPublicCommunities() {
    // This would need a specific use case for public communities
    return {
      message: 'Comunidades públicas obtenidas exitosamente',
      communities: [],
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una comunidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la comunidad' })
  @ApiResponse({ status: 200, description: 'Comunidad obtenida' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  async getCommunity(@Param('id', ParseIntPipe) id: number) {
    // This would need a get community use case
    return {
      message: 'Comunidad obtenida exitosamente',
      community: { id },
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una comunidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la comunidad' })
  @ApiResponse({ status: 200, description: 'Comunidad actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar esta comunidad' })
  async updateCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommunityDto: UpdateCommunityDto,
    @Request() req: any,
  ) {
    // This would need an update community use case
    return {
      message: 'Comunidad actualizada exitosamente',
      community: { id },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una comunidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la comunidad' })
  @ApiResponse({ status: 204, description: 'Comunidad eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  @ApiResponse({ status: 403, description: 'No autorizado para eliminar esta comunidad' })
  async deleteCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    // This would need a delete community use case
    return {
      message: 'Comunidad eliminada exitosamente',
    };
  }
}
