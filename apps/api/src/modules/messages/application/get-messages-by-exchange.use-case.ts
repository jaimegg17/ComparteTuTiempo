import { Injectable } from '@nestjs/common';
import { ListMessagesUseCase } from './list-messages.use-case';

export interface GetMessagesByExchangeRequest {
  exchangeId: number;
  userId: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class GetMessagesByExchangeUseCase {
  constructor(private readonly listMessagesUseCase: ListMessagesUseCase) {}

  async execute(request: GetMessagesByExchangeRequest) {
    const { exchangeId, userId, page = 1, pageSize = 20 } = request;

    return this.listMessagesUseCase.execute({
      userId,
      query: {
        exchangeId,
        page,
        pageSize,
      },
    });
  }
}

