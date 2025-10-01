import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeUpdate, ExchangeStatus } from '@comparte-tu-tiempo/contracts';
import { PrismaService } from '@/common/prisma/prisma.service';

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
    private readonly exchangeRepository: ExchangeRepositoryPort,
    private readonly prisma: PrismaService,
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

    // If completing the exchange, transfer timeCredits
    if (data.state === ExchangeStatus.COMPLETED) {
      await this.transferTimeCredits(existingExchange);
    }

    const updatedExchange = await this.exchangeRepository.update(id, data);

    return { exchange: updatedExchange };
  }

  private async transferTimeCredits(exchange: ExchangeEntity): Promise<void> {
    // Get the service to know the duration/price
    const service = await this.prisma.service.findUnique({
      where: { id: exchange.serviceId },
    });

    if (!service) {
      throw new NotFoundException('Servicio no encontrado');
    }

    // Calculate credits to transfer (using exchangedTime or service duration in minutes)
    const creditsToTransfer = Math.round((exchange.exchangedTime || service.duration) * 60); // Convert hours to minutes

    // Perform the transfer in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Deduct credits from requester (who "buys" the service)
      const requester = await tx.user.findUnique({
        where: { id: exchange.requestedById },
      });

      if (!requester) {
        throw new NotFoundException('Usuario solicitante no encontrado');
      }

      if (requester.timeCredits < creditsToTransfer) {
        throw new BadRequestException(
          `Créditos insuficientes. Tienes ${requester.timeCredits} minutos, necesitas ${creditsToTransfer} minutos`
        );
      }

      await tx.user.update({
        where: { id: exchange.requestedById },
        data: { timeCredits: { decrement: creditsToTransfer } },
      });

      // Add credits to offerer (who provides the service)
      await tx.user.update({
        where: { id: exchange.offeredById },
        data: { timeCredits: { increment: creditsToTransfer } },
      });
    });
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
