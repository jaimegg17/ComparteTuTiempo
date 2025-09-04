import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import type { SignUp, SignIn } from '@comparte-tu-tiempo/contracts';
import { SignUpUseCase } from '../application/sign-up.use-case';
import { SignInUseCase } from '../application/sign-in.use-case';
import { GetMeUseCase } from '../application/get-me.use-case';
import { JwtAuthGuard } from '../../../common/auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly getMeUseCase: GetMeUseCase,
  ) {}

  @Post('signup')
  async signUp(@Body() signUpData: SignUp) {
    return this.signUpUseCase.execute(signUpData);
  }

  @Post('signin')
  async signIn(@Body() signInData: SignIn) {
    return this.signInUseCase.execute(signInData);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    return this.getMeUseCase.execute(req.user.id);
  }
}
