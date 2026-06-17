import { GoneException, Injectable } from '@nestjs/common';
import { SignIn } from '@comparte-tu-tiempo/contracts';

@Injectable()
export class SignInUseCase {
  async execute(_signInData: SignIn): Promise<never> {
    throw new GoneException('El inicio de sesión local está deshabilitado. Usa Auth0 para autenticarte.');
  }
}
