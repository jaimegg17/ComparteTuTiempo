import { Controller, Get, Put, Body, UseGuards, Request, Param, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MinLength } from 'class-validator';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';
import { GetUserProfileUseCase } from '../application/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../application/update-user-profile.use-case';
import { GetUserByIdUseCase } from '../application/get-user-by-id.use-case';

// DTO for updating user profile
export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  private getAuthenticatedUserId(req: { user?: { sub?: string; id?: string } }): string {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener mi perfil completo' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMyProfile(@Request() req: { user?: { sub?: string; id?: string } }) {
    const userId = this.getAuthenticatedUserId(req);

    const result = await this.getUserProfileUseCase.execute({ userId });
    return {
      message: 'Perfil obtenido exitosamente',
      user: result.user,
    };
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async updateMyProfile(
    @Request() req: { user?: { sub?: string; id?: string } },
    @Body() updateData: UpdateUserProfileDto,
  ) {
    const userId = this.getAuthenticatedUserId(req);
    const result = await this.updateUserProfileUseCase.execute({
      userId,
      data: updateData,
    });
    return {
      message: 'Perfil actualizado exitosamente',
      user: result.user,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil público de un usuario' })
  @ApiResponse({ status: 200, description: 'Perfil público obtenido' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserById(@Param('id') id: string) {
    const result = await this.getUserByIdUseCase.execute({ userId: id });
    return {
      message: 'Perfil obtenido exitosamente',
      user: result.user,
    };
  }
}
