import { Controller, Post, Get, UseGuards, Request, UnauthorizedException, GoneException } from '@nestjs/common';
import { GetMeUseCase } from '../application/get-me.use-case';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  private getAuthenticatedUserId(req: { user?: { id?: string; sub?: string } }): string {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return userId;
  }

  @Post('signup')
  async signUp() {
    throw new GoneException('El registro local está deshabilitado. Usa Auth0 para autenticarte.');
  }

  @Post('signin')
  async signIn() {
    throw new GoneException('El inicio de sesión local está deshabilitado. Usa Auth0 para autenticarte.');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: { user?: { id?: string; sub?: string } }) {
    return this.getMeUseCase.execute(this.getAuthenticatedUserId(req));
  }
}
