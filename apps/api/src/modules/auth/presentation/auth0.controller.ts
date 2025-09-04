import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { Auth0UserService } from '../application/auth0-user.service';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';

@Controller('auth0')
export class Auth0Controller {
  constructor(private readonly auth0UserService: Auth0UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    // req.user contains the Auth0 payload
    const user = await this.auth0UserService.findOrCreateFromAuth0(req.user);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      message: 'User authenticated with Auth0'
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    // Return the Auth0 user info
    return {
      auth0User: req.user,
      message: 'Auth0 profile information'
    };
  }
}
