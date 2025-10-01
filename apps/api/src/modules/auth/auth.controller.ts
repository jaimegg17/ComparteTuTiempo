import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/auth/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('signup')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async signup(@Body() body: { email: string; password: string }) {
    // TODO: Implement signup logic
    return { message: 'Signup endpoint - to be implemented' };
  }

  @Post('signin')
  @ApiOperation({ summary: 'Iniciar sesión' })
  async signin(@Body() body: { email: string; password: string }) {
    // TODO: Implement signin logic
    return { message: 'Signin endpoint - to be implemented' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  async getMe(@Request() req: any) {
    return { user: req.user };
  }

  // 🔑 TEMPORARY ENDPOINT - Extract Access Token for testing
  @Get('token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '🔑 TESTING: Extraer Access Token' })
  async getToken(@Request() req: any) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return {
      message: '🔑 Access Token extraído correctamente',
      userId: req.user?.sub || 'unknown',
      token: token || 'No token found in headers',
      fullUser: req.user,
      note: 'Usa este token en tus scripts de prueba'
    };
  }
}

