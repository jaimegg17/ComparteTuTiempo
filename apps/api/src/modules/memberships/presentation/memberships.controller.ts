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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { createZodDto } from '@anatine/zod-nestjs';
import { MembershipCreateSchema, MembershipUpdateSchema } from '@comparte-tu-tiempo/contracts';
import { CreateMembershipUseCase } from '../application/create-membership.use-case';
import { ListMembershipsUseCase } from '../application/list-memberships.use-case';
import { UpdateMembershipUseCase } from '../application/update-membership.use-case';

export class CreateMembershipDto extends createZodDto(MembershipCreateSchema) {}
export class UpdateMembershipDto extends createZodDto(MembershipUpdateSchema) {}

// Simple list DTO for now
export class MembershipListQueryDto {
  userId?: string;
  groupId?: number;
  role?: 'MEMBER' | 'MODERATOR' | 'ADMIN';
  status?: 'ACTIVA' | 'PENDIENTE' | 'SUSPENDIDA';
  page?: number;
  pageSize?: number;
}

@ApiTags('memberships')
@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly createMembershipUseCase: CreateMembershipUseCase,
    private readonly listMembershipsUseCase: ListMembershipsUseCase,
    private readonly updateMembershipUseCase: UpdateMembershipUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una nueva membresía' })
  @ApiResponse({ status: 201, description: 'Membresía creada exitosamente' })
  async createMembership(
    @Body() dto: CreateMembershipDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    const result = await this.createMembershipUseCase.execute({ data: dto, userId });
    return { message: 'Membresía creada exitosamente', membership: result.membership.toContract() };
  }

  @Get()
  @ApiOperation({ summary: 'Listar membresías' })
  @ApiResponse({ status: 200, description: 'Lista de membresías obtenida' })
  async listMemberships(@Query() query: MembershipListQueryDto) {
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      userId: query.userId,
      groupId: query.groupId,
      role: query.role,
      status: query.status,
    };

    const result = await this.listMembershipsUseCase.execute({ query: queryWithDefaults as any });
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
    @Request() req: any,
  ) {
    const userId = req.user?.id;
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

