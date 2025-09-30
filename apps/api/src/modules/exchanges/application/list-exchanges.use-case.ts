import { Injectable, Inject } from '@nestjs/common';
import type { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeListQuery } from '@comparte-tu-tiempo/contracts';
import { ExchangeEntity } from '../domain/exchange.entity';
import { EXCHANGE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface ListExchangesRequest {
  query: ExchangeListQuery;
  userId?: string; // Optional filter by user
}

export interface ListExchangesResponse {
  exchanges: {
    exchanges: ExchangeEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

@Injectable()
export class ListExchangesUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY_TOKEN)
    private readonly exchangeRepository: ExchangeRepositoryPort
  ) {}

  async execute(request: ListExchangesRequest): Promise<ListExchangesResponse> {
    const { query, userId } = request;

    // If userId is provided, filter exchanges where user is involved
    const filteredQuery = userId 
      ? { ...query, requestedById: userId, offeredById: userId }
      : query;

    const result = await this.exchangeRepository.list(filteredQuery);

    return { exchanges: result };
  }
}
