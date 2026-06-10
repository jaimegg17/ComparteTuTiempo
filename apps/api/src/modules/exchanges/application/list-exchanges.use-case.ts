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

    // If userId is provided and no specific filters are set, we need to filter
    // exchanges where the user is either the requester OR the offerer
    // The repository's list method uses AND logic, so we can't pass both IDs
    // We'll need to handle this at the repository level or use a different approach
    
    const result = await this.exchangeRepository.list(query);

    // If userId is provided, filter results to only include exchanges where user is involved
    if (userId && !query.requestedById && !query.offeredById) {
      const filteredExchanges = result.exchanges.filter(
        (exchange: ExchangeEntity) =>
          exchange.requestedById === userId || exchange.offeredById === userId
      );
      
      return {
        exchanges: {
          exchanges: filteredExchanges,
          total: filteredExchanges.length,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: Math.ceil(filteredExchanges.length / result.pageSize),
        },
      };
    }

    return { exchanges: result };
  }
}
