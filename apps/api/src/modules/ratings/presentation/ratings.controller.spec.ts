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
  const prisma = {
    user: {
      findMany: jest.fn(),
    },
  };

  const controller = new RatingsController(
    createRatingUseCase as unknown as CreateRatingUseCase,
    listRatingsUseCase as unknown as ListRatingsUseCase,
    updateRatingUseCase as unknown as UpdateRatingUseCase,
    deleteRatingUseCase as unknown as DeleteRatingUseCase,
    prisma as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findMany.mockResolvedValue([]);
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

  it('enriquece la lista de valoraciones con datos públicos de usuario', async () => {
    const createdAt = new Date('2026-06-17T10:00:00.000Z');
    listRatingsUseCase.execute.mockResolvedValue({
      ratings: {
        ratings: [
          {
            toContract: () => ({
              id: 7,
              userId: 'google-oauth2|123456',
              serviceId: 1,
              score: 5,
              comment: 'Muy buena experiencia',
              createdAt,
            }),
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      },
    });
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'google-oauth2|123456',
        name: 'María García',
        email: 'maria@example.com',
        imageUrl: 'https://example.com/avatar.jpg',
      },
    ]);

    const result = await controller.listRatings({ serviceId: 1 });

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['google-oauth2|123456'] } },
      select: { id: true, name: true, email: true, imageUrl: true },
    });
    expect(result.ratings[0]).toEqual(expect.objectContaining({
      user: expect.objectContaining({ name: 'María García' }),
    }));
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
