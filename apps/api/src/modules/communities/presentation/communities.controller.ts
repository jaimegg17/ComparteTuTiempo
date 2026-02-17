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
  Logger
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateCommunityUseCase } from '../application/create-community.use-case';
import { ListCommunitiesUseCase } from '../application/list-communities.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { PrismaService } from '@/common/prisma/prisma.service';

// DTOs con class-validator para compatibilidad con ValidationPipe global
export class CreateCommunityDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsBoolean()
  @Type(() => Boolean)
  isPrivate!: boolean;
}

export class UpdateCommunityDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPrivate?: boolean;
}

export class CommunityListQueryDto {
  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPrivate?: boolean;

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

@ApiTags('communities')
@Controller('communities')
export class CommunitiesController {
  private readonly logger = new Logger(CommunitiesController.name);

  constructor(
    private readonly createCommunityUseCase: CreateCommunityUseCase,
    private readonly listCommunitiesUseCase: ListCommunitiesUseCase,
    private readonly prisma: PrismaService,
  ) {
    this.logger.log('CommunitiesController initialized');
  }

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
    const userId = req.user?.sub || req.user?.id;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const result = await this.createCommunityUseCase.execute({
      data: { ...createCommunityDto, creatorId: userId },
      userId,
    });

    return {
      message: 'Comunidad creada exitosamente',
      community: result.community.toContract(),
    };
  }

  @Get('public')
  @ApiOperation({ summary: 'Listar solo comunidades públicas' })
  @ApiResponse({ status: 200, description: 'Lista de comunidades públicas obtenida' })
  async listPublicCommunities() {
    try {
      const where = { isPrivate: false };
      const [prismaCommunities, total] = await Promise.all([
        this.prisma.community.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.community.count({ where }),
      ]);

      const communities = prismaCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isPrivate: c.isPrivate,
        creatorId: c.creatorId,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));

      return {
        message: 'Comunidades públicas obtenidas exitosamente',
        communities,
        total,
      };
    } catch (error) {
      this.logger.error('Error listing public communities:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar comunidades con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de comunidades obtenida' })
  async listCommunities(@Query() query: CommunityListQueryDto) {
    this.logger.log('listCommunities called with query:', query);
    
    try {
      // Parse query parameters - they come as strings from query string
      let isPrivate: boolean | undefined;
      if (query.isPrivate !== undefined && query.isPrivate !== null) {
        if (typeof query.isPrivate === 'string') {
          isPrivate = query.isPrivate === 'true' || query.isPrivate === '1';
        } else {
          isPrivate = Boolean(query.isPrivate);
        }
      }

      // Asegurar que page y pageSize estén presentes y sean números
      const page = query.page ? Number(query.page) : 1;
      const pageSize = query.pageSize ? Number(query.pageSize) : 20;

      const queryWithDefaults = {
        page: isNaN(page) ? 1 : Math.max(1, Math.floor(page)),
        pageSize: isNaN(pageSize) ? 20 : Math.max(1, Math.min(100, Math.floor(pageSize))),
        creatorId: query.creatorId,
        isPrivate,
      };

      this.logger.log('Query with defaults:', queryWithDefaults);

      // Build where clause for direct Prisma query
      const where: any = {};
      if (queryWithDefaults.creatorId) where.creatorId = queryWithDefaults.creatorId;
      if (queryWithDefaults.isPrivate !== undefined) where.isPrivate = queryWithDefaults.isPrivate;

      const skip = (queryWithDefaults.page - 1) * queryWithDefaults.pageSize;

      this.logger.log('Executing Prisma query with where:', where);

      // Direct Prisma query to test if it works
      const [prismaCommunities, total] = await Promise.all([
        this.prisma.community.findMany({
          where,
          skip,
          take: queryWithDefaults.pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.community.count({ where }),
      ]);

      this.logger.log(`Found ${prismaCommunities.length} communities, total: ${total}`);

      // Map to contract format
      const communities = prismaCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isPrivate: c.isPrivate,
        creatorId: c.creatorId,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }));

      const totalPages = Math.ceil(total / queryWithDefaults.pageSize);

      const response = {
        message: 'Comunidades obtenidas exitosamente',
        communities,
        total,
        page: queryWithDefaults.page,
        pageSize: queryWithDefaults.pageSize,
        totalPages,
      };

      this.logger.log('Returning response:', response);
      return response;
    } catch (error) {
      this.logger.error('Error listing communities:', error);
      this.logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una comunidad por ID' })
  @ApiParam({ name: 'id', description: 'ID de la comunidad' })
  @ApiResponse({ status: 200, description: 'Comunidad obtenida' })
  @ApiResponse({ status: 404, description: 'Comunidad no encontrada' })
  async getCommunity(@Param('id', ParseIntPipe) id: number) {
    try {
      const community = await this.prisma.community.findUnique({
        where: { id },
      });

      if (!community) {
        return {
          statusCode: 404,
          message: 'Comunidad no encontrada',
        };
      }

      return {
        message: 'Comunidad obtenida exitosamente',
        community: {
          id: community.id,
          name: community.name,
          description: community.description,
          isPrivate: community.isPrivate,
          creatorId: community.creatorId,
          createdAt: community.createdAt.toISOString(),
          updatedAt: community.updatedAt.toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error getting community:', error);
      throw error;
    }
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
