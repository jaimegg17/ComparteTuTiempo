import { Test, TestingModule } from '@nestjs/testing';
import { CreateRatingUseCase } from './create-rating.use-case';
import { RatingRepositoryPort } from '../domain/rating-repository.port';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RATING_REPOSITORY_TOKEN } from '../domain/tokens';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { RatingEntity } from '../domain/rating.entity';

describe('CreateRatingUseCase - Business Logic Validation', () => {
  let useCase: CreateRatingUseCase;
  let ratingRepository: jest.Mocked<RatingRepositoryPort>;
  let prismaService: jest.Mocked<PrismaService>;

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

    const mockPrismaService = {
      service: {
        findUnique: jest.fn(),
      },
      exchange: {
        findFirst: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRatingUseCase,
        {
          provide: RATING_REPOSITORY_TOKEN,
          useValue: mockRatingRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateRatingUseCase>(CreateRatingUseCase);
    ratingRepository = module.get(RATING_REPOSITORY_TOKEN);
    prismaService = module.get(PrismaService);
  });

  describe('Service Validation', () => {
    it('should reject rating if service does not exist', async () => {
      // Mock: Service does not exist
      (prismaService.service.findUnique as jest.Mock).mockResolvedValue(null);

      const ratingData = {
        serviceId: 999,
        score: 5,
        comment: 'Great service!',
        userId: 'user-123',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.service.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(ratingRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should reject if user tries to rate on behalf of another user', async () => {
      const ratingData = {
        serviceId: 1,
        score: 5,
        comment: 'Great service!',
        userId: 'other-user',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.service.findUnique).not.toHaveBeenCalled();
      expect(ratingRepository.create).not.toHaveBeenCalled();
    });

    it('should reject score lower than 1', async () => {
      const ratingData = {
        serviceId: 1,
        score: 0,
        comment: 'Too low',
        userId: 'user-123',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.service.findUnique).not.toHaveBeenCalled();
    });

    it('should reject score greater than 5', async () => {
      const ratingData = {
        serviceId: 1,
        score: 6,
        comment: 'Too high',
        userId: 'user-123',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.service.findUnique).not.toHaveBeenCalled();
    });

    it('should reject comments longer than 500 chars', async () => {
      const ratingData = {
        serviceId: 1,
        score: 5,
        comment: 'a'.repeat(501),
        userId: 'user-123',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.service.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Exchange Validation', () => {
    it('should reject rating if user has no completed exchange for the service', async () => {
      // Mock: Service exists
      (prismaService.service.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Test Service',
      });
      
      // Mock: No existing rating
      ratingRepository.findByUserAndService.mockResolvedValue(null);
      
      // Mock: No completed exchange
      (prismaService.exchange.findFirst as jest.Mock).mockResolvedValue(null);

      const ratingData = {
        serviceId: 1,
        score: 5,
        comment: 'Great service!',
        userId: 'user-123',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(BadRequestException);

      expect(prismaService.exchange.findFirst).toHaveBeenCalledWith({
        where: {
          serviceId: 1,
          OR: [
            { requestedById: 'user-123' },
            { offeredById: 'user-123' }
          ],
          state: 'COMPLETED'
        }
      });
    });

    it('should allow rating if user has completed exchange as requester', async () => {
      // Mock: Service exists
      (prismaService.service.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Test Service',
      });
      
      // Mock: No existing rating
      ratingRepository.findByUserAndService.mockResolvedValue(null);
      
      // Mock: Completed exchange as requester
      (prismaService.exchange.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        requestedById: 'user-123',
        offeredById: 'provider-456',
        serviceId: 1,
        state: 'COMPLETED',
      });

      const mockRating = {
        id: 1,
        userId: 'user-123',
        serviceId: 1,
        score: 5,
        comment: 'Great service!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ratingRepository.create.mockResolvedValue(
        new RatingEntity(
          mockRating.id,
          mockRating.userId,
          mockRating.serviceId,
          mockRating.score,
          mockRating.comment,
          mockRating.createdAt,
          mockRating.updatedAt,
        ),
      );

      const ratingData = {
        serviceId: 1,
        score: 5,
        comment: 'Great service!',
        userId: 'user-123',
      };

      const result = await useCase.execute({
        data: ratingData,
        userId: 'user-123',
      });

      expect(result.rating).toBeDefined();
      expect(prismaService.exchange.findFirst).toHaveBeenCalled();
    });

    it('should allow rating if user has completed exchange as provider', async () => {
      // Mock: Service exists
      (prismaService.service.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Test Service',
      });
      
      // Mock: No existing rating
      ratingRepository.findByUserAndService.mockResolvedValue(null);
      
      // Mock: Completed exchange as provider
      (prismaService.exchange.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
        requestedById: 'requester-456',
        offeredById: 'user-123',
        serviceId: 1,
        state: 'COMPLETED',
      });

      const mockRating = {
        id: 1,
        userId: 'user-123',
        serviceId: 1,
        score: 5,
        comment: 'Great service!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ratingRepository.create.mockResolvedValue(
        new RatingEntity(
          mockRating.id,
          mockRating.userId,
          mockRating.serviceId,
          mockRating.score,
          mockRating.comment,
          mockRating.createdAt,
          mockRating.updatedAt,
        ),
      );

      const ratingData = {
        serviceId: 1,
        score: 5,
        comment: 'Great service!',
        userId: 'user-123',
      };

      const result = await useCase.execute({
        data: ratingData,
        userId: 'user-123',
      });

      expect(result.rating).toBeDefined();
      expect(prismaService.exchange.findFirst).toHaveBeenCalled();
    });

    it('should reject rating if user already rated the service', async () => {
      // Mock: Service exists
      (prismaService.service.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        title: 'Test Service',
      });
      
      // Mock: Existing rating
      ratingRepository.findByUserAndService.mockResolvedValue(
        new RatingEntity(1, 'user-123', 1, 4, 'Previous rating', new Date(), new Date()),
      );

      const ratingData = {
        serviceId: 1,
        score: 5,
        comment: 'New rating',
        userId: 'user-123',
      };

      await expect(
        useCase.execute({
          data: ratingData,
          userId: 'user-123',
        })
      ).rejects.toThrow(ConflictException);

      expect(ratingRepository.findByUserAndService).toHaveBeenCalledWith('user-123', 1);
    });
  });
});
