import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { UpdateExchangeUseCase } from './update-exchange.use-case';
import { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeEntity } from '../domain/exchange.entity';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ExchangeStatus } from '@comparte-tu-tiempo/contracts';

describe('UpdateExchangeUseCase', () => {
  let useCase: UpdateExchangeUseCase;
  let exchangeRepository: jest.Mocked<ExchangeRepositoryPort>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(() => {
    exchangeRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByServiceId: jest.fn(),
      findByRequestedById: jest.fn(),
      findByOfferedById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };

    prismaService = {
      service: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    useCase = new UpdateExchangeUseCase(exchangeRepository, prismaService);
  });

  describe('Exchange Not Found', () => {
    it('should throw NotFoundException if exchange does not exist', async () => {
      exchangeRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({
          id: 999,
          data: { state: ExchangeStatus.CONFIRMED },
          userId: 'user-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Authorization', () => {
    it('should throw ForbiddenException if user is not part of the exchange', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'PENDING',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.CONFIRMED },
          userId: 'random-user',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('State Transitions', () => {
    it('should allow PENDING -> CONFIRMED by provider', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'PENDING',
        0,
        new Date(),
        new Date(),
      );

      const updatedExchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'CONFIRMED',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);
      exchangeRepository.update.mockResolvedValue(updatedExchange);

      const result = await useCase.execute({
        id: 1,
        data: { state: ExchangeStatus.CONFIRMED },
        userId: 'provider-id',
      });

      expect(result.exchange.state).toBe('CONFIRMED');
      expect(exchangeRepository.update).toHaveBeenCalledWith(1, { state: ExchangeStatus.CONFIRMED });
    });

    it('should reject PENDING -> CONFIRMED by requester', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'PENDING',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.CONFIRMED },
          userId: 'requester-id', // Requester cannot confirm
        }),
      ).rejects.toThrow('Solo el usuario que ofrece el servicio puede confirmar el intercambio');
    });

    it('should allow CONFIRMED -> IN_PROGRESS by requester', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'CONFIRMED',
        0,
        new Date(),
        new Date(),
      );

      const updatedExchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'IN_PROGRESS',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);
      exchangeRepository.update.mockResolvedValue(updatedExchange);

      const result = await useCase.execute({
        id: 1,
        data: { state: ExchangeStatus.IN_PROGRESS },
        userId: 'requester-id',
      });

      expect(result.exchange.state).toBe('IN_PROGRESS');
    });

    it('should reject CONFIRMED -> IN_PROGRESS by provider', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'CONFIRMED',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.IN_PROGRESS },
          userId: 'provider-id', // Provider cannot start
        }),
      ).rejects.toThrow('Solo el usuario que solicita el servicio puede iniciar el intercambio');
    });

    it('should reject invalid state transition (PENDING -> COMPLETED)', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'PENDING',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.COMPLETED },
          userId: 'provider-id',
        }),
      ).rejects.toThrow('No se puede cambiar el estado de PENDING a COMPLETED');
    });

    it('should reject invalid state transition (CONFIRMED -> COMPLETED)', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'CONFIRMED',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.COMPLETED },
          userId: 'provider-id',
        }),
      ).rejects.toThrow('No se puede cambiar el estado de CONFIRMED a COMPLETED');
    });
  });

  describe('Credit Transfer on Completion', () => {
    it('should transfer credits when completing exchange', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'IN_PROGRESS',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      const mockService = {
        id: 100,
        duration: 2, // 2 hours
      };

      const mockRequester = {
        id: 'requester-id',
        timeCredits: 200, // 200 minutes
      };

      prismaService.service.findUnique.mockResolvedValue(mockService as any);

      // Mock transaction
      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockRequester),
            update: jest.fn(),
          },
        };
        return callback(txMock);
      });

      const updatedExchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'COMPLETED',
        2,
        new Date(),
        new Date(),
      );

      exchangeRepository.update.mockResolvedValue(updatedExchange);

      await useCase.execute({
        id: 1,
        data: { state: ExchangeStatus.COMPLETED },
        userId: 'provider-id',
      });

      // Verify transaction was called
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should reject completion if requester has insufficient credits', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'IN_PROGRESS',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      const mockService = {
        id: 100,
        duration: 2, // 2 hours = 120 minutes
      };

      const mockRequester = {
        id: 'requester-id',
        timeCredits: 60, // Only 60 minutes, needs 120
      };

      prismaService.service.findUnique.mockResolvedValue(mockService as any);

      prismaService.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          user: {
            findUnique: jest.fn().mockResolvedValue(mockRequester),
            update: jest.fn(),
          },
        };
        return callback(txMock);
      });

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.COMPLETED },
          userId: 'provider-id',
        }),
      ).rejects.toThrow('Créditos insuficientes');
    });

    it('should only allow provider to complete exchange', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'IN_PROGRESS',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { state: ExchangeStatus.COMPLETED },
          userId: 'requester-id', // Requester cannot complete
        }),
      ).rejects.toThrow('Solo el usuario que ofrece el servicio puede completar el intercambio');
    });
  });

  describe('Date Validation', () => {
    it('should reject updating to a past date', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'PENDING',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        useCase.execute({
          id: 1,
          data: { date: pastDate },
          userId: 'requester-id',
        }),
      ).rejects.toThrow('La fecha del intercambio no puede ser en el pasado');
    });
  });

  describe('ExchangedTime Validation', () => {
    it('should reject zero or negative exchangedTime', async () => {
      const exchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        100,
        new Date(),
        'PENDING',
        0,
        new Date(),
        new Date(),
      );

      exchangeRepository.findById.mockResolvedValue(exchange);

      await expect(
        useCase.execute({
          id: 1,
          data: { exchangedTime: -5 },
          userId: 'requester-id',
        }),
      ).rejects.toThrow('El tiempo intercambiado debe ser mayor a 0');
    });
  });
});
