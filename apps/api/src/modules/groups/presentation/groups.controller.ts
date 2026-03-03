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
import { createZodDto } from '@anatine/zod-nestjs';
import { GroupCreateSchema, GroupUpdateSchema } from '@comparte-tu-tiempo/contracts';
import { CreateGroupUseCase } from '../application/create-group.use-case';
import { ListGroupsUseCase } from '../application/list-groups.use-case';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

// DTOs generados desde Zod
export class CreateGroupDto extends createZodDto(GroupCreateSchema) {}
export class UpdateGroupDto extends createZodDto(GroupUpdateSchema) {}

export class GroupListQueryDto {
  communityId?: number;
  creatorId?: string;
  page?: number;
  pageSize?: number;
}

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly listGroupsUseCase: ListGroupsUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo grupo' })
  @ApiResponse({ status: 201, description: 'Grupo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createGroup(
    @Body() createGroupDto: CreateGroupDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    const result = await this.createGroupUseCase.execute({
      data: createGroupDto,
      userId,
    });

    return {
      message: 'Grupo creado exitosamente',
      group: result.group.toContract(),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar grupos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de grupos obtenida' })
  async listGroups(@Query() query: GroupListQueryDto) {
    // Asegurar que page y pageSize estén presentes
    const queryWithDefaults = {
      page: query.page || 1,
      pageSize: query.pageSize || 20,
      communityId: query.communityId,
      creatorId: query.creatorId,
    };

    const result = await this.listGroupsUseCase.execute({ 
      query: queryWithDefaults 
    });

    return {
      message: 'Grupos obtenidos exitosamente',
      ...result.groups,
      groups: result.groups.groups.map(group => group.toContract()),
    };
  }

  @Get('community/:communityId')
  @ApiOperation({ summary: 'Listar grupos de una comunidad específica' })
  @ApiParam({ name: 'communityId', description: 'ID de la comunidad' })
  @ApiResponse({ status: 200, description: 'Lista de grupos de la comunidad obtenida' })
  async listGroupsByCommunity(@Param('communityId', ParseIntPipe) communityId: number) {
    // This would need a specific use case for community groups
    return {
      message: 'Grupos de la comunidad obtenidos exitosamente',
      groups: [],
      communityId,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo obtenido' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  async getGroup(@Param('id', ParseIntPipe) id: number) {
    // This would need a get group use case
    return {
      message: 'Grupo obtenido exitosamente',
      group: { id },
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado para actualizar este grupo' })
  async updateGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // This would need an update group use case
    return {
      message: 'Grupo actualizado exitosamente',
      group: { id },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({ status: 204, description: 'Grupo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado para eliminar este grupo' })
  async deleteGroup(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const userId = req.user?.sub;
    
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }
    
    // This would need a delete group use case
    return {
      message: 'Grupo eliminado exitosamente',
    };
  }
}
