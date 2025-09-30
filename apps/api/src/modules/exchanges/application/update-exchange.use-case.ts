import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeUpdate, ExchangeStatus } from '@comparte-tu-tiempo/contracts';

type ExchangeStatusType = keyof typeof ExchangeStatus;
import { ExchangeEntity } from '../domain/exchange.entity';
import { EXCHANGE_REPOSITORY_TOKEN } from '../domain/tokens';

export interface UpdateExchangeRequest {
  id: number;
  data: ExchangeUpdate;
  userId: string; // The user making the update
}

export interface UpdateExchangeResponse {
  exchange: ExchangeEntity;
}

@Injectable()
export class UpdateExchangeUseCase {
  constructor(
    @Inject(EXCHANGE_REPOSITORY_TOKEN)
    private readonly exchangeRepository: ExchangeRepositoryPort
  ) {}

  async execute(request: UpdateExchangeRequest): Promise<UpdateExchangeResponse> {
    const { id, data, userId } = request;

    const existingExchange = await this.exchangeRepository.findById(id);
    if (!existingExchange) {
      throw new NotFoundException('Intercambio no encontrado');
    }

    // Check if user is authorized to update this exchange
    if (userId !== existingExchange.requestedById && userId !== existingExchange.offeredById) {
      throw new ForbiddenException('No tienes permisos para actualizar este intercambio');
    }

    // Business logic validation based on state transitions
    if (data.state) {
      this.validateStateTransition(existingExchange.state, data.state, userId, existingExchange);
    }

    // Additional validations
    if (data.date && data.date < new Date()) {
      throw new BadRequestException('La fecha del intercambio no puede ser en el pasado');
    }

    if (data.exchangedTime && data.exchangedTime <= 0) {
      throw new BadRequestException('El tiempo intercambiado debe ser mayor a 0');
    }

    const updatedExchange = await this.exchangeRepository.update(id, data);

    return { exchange: updatedExchange };
  }

  private validateStateTransition(
    currentState: ExchangeStatusType,
    newState: ExchangeStatusType,
    userId: string,
    exchange: ExchangeEntity
  ): void {
    // Define valid state transitions
    const validTransitions: Record<ExchangeStatusType, ExchangeStatusType[]> = {
      [ExchangeStatus.PENDING]: [ExchangeStatus.CONFIRMED, ExchangeStatus.CANCELLED],
      [ExchangeStatus.CONFIRMED]: [ExchangeStatus.IN_PROGRESS, ExchangeStatus.CANCELLED],
      [ExchangeStatus.IN_PROGRESS]: [ExchangeStatus.COMPLETED, ExchangeStatus.DISPUTED],
      [ExchangeStatus.COMPLETED]: [], // Final state
      [ExchangeStatus.CANCELLED]: [], // Final state
      [ExchangeStatus.DISPUTED]: [ExchangeStatus.COMPLETED, ExchangeStatus.CANCELLED],
    };

    if (!validTransitions[currentState].includes(newState)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${currentState} a ${newState}`
      );
    }

    // Check permissions for specific state changes
    if (newState === ExchangeStatus.CONFIRMED && userId !== exchange.offeredById) {
      throw new ForbiddenException('Solo el usuario que ofrece el servicio puede confirmar el intercambio');
    }

    if (newState === ExchangeStatus.IN_PROGRESS && userId !== exchange.requestedById) {
      throw new ForbiddenException('Solo el usuario que solicita el servicio puede iniciar el intercambio');
    }

    if (newState === ExchangeStatus.COMPLETED && userId !== exchange.offeredById) {
      throw new ForbiddenException('Solo el usuario que ofrece el servicio puede completar el intercambio');
    }
  }
}
