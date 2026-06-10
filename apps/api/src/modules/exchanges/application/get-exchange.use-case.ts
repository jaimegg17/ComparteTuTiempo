import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import type { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeEntity } from '../domain/exchange.entity';
import { EXCHANGE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface GetExchangeRequest {
  id: number;
  userId: string; // The user requesting the exchange
}

export interface GetExchangeResponse {
  exchange: ExchangeEntity;
}

@Injectable()
export class GetExchangeUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY_TOKEN)
    private readonly exchangeRepository: ExchangeRepositoryPort
  ) {}

  async execute(request: GetExchangeRequest): Promise<GetExchangeResponse> {
    const { id, userId } = request;

    const exchange = await this.exchangeRepository.findById(id);
    if (!exchange) {
      throw new NotFoundException('Intercambio no encontrado');
    }

    // Check if user is authorized to view this exchange
    if (userId !== exchange.requestedById && userId !== exchange.offeredById) {
      throw new ForbiddenException('No tienes permisos para ver este intercambio');
    }

    return { exchange };
  }
}
