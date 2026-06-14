import { 
  Controller, 
  Get, 
  Post, 
  Patch,
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
  Logger,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, Min, IsUrl, IsArray, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Prisma } from '@prisma/client';
import type {
  CommunityMembership,
  CommunityMembershipRole,
  CommunityMembershipStatus,
  CommunityResource,
  CommunityVerificationStatus,
  CommunityKind,
} from '@comparte-tu-tiempo/contracts';
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

  @IsOptional()
  @IsUrl()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @IsOptional()
  resources?: CommunityResource[];

  @IsOptional()
  @IsString()
  kind?: CommunityKind;

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
  @IsUrl()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topics?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[];

  @IsOptional()
  resources?: CommunityResource[];

  @IsOptional()
  @IsString()
  verificationStatus?: CommunityVerificationStatus;

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
  @IsString()
  kind?: CommunityKind;

  @IsOptional()
  @IsString()
  verificationStatus?: CommunityVerificationStatus;

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

export class UpdateCommunityMembershipDto {
  @IsOptional()
  @IsString()
  role?: CommunityMembershipRole;

  @IsOptional()
  @IsString()
  status?: CommunityMembershipStatus;
}

type AuthenticatedRequest = { user?: { sub?: string; id?: string } };

@ApiTags('communities')
@Controller('communities')
export class CommunitiesController {
  private readonly logger = new Logger(CommunitiesController.name);

  constructor(
    private readonly createCommunityUseCase: CreateCommunityUseCase,
    private readonly listCommunitiesUseCase: ListCommunitiesUseCase,
    private readonly prisma: PrismaService,
  ) {}

  private getAuthenticatedUserId(req: AuthenticatedRequest): string {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }

