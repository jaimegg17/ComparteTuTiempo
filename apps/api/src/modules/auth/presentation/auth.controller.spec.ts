import { GoneException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import type { GetMeUseCase } from '../application/get-me.use-case';

describe('AuthController', () => {
  const getMeUseCase = { execute: jest.fn() };
  const controller = new AuthController(getMeUseCase as unknown as GetMeUseCase);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deshabilita signup local para evitar tokens mock fuera de Auth0', async () => {
    await expect(controller.signUp()).rejects.toThrow(GoneException);
  });

  it('deshabilita signin local para evitar tokens mock fuera de Auth0', async () => {
    await expect(controller.signIn()).rejects.toThrow(GoneException);
  });

  it('getMe requiere usuario autenticado', async () => {
    await expect(controller.getMe({ user: undefined })).rejects.toThrow(UnauthorizedException);
  });

  it('getMe delega usando sub de Auth0', async () => {
    getMeUseCase.execute.mockResolvedValue({ id: 'auth0|u1' });

    await controller.getMe({ user: { sub: 'auth0|u1' } });

    expect(getMeUseCase.execute).toHaveBeenCalledWith('auth0|u1');
  });
});
