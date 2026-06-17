import { ForbiddenException } from '@nestjs/common';
import { MarkMessageReadUseCase } from './mark-message-read.use-case';
import { MessageEntity } from '../domain/message.entity';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('MarkMessageReadUseCase', () => {
  const messageRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  } as unknown as jest.Mocked<MessageRepositoryPort>;

  const prisma = {
    exchange: {
      findUnique: jest.fn(),
    },
  };

  const useCase = new MarkMessageReadUseCase(messageRepository, prisma as unknown as PrismaService);
  const now = new Date('2026-06-12T10:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('bloquea marcar como leído mensajes de intercambios ajenos', async () => {
    messageRepository.findById.mockResolvedValue(new MessageEntity(3, 9, 'auth0|requester', 'Hola', false, now, now));
    prisma.exchange.findUnique.mockResolvedValue({
      id: 9,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
    });

    await expect(useCase.execute({ messageId: 3, userId: 'auth0|outsider' })).rejects.toThrow(ForbiddenException);
    expect(messageRepository.update).not.toHaveBeenCalled();
  });

  it('no marca como leído un mensaje propio', async () => {
    const ownMessage = new MessageEntity(3, 9, 'auth0|provider', 'Hola', false, now, now);
    messageRepository.findById.mockResolvedValue(ownMessage);
    prisma.exchange.findUnique.mockResolvedValue({
      id: 9,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
    });

    const result = await useCase.execute({ messageId: 3, userId: 'auth0|provider' });

    expect(messageRepository.update).not.toHaveBeenCalled();
    expect(result.message).toBe(ownMessage);
  });

  it('marca como leído un mensaje entrante si el usuario participa', async () => {
    messageRepository.findById.mockResolvedValue(new MessageEntity(3, 9, 'auth0|requester', 'Hola', false, now, now));
    const updated = new MessageEntity(3, 9, 'auth0|requester', 'Hola', true, now, now);
    messageRepository.update.mockResolvedValue(updated);
    prisma.exchange.findUnique.mockResolvedValue({
      id: 9,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
    });

    const result = await useCase.execute({ messageId: 3, userId: 'auth0|provider' });

    expect(messageRepository.update).toHaveBeenCalledWith(3, { isRead: true });
    expect(result.message.isRead).toBe(true);
  });
});