  private async getCurrentUserRole(userId: string): Promise<'USER' | 'MODERATOR' | 'ADMIN'> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role ?? 'USER';
  }

  private async ensureAdmin(userId: string): Promise<void> {
    const role = await this.getCurrentUserRole(userId);
    if (role !== 'ADMIN') {
      throw new ForbiddenException('Solo un administrador puede realizar esta acción');
    }
  }

  private async canManageCommunity(communityId: number, userId: string): Promise<boolean> {
    const globalRole = await this.getCurrentUserRole(userId);
    if (globalRole === 'ADMIN') return true;

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

  private serializeCommunity(community: {
    id: number;
    name: string;
    description: string | null;
    imageUrl: string | null;
    topics: string[];
    rules: string[];
    resources: Prisma.JsonValue;
    kind: 'COMMUNITY' | 'ORGANIZATION';
    verificationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    isPrivate: boolean;
    creatorId: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      imageUrl: community.imageUrl,
      topics: community.topics,
      rules: community.rules,
      resources: Array.isArray(community.resources) ? community.resources : [],
      kind: community.kind,
      verificationStatus: community.verificationStatus,
      isPrivate: community.isPrivate,
      creatorId: community.creatorId,
      createdAt: community.createdAt.toISOString(),
      updatedAt: community.updatedAt.toISOString(),
    };
  }

  private serializeMembership(membership: {
    id: number;
    communityId: number;
    userId: string;
    role: 'OWNER' | 'MEMBER';
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    joinedAt: Date;
    user?: { name: string; imageUrl: string | null } | null;
  }): CommunityMembership {
    return {
      id: membership.id,
      communityId: membership.communityId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
      userName: membership.user?.name ?? null,
      userImageUrl: membership.user?.imageUrl ?? null,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva comunidad' })
  @ApiResponse({ status: 201, description: 'Comunidad creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createCommunity(
    @Body() createCommunityDto: CreateCommunityDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    
    const result = await this.createCommunityUseCase.execute({
      data: {
        ...createCommunityDto,
        topics: createCommunityDto.topics ?? [],
        rules: createCommunityDto.rules ?? [],
        resources: createCommunityDto.resources ?? [],
        kind: createCommunityDto.kind ?? 'COMMUNITY',
        creatorId: userId,
      },
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
      const where: Prisma.CommunityWhereInput = {
        isPrivate: false,
        OR: [
          { kind: 'COMMUNITY' },
          { kind: 'ORGANIZATION', verificationStatus: 'APPROVED' },
        ],
      };
      const [prismaCommunities, total] = await Promise.all([
        this.prisma.community.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.community.count({ where }),
      ]);

      const communities = prismaCommunities.map((c) => this.serializeCommunity(c));

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
    try {
      // Asegurar que page y pageSize estén presentes y sean números
      const queryWithDefaults = {
        page: query.page || 1,
        pageSize: query.pageSize || 20,
        creatorId: query.creatorId,
        isPrivate: query.isPrivate,
        kind: query.kind,
        verificationStatus: query.verificationStatus,
      };

      // Build where clause for direct Prisma query
      const where: Prisma.CommunityWhereInput = {};
      if (queryWithDefaults.creatorId) where.creatorId = queryWithDefaults.creatorId;
      if (queryWithDefaults.isPrivate !== undefined) where.isPrivate = queryWithDefaults.isPrivate;
      if (queryWithDefaults.kind) where.kind = queryWithDefaults.kind;
      if (queryWithDefaults.verificationStatus) {
        where.verificationStatus = queryWithDefaults.verificationStatus;
      } else if (queryWithDefaults.kind === 'ORGANIZATION' && !queryWithDefaults.creatorId) {
        where.verificationStatus = 'APPROVED';
      }

      const skip = (queryWithDefaults.page - 1) * queryWithDefaults.pageSize;

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

      // Map to contract format
      const communities = prismaCommunities.map((c) => this.serializeCommunity(c));

      const totalPages = Math.ceil(total / queryWithDefaults.pageSize);

      const response = {
        message: 'Comunidades obtenidas exitosamente',
        communities,
        total,
        page: queryWithDefaults.page,
        pageSize: queryWithDefaults.pageSize,
        totalPages,
      };

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
        community: this.serializeCommunity(community),
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
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const existing = await this.prisma.community.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    if (!(await this.canManageCommunity(id, userId)) && existing.creatorId !== userId) {
      throw new ForbiddenException('No autorizado para actualizar esta comunidad');
    }

    const updated = await this.prisma.community.update({
      where: { id },
      data: {
        ...(updateCommunityDto.name !== undefined ? { name: updateCommunityDto.name } : {}),
        ...(updateCommunityDto.description !== undefined
          ? { description: updateCommunityDto.description }
          : {}),
        ...(updateCommunityDto.imageUrl !== undefined
          ? { imageUrl: updateCommunityDto.imageUrl }
          : {}),
        ...(updateCommunityDto.topics !== undefined
          ? { topics: updateCommunityDto.topics }
          : {}),
        ...(updateCommunityDto.rules !== undefined
          ? { rules: updateCommunityDto.rules }
          : {}),
        ...(updateCommunityDto.resources !== undefined
          ? { resources: updateCommunityDto.resources as Prisma.InputJsonValue }
          : {}),
        ...(updateCommunityDto.verificationStatus !== undefined
          ? { verificationStatus: updateCommunityDto.verificationStatus }
          : {}),
        ...(updateCommunityDto.isPrivate !== undefined
          ? { isPrivate: updateCommunityDto.isPrivate }
          : {}),
      },
    });

    return {
      message: 'Comunidad actualizada exitosamente',
      community: this.serializeCommunity(updated),
    };
  }

  @Get('admin/organizations/pending')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar organizaciones pendientes de revisión' })
  async listPendingOrganizations(@Request() req: AuthenticatedRequest) {
    const userId = this.getAuthenticatedUserId(req);
    await this.ensureAdmin(userId);

    const communities = await this.prisma.community.findMany({
      where: {
        kind: 'ORGANIZATION',
        verificationStatus: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      message: 'Organizaciones pendientes obtenidas correctamente',
      communities: communities.map((community) => this.serializeCommunity(community)),
    };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aprobar una organización' })
  async approveOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    await this.ensureAdmin(userId);

    const existing = await this.prisma.community.findUnique({ where: { id } });
    if (!existing || existing.kind !== 'ORGANIZATION') {
      throw new NotFoundException('Organización no encontrada');
    }

    const updated = await this.prisma.community.update({
      where: { id },
      data: { verificationStatus: 'APPROVED' },
    });

    return {
      message: 'Organización aprobada correctamente',
      community: this.serializeCommunity(updated),
    };
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechazar una organización' })
  async rejectOrganization(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    await this.ensureAdmin(userId);

    const existing = await this.prisma.community.findUnique({ where: { id } });
    if (!existing || existing.kind !== 'ORGANIZATION') {
      throw new NotFoundException('Organización no encontrada');
    }

    const updated = await this.prisma.community.update({
      where: { id },
      data: { verificationStatus: 'REJECTED' },
    });

    return {
      message: 'Organización rechazada correctamente',
      community: this.serializeCommunity(updated),
    };
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar miembros de una comunidad' })
  async listCommunityMembers(@Param('id', ParseIntPipe) id: number) {
    const memberships = await this.prisma.communityMembership.findMany({
      where: { communityId: id },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
    });

    return {
      message: 'Miembros obtenidos exitosamente',
      memberships: memberships.map((membership) => this.serializeMembership(membership)),
    };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unirse a una comunidad' })
  async joinCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const community = await this.prisma.community.findUnique({ where: { id } });

    if (!community) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    const membership = await this.prisma.communityMembership.upsert({
      where: {
        communityId_userId: {
          communityId: id,
          userId,
        },
      },
      update: {
        status: community.isPrivate ? 'PENDING' : 'ACTIVE',
      },
      create: {
        communityId: id,
        userId,
        role: 'MEMBER',
        status: community.isPrivate ? 'PENDING' : 'ACTIVE',
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return {
      message: community.isPrivate ? 'Solicitud enviada correctamente' : 'Te has unido a la comunidad',
      membership: this.serializeMembership(membership),
    };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Salir de una comunidad' })
  async leaveCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);

    const existingMembership = await this.prisma.communityMembership.findUnique({
      where: {
        communityId_userId: {
          communityId: id,
          userId,
        },
      },
    });

    if (!existingMembership) {
      throw new NotFoundException('No eres miembro de esta comunidad');
    }

    if (existingMembership.role === 'OWNER') {
      throw new ForbiddenException('El owner no puede salir de la comunidad sin transferir ownership');
    }

    const membership = await this.prisma.communityMembership.update({
      where: { id: existingMembership.id },
      data: { status: 'SUSPENDED' },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return {
      message: 'Has salido de la comunidad',
      membership: this.serializeMembership(membership),
    };
  }

  @Patch(':id/members/:membershipId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar rol o estado de un miembro de la comunidad' })
  async updateCommunityMember(
    @Param('id', ParseIntPipe) id: number,
    @Param('membershipId', ParseIntPipe) membershipId: number,
    @Body() dto: UpdateCommunityMembershipDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);

    if (!(await this.canManageCommunity(id, userId))) {
      throw new ForbiddenException('No autorizado para gestionar miembros de esta comunidad');
    }

    const membership = await this.prisma.communityMembership.findUnique({
      where: { id: membershipId },
    });

    if (!membership || membership.communityId !== id) {
      throw new NotFoundException('Miembro no encontrado');
    }

    const updatedMembership = await this.prisma.communityMembership.update({
      where: { id: membershipId },
      data: {
        ...(dto.role ? { role: dto.role } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
      include: {
        user: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    return {
      message: 'Miembro actualizado correctamente',
      membership: this.serializeMembership(updatedMembership),
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
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const existing = await this.prisma.community.findUnique({
      where: { id },
      select: { id: true, creatorId: true },
    });

    if (!existing) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    if (!(await this.canManageCommunity(id, userId)) && existing.creatorId !== userId) {
      throw new ForbiddenException('No autorizado para eliminar esta comunidad');
    }

    await this.prisma.community.delete({ where: { id } });
  }
}
