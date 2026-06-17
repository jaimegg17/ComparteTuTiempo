import { GoneException, Injectable } from '@nestjs/common';
import { SignUp } from '@comparte-tu-tiempo/contracts';

@Injectable()
export class SignUpUseCase {
  async execute(_signUpData: SignUp): Promise<never> {
    throw new GoneException('El registro local está deshabilitado. Usa Auth0 para autenticarte.');
  }
}
