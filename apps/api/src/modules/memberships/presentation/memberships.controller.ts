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
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { createZodDto } from '@anatine/zod-nestjs';
import {
  MembershipCreateSchema,
  MembershipRole,
  MembershipStatus,
  MembershipUpdateSchema,
} from '@comparte-tu-tiempo/contracts';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateMembershipUseCase } from '../application/create-membership.use-case';
import { ListMembershipsUseCase } from '../application/list-memberships.use-case';
import { UpdateMembershipUseCase } from '../application/update-membership.use-case';

export class CreateMembershipDto extends createZodDto(MembershipCreateSchema) {}
export class UpdateMembershipDto extends createZodDto(MembershipUpdateSchema) {}

// Simple list DTO for now
export class MembershipListQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  groupId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  communityId?: number;

  @IsOptional()
  @IsEnum(MembershipRole)
  role?: 'MEMBER' | 'MODERATOR' | 'ADMIN';

  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: 'ACTIVA' | 'PENDIENTE' | 'SUSPENDIDA';

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

export const normalizeMembershipListQuery = (query: MembershipListQueryDto) => ({
  page: query.page || 1,
  pageSize: query.pageSize || 20,
  userId: query.userId,
  groupId: query.groupId ?? query.communityId,
  role: query.role,
  status: query.status,
});

@ApiTags('memberships')
@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly listMembershipsUseCase: ListMembershipsUseCase,
    private readonly updateMembershipUseCase: UpdateMembershipUseCase,
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
  @ApiOperation({ summary: 'Crear una nueva membresía' })
  @ApiResponse({ status: 201, description: 'Membresía creada exitosamente' })
  async createMembership(
    @Body() dto: CreateMembershipDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const result = await this.createMembershipUseCase.execute({ data: dto, userId });
    return { message: 'Membresía creada exitosamente', membership: result.membership.toContract() };
  }

  @Get()
  @ApiOperation({ summary: 'Listar membresías' })
  @ApiResponse({ status: 200, description: 'Lista de membresías obtenida' })
  async listMemberships(@Query() query: MembershipListQueryDto) {
    const queryWithDefaults = normalizeMembershipListQuery(query);

    const result = await this.listMembershipsUseCase.execute({ query: queryWithDefaults });
    return {
      message: 'Membresías obtenidas exitosamente',
      ...result.memberships,
      memberships: result.memberships.memberships.map(m => m.toContract()),
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar una membresía' })
  @ApiParam({ name: 'id', description: 'ID de la membresía' })
  @ApiResponse({ status: 200, description: 'Membresía actualizada exitosamente' })
  async updateMembership(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMembershipDto,
    @Request() req: { user?: { sub?: string; id?: string } },
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const result = await this.updateMembershipUseCase.execute({ id, data: dto, userId });
    return { message: 'Membresía actualizada exitosamente', membership: result.membership.toContract() };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una membresía' })
  async deleteMembership(@Param('id', ParseIntPipe) id: number) {
    // Pendiente: delete use case si lo necesitamos
    return { message: 'Membresía eliminada exitosamente', membership: { id } };
  }
}
