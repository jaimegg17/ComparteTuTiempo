import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ListMessagesUseCase } from './list-messages.use-case';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('ListMessagesUseCase', () => {
  const messageRepository = {
    list: jest.fn(),
  } as unknown as jest.Mocked<MessageRepositoryPort>;

  const prisma = {
    exchange: {
      findUnique: jest.fn(),
    },
  };

  const useCase = new ListMessagesUseCase(messageRepository, prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloquea lectura de mensajes si el usuario no participa en el intercambio', async () => {
    prisma.exchange.findUnique.mockResolvedValue({
      id: 7,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
    });

    await expect(
      useCase.execute({
        userId: 'auth0|outsider',
        query: { exchangeId: 7, page: 1, pageSize: 20 },
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(messageRepository.list).not.toHaveBeenCalled();
  });

  it('lanza NotFound si el intercambio no existe', async () => {
    prisma.exchange.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'auth0|requester',
        query: { exchangeId: 404, page: 1, pageSize: 20 },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('permite leer mensajes a requester u offeredBy', async () => {
    prisma.exchange.findUnique.mockResolvedValue({
      id: 7,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
    });
    messageRepository.list.mockResolvedValue({ messages: [], total: 0, page: 1, pageSize: 20, totalPages: 0 });

    await useCase.execute({
      userId: 'auth0|provider',
      query: { exchangeId: 7, page: 1, pageSize: 20 },
    });

    expect(messageRepository.list).toHaveBeenCalledWith({ exchangeId: 7, page: 1, pageSize: 20 });
  });
});
