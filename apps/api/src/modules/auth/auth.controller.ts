import { Controller, Post, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private getAuthenticatedUser(req: { user?: { sub?: string; id?: string } }) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return req.user;
  }

  @Post('signup')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async signup() {
    // TODO: Implement signup logic
    return { message: 'Signup endpoint - to be implemented' };
  }

  @Post('signin')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async signin() {
    // TODO: Implement signin logic
    return { message: 'Signin endpoint - to be implemented' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  async getMe(@Request() req: { user?: { sub?: string; id?: string } }) {
    return { user: this.getAuthenticatedUser(req) };
  }

  // 🔑 TEMPORARY ENDPOINT - Extract Access Token for testing
  @Get('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔑 TESTING: Extraer Access Token' })
  async getToken(
    @Request()
    req: { user?: { sub?: string; id?: string }; headers?: { authorization?: string } },
  ) {
    const user = this.getAuthenticatedUser(req);
    const token = req.headers?.authorization?.replace('Bearer ', '');
    return {
      message: '🔑 Access Token extraído correctamente',
      userId: user.sub || user.id || 'unknown',
      token: token || 'No token found in headers',
      fullUser: user,
      note: 'Usa este token en tus scripts de prueba'
    };
  }
}
