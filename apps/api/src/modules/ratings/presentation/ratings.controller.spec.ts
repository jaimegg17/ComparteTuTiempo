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
    await expect(controller.deleteRating(10, {})).rejects.toThrow(UnauthorizedException);
    expect(deleteRatingUseCase.execute).not.toHaveBeenCalled();
  });

  it('lanza UnauthorizedException en createRating si no hay usuario autenticado', async () => {
    await expect(controller.createRating({ serviceId: 1, score: 5, userId: 'auth0|seed' }, {})).rejects.toThrow(
      UnauthorizedException,
    );
    expect(createRatingUseCase.execute).not.toHaveBeenCalled();
  });

  it('acepta payload válido de valoración y fuerza userId autenticado', async () => {
    const createdAt = new Date();
    createRatingUseCase.execute.mockResolvedValue({
      rating: {
        toContract: () => ({
          id: 7,
          userId: 'auth0|u1',
          serviceId: 1,
          score: 5,
          comment: 'Muy buena experiencia',
          createdAt,
          updatedAt: createdAt,
        }),
      },
    });

    const result = await controller.createRating(
      { serviceId: 1, score: 5, comment: 'Muy buena experiencia' },
      { user: { sub: 'auth0|u1' } },
    );

    expect(createRatingUseCase.execute).toHaveBeenCalledWith({
      data: { serviceId: 1, score: 5, comment: 'Muy buena experiencia', userId: 'auth0|u1' },
      userId: 'auth0|u1',
    });
    expect(result.rating).toEqual(expect.objectContaining({ serviceId: 1, score: 5 }));
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
