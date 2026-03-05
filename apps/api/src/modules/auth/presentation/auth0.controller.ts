import { Controller, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { Auth0UserService } from '../application/auth0-user.service';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';

@Controller('auth0')
export class Auth0Controller {
  constructor(private readonly auth0UserService: Auth0UserService) {}

  private getAuthenticatedUser(req: { user?: { id?: string; sub?: string } }) {
    if (!req.user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    return req.user;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: { user?: { id?: string; sub?: string } }) {
    const authUser = this.getAuthenticatedUser(req);
    // req.user contains the Auth0 payload
    const user = await this.auth0UserService.findOrCreateFromAuth0(authUser);
    
    // Remove password from response
    const userWithoutPassword = { ...user } as Record<string, unknown>;
    delete userWithoutPassword.password;
    
    return {
      user: userWithoutPassword,
      message: 'User authenticated with Auth0'
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user?: { id?: string; sub?: string } }) {
    const authUser = this.getAuthenticatedUser(req);
    // Return the Auth0 user info
    return {
      auth0User: authUser,
      message: 'Auth0 profile information'
    };
  }
}
