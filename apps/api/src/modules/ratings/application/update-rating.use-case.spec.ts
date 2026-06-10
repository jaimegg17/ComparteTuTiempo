import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRatingUseCase } from './update-rating.use-case';
import { RatingRepositoryPort } from '../domain/rating-repository.port';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { RatingEntity } from '../domain/rating.entity';

describe('UpdateRatingUseCase', () => {
  let useCase: UpdateRatingUseCase;
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
        UpdateRatingUseCase,
        {
          provide: RATING_REPOSITORY_TOKEN,
          useValue: mockRatingRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateRatingUseCase>(UpdateRatingUseCase);
    ratingRepository = module.get(RATING_REPOSITORY_TOKEN);
  });

  describe('Successful Update', () => {
    it('should update rating score when user is the owner', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        3,
        'Old comment',
        new Date(),
        new Date(),
      );

      const updatedRating = new RatingEntity(
        1,
        'user-123',
        1,
        5,
        'Old comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);
      ratingRepository.update.mockResolvedValue(updatedRating);

      const result = await useCase.execute({
        id: 1,
        userId: 'user-123',
        data: { score: 5 },
      });

      expect(result.rating.score).toBe(5);
      expect(ratingRepository.update).toHaveBeenCalledWith(1, { score: 5 });
    });

    it('should update rating comment when user is the owner', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        5,
        'Old comment',
        new Date(),
        new Date(),
      );

      const updatedRating = new RatingEntity(
        1,
        'user-123',
        1,
        5,
        'New comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);
      ratingRepository.update.mockResolvedValue(updatedRating);

      const result = await useCase.execute({
        id: 1,
        userId: 'user-123',
        data: { comment: 'New comment' },
      });

      expect(result.rating.comment).toBe('New comment');
      expect(ratingRepository.update).toHaveBeenCalledWith(1, { comment: 'New comment' });
    });

    it('should update both score and comment', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        3,
        'Old comment',
        new Date(),
        new Date(),
      );

      const updatedRating = new RatingEntity(
        1,
        'user-123',
        1,
        5,
        'New comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);
      ratingRepository.update.mockResolvedValue(updatedRating);

      const result = await useCase.execute({
        id: 1,
        userId: 'user-123',
        data: { score: 5, comment: 'New comment' },
      });

      expect(result.rating.score).toBe(5);
      expect(result.rating.comment).toBe('New comment');
      expect(ratingRepository.update).toHaveBeenCalledWith(1, { score: 5, comment: 'New comment' });
    });
  });

  describe('Error Cases', () => {
    it('should throw NotFoundException if rating does not exist', async () => {
      ratingRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          id: 999,
          userId: 'user-123',
          data: { score: 5 },
        })
      ).rejects.toThrow(NotFoundException);

      expect(ratingRepository.findById).toHaveBeenCalledWith(999);
      expect(ratingRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const existingRating = new RatingEntity(
        1,
        'other-user',
        1,
        3,
        'Comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);

      await expect(
        useCase.execute({
          id: 1,
          userId: 'user-123', // Different user
          data: { score: 5 },
        })
      ).rejects.toThrow(ForbiddenException);

      expect(ratingRepository.findById).toHaveBeenCalledWith(1);
      expect(ratingRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if score is out of range (too low)', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        3,
        'Comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);

      await expect(
        useCase.execute({
          id: 1,
          userId: 'user-123',
          data: { score: 0 },
        })
      ).rejects.toThrow(BadRequestException);

      expect(ratingRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if score is out of range (too high)', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        3,
        'Comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);

      await expect(
        useCase.execute({
          id: 1,
          userId: 'user-123',
          data: { score: 6 },
        })
      ).rejects.toThrow(BadRequestException);

      expect(ratingRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if comment is too long', async () => {
      const existingRating = new RatingEntity(
        1,
        'user-123',
        1,
        3,
        'Comment',
        new Date(),
        new Date(),
      );

      ratingRepository.findById.mockResolvedValue(existingRating);

      const longComment = 'a'.repeat(501); // 501 characters

      await expect(
        useCase.execute({
          id: 1,
          userId: 'user-123',
          data: { comment: longComment },
        })
      ).rejects.toThrow(BadRequestException);

      expect(ratingRepository.update).not.toHaveBeenCalled();
    });
  });
});
