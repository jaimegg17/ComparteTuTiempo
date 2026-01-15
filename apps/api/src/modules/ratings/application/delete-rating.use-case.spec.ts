import { Test, TestingModule } from '@nestjs/testing';
import { DeleteRatingUseCase } from './delete-rating.use-case';
import { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RatingEntity } from '../domain/rating.entity';

describe('DeleteRatingUseCase', () => {
  let useCase: DeleteRatingUseCase;
  let ratingRepository: jest.Mocked<RatingRepositoryPort>;

  beforeEach(async () => {
    const mockRatingRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByServiceId: jest.fn(),
      findByUserAndService: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRatingUseCase,
        {
          provide: RATING_REPOSITORY_TOKEN,
          useValue: mockRatingRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteRatingUseCase>(DeleteRatingUseCase);
    ratingRepository = module.get(RATING_REPOSITORY_TOKEN);
  });

  describe('Successful Deletion', () => {
    it('should delete rating when user is the owner', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        5,
        'Great service!',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);
      ratingRepository.delete.mockResolvedValue(undefined);

      await useCase.execute({
        id: 1,
        userId: 'user-123',
      });

      expect(ratingRepository.findById).toHaveBeenCalledWith(1);
      expect(ratingRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Error Cases', () => {
    it('should throw NotFoundException if rating does not exist', async () => {
      ratingRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          id: 999,
          userId: 'user-123',
        })
      ).rejects.toThrow(NotFoundException);

      expect(ratingRepository.findById).toHaveBeenCalledWith(999);
      expect(ratingRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const existingRating = new RatingEntity(
        1,
        'other-user',
        1,
        5,
        'Great service!',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);

      await expect(
        useCase.execute({
          id: 1,
          userId: 'user-123', // Different user
        })
      ).rejects.toThrow(ForbiddenException);

      expect(ratingRepository.findById).toHaveBeenCalledWith(1);
      expect(ratingRepository.delete).not.toHaveBeenCalled();
    });
  });
});
