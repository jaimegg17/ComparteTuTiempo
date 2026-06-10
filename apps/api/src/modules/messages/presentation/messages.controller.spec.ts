import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import type { CreateMessageUseCase } from '../application/create-message.use-case';
import type { ListConversationsUseCase } from '../application/list-conversations.use-case';
import type { ListMessagesUseCase } from '../application/list-messages.use-case';
import type { GetMessagesByExchangeUseCase } from '../application/get-messages-by-exchange.use-case';
import type { MarkMessageReadUseCase } from '../application/mark-message-read.use-case';

describe('MessagesController', () => {
  const createMessageUseCase = { execute: jest.fn() };
  const listConversationsUseCase = { execute: jest.fn() };
  const listMessagesUseCase = { execute: jest.fn() };
  const getMessagesByExchangeUseCase = { execute: jest.fn() };
  const markMessageReadUseCase = { execute: jest.fn() };

  const controller = new MessagesController(
    createMessageUseCase as unknown as CreateMessageUseCase,
    listConversationsUseCase as unknown as ListConversationsUseCase,
    listMessagesUseCase as unknown as ListMessagesUseCase,
    getMessagesByExchangeUseCase as unknown as GetMessagesByExchangeUseCase,
    markMessageReadUseCase as unknown as MarkMessageReadUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lanza UnauthorizedException en createMessage si no hay usuario', async () => {
    await expect(
      controller.createMessage({ exchangeId: 10, content: 'hola' }, { user: undefined }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('lanza BadRequestException en listMessages si falta exchangeId', async () => {
    await expect(
      controller.listMessages({ page: 1, pageSize: 20 }, { user: { sub: 'auth0|u1' } }),
    ).rejects.toThrow(BadRequestException);
  });

  it('usa GetMessagesByExchangeUseCase en endpoint por exchange', async () => {
    getMessagesByExchangeUseCase.execute.mockResolvedValue({
      messages: { messages: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
    });

    await controller.getMessagesByExchange(12, { page: 2, pageSize: 25 }, { user: { sub: 'auth0|u1' } });

    expect(getMessagesByExchangeUseCase.execute).toHaveBeenCalledWith({
      exchangeId: 12,
      userId: 'auth0|u1',
      page: 2,
      pageSize: 25,
    });
  });
});
