import { UnauthorizedException } from '@nestjs/common';
import { RatingsController } from './ratings.controller';
import type { CreateRatingUseCase } from '../application/create-rating.use-case';
import type { ListRatingsUseCase } from '../application/list-ratings.use-case';
import type { UpdateRatingUseCase } from '../application/update-rating.use-case';
import type { DeleteRatingUseCase } from '../application/delete-rating.use-case';

describe('RatingsController - delete rating', () => {
  const createRatingUseCase = { execute: jest.fn() };
  const listRatingsUseCase = { execute: jest.fn() };
  const updateRatingUseCase = { execute: jest.fn() };
  const deleteRatingUseCase = { execute: jest.fn() };

  const controller = new RatingsController(
    createRatingUseCase as unknown as CreateRatingUseCase,
    listRatingsUseCase as unknown as ListRatingsUseCase,
    updateRatingUseCase as unknown as UpdateRatingUseCase,
    deleteRatingUseCase as unknown as DeleteRatingUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza UnauthorizedException si no hay usuario autenticado', async () => {
    await expect(controller.deleteRating(10, { user: null })).rejects.toThrow(UnauthorizedException);
    expect(deleteRatingUseCase.execute).not.toHaveBeenCalled();
  });

  it('ejecuta DeleteRatingUseCase con id y userId', async () => {
    deleteRatingUseCase.execute.mockResolvedValue(undefined);

    await controller.deleteRating(25, { user: { sub: 'auth0|u1' } });

    expect(deleteRatingUseCase.execute).toHaveBeenCalledWith({
      id: 25,
      userId: 'auth0|u1',
    });
  });
});
