import { GetMessagesByExchangeUseCase } from './get-messages-by-exchange.use-case';
import type { ListMessagesUseCase } from './list-messages.use-case';

describe('GetMessagesByExchangeUseCase', () => {
  it('delegates in ListMessagesUseCase with normalized payload', async () => {
    const listMessagesUseCase = {
      execute: jest.fn().mockResolvedValue({ messages: { messages: [], total: 0, page: 1, pageSize: 20, totalPages: 0 } }),
    } as unknown as ListMessagesUseCase;

    const useCase = new GetMessagesByExchangeUseCase(listMessagesUseCase);
    await useCase.execute({ exchangeId: 7, userId: 'auth0|u1', page: 3, pageSize: 15 });

    expect((listMessagesUseCase.execute as jest.Mock)).toHaveBeenCalledWith({
      userId: 'auth0|u1',
      query: {
        exchangeId: 7,
        page: 3,
        pageSize: 15,
      },
    });
  });
});

