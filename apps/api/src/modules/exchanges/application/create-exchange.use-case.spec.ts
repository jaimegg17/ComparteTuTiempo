import { BadRequestException } from '@nestjs/common';
import { CreateExchangeUseCase } from './create-exchange.use-case';
import { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeEntity } from '../domain/exchange.entity';

describe('CreateExchangeUseCase', () => {
  let useCase: CreateExchangeUseCase;
  let exchangeRepository: jest.Mocked<ExchangeRepositoryPort>;

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

    useCase = new CreateExchangeUseCase(exchangeRepository);
  });

  describe('Successful Creation', () => {
    it('should create exchange when all validations pass', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const exchangeData = {
        serviceId: 1,
        offeredById: 'provider-id',
        requestedById: 'requester-id',
        date: futureDate,
        exchangedTime: 2,
      };

      const createdExchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        1,
        futureDate,
        'PENDING',
        2,
        new Date(),
        new Date(),
      );

      exchangeRepository.create.mockResolvedValue(createdExchange);

      const result = await useCase.execute({
        data: exchangeData,
        userId: 'requester-id',
      });

      expect(result.exchange).toBeDefined();
      expect(exchangeRepository.create).toHaveBeenCalledWith(exchangeData);
    });
  });

  describe('Business Validations', () => {
    it('should reject if user tries to exchange with themselves', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        useCase.execute({
          data: {
            serviceId: 1,
            offeredById: 'same-user',
            requestedById: 'same-user',
            date: futureDate,
            exchangedTime: 2,
          },
          userId: 'same-user',
        }),
      ).rejects.toThrow(BadRequestException);
      
      expect(exchangeRepository.create).not.toHaveBeenCalled();
    });

    it('should reject if exchangedTime is zero or negative', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        useCase.execute({
          data: {
            serviceId: 1,
            offeredById: 'provider-id',
            requestedById: 'requester-id',
            date: futureDate,
            exchangedTime: 0,
          },
          userId: 'requester-id',
        }),
      ).rejects.toThrow('El tiempo intercambiado debe ser mayor a 0');
    });

    it('should reject if date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(
        useCase.execute({
          data: {
            serviceId: 1,
            offeredById: 'provider-id',
            requestedById: 'requester-id',
            date: pastDate,
            exchangedTime: 2,
          },
          userId: 'requester-id',
        }),
      ).rejects.toThrow('La fecha del intercambio no puede ser en el pasado');
    });

    it('should reject if userId is not part of the exchange', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        useCase.execute({
          data: {
            serviceId: 1,
            offeredById: 'provider-id',
            requestedById: 'requester-id',
            date: futureDate,
            exchangedTime: 2,
          },
          userId: 'random-user', // Not part of exchange
        }),
      ).rejects.toThrow('Solo puedes crear intercambios donde participes');
    });

    it('should allow creation if userId is the requester', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createdExchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        1,
        futureDate,
        'PENDING',
        2,
        new Date(),
        new Date(),
      );

      exchangeRepository.create.mockResolvedValue(createdExchange);

      await useCase.execute({
        data: {
          serviceId: 1,
          offeredById: 'provider-id',
          requestedById: 'requester-id',
          date: futureDate,
          exchangedTime: 2,
        },
        userId: 'requester-id',
      });

      expect(exchangeRepository.create).toHaveBeenCalled();
    });

    it('should allow creation if userId is the provider', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createdExchange = new ExchangeEntity(
        1,
        'requester-id',
        'provider-id',
        1,
        futureDate,
        'PENDING',
        2,
        new Date(),
        new Date(),
      );

      exchangeRepository.create.mockResolvedValue(createdExchange);

      await useCase.execute({
        data: {
          serviceId: 1,
          offeredById: 'provider-id',
          requestedById: 'requester-id',
          date: futureDate,
          exchangedTime: 2,
        },
        userId: 'provider-id',
      });

      expect(exchangeRepository.create).toHaveBeenCalled();
    });
  });
});

