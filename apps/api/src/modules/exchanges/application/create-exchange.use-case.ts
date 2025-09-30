import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeCreate } from '@comparte-tu-tiempo/contracts';
import { ExchangeEntity } from '../domain/exchange.entity';
import { EXCHANGE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface CreateExchangeRequest {
  data: ExchangeCreate;
  userId: string; // The user creating the exchange
}

export interface CreateExchangeResponse {
  exchange: ExchangeEntity;
}

@Injectable()
export class CreateExchangeUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY_TOKEN)
    private readonly exchangeRepository: ExchangeRepositoryPort
  ) {}

  async execute(request: CreateExchangeRequest): Promise<CreateExchangeResponse> {
    const { data, userId } = request;

    // Business logic validation
    if (data.requestedById === data.offeredById) {
      throw new BadRequestException('Un usuario no puede intercambiar consigo mismo');
    }

    if (data.exchangedTime <= 0) {
      throw new BadRequestException('El tiempo intercambiado debe ser mayor a 0');
    }

    if (data.date < new Date()) {
      throw new BadRequestException('La fecha del intercambio no puede ser en el pasado');
    }

    // Check if user is either the requester or the offerer
    if (userId !== data.requestedById && userId !== data.offeredById) {
      throw new BadRequestException('Solo puedes crear intercambios donde participes');
    }

    const exchange = await this.exchangeRepository.create(data);

    return { exchange };
  }
}
