import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateMessageUseCase } from './create-message.use-case';
import type { MessageRepositoryPort } from '../domain/message-repository.port';
import { MessageEntity } from '../domain/message.entity';
import type { PrismaService } from '@/common/prisma/prisma.service';

describe('CreateMessageUseCase', () => {
  const messageRepository = {
    create: jest.fn(),
  } as unknown as jest.Mocked<MessageRepositoryPort>;

  const prisma = {
    exchange: {
      findUnique: jest.fn(),
    },
    userNotification: {
      create: jest.fn(),
    },
  };

  const useCase = new CreateMessageUseCase(messageRepository, prisma as unknown as PrismaService);
  const now = new Date('2026-06-12T10:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.userNotification.create.mockResolvedValue({ id: 1 });
  });

  it('bloquea envío si el usuario no participa en el intercambio', async () => {
    prisma.exchange.findUnique.mockResolvedValue({
      id: 8,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
    });

    await expect(
      useCase.execute({
        userId: 'auth0|outsider',
        data: { exchangeId: 8, content: 'Hola' },
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(messageRepository.create).not.toHaveBeenCalled();
  });

  it('lanza NotFound si el intercambio no existe', async () => {
    prisma.exchange.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'auth0|requester',
        data: { exchangeId: 404, content: 'Hola' },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('crea el mensaje usando senderId del token autenticado', async () => {
    prisma.exchange.findUnique.mockResolvedValue({
      id: 8,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
      service: { title: 'Clases de inglés' },
    });
    messageRepository.create.mockResolvedValue(new MessageEntity(1, 8, 'auth0|provider', 'Hola', false, now, now));

    await useCase.execute({
      userId: 'auth0|provider',
      data: { exchangeId: 8, content: 'Hola' },
    });

    expect(messageRepository.create).toHaveBeenCalledWith({ exchangeId: 8, content: 'Hola' }, 'auth0|provider');
  });

  it('notifica al otro participante cuando se envía un mensaje', async () => {
    prisma.exchange.findUnique.mockResolvedValue({
      id: 8,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
      service: { title: 'Clases de inglés' },
    });
    prisma.userNotification.create.mockResolvedValue({ id: 99 });
    messageRepository.create.mockResolvedValue(new MessageEntity(1, 8, 'auth0|provider', 'Hola', false, now, now));

    await useCase.execute({
      userId: 'auth0|provider',
      data: { exchangeId: 8, content: 'Hola' },
    });

    expect(prisma.userNotification.create).toHaveBeenCalledWith({
      data: {
        userId: 'auth0|requester',
        type: 'MESSAGE',
        title: 'Nuevo mensaje',
        body: 'Has recibido un mensaje sobre "Clases de inglés".',
        link: '/exchanges/8',
      },
    });
  });

  it('no falla el envío si la notificación de mensaje no se puede crear', async () => {
    prisma.exchange.findUnique.mockResolvedValue({
      id: 8,
      requestedById: 'auth0|requester',
      offeredById: 'auth0|provider',
      service: { title: 'Clases de inglés' },
    });
    prisma.userNotification.create.mockRejectedValue(new Error('notifications down'));
    messageRepository.create.mockResolvedValue(new MessageEntity(1, 8, 'auth0|provider', 'Hola', false, now, now));

    await expect(useCase.execute({
      userId: 'auth0|provider',
      data: { exchangeId: 8, content: 'Hola' },
    })).resolves.toEqual({
      message: expect.objectContaining({ id: 1 }),
    });
  });
});
