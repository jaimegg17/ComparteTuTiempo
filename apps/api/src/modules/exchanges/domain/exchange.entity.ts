import { ExchangeStatus } from '@comparte-tu-tiempo/contracts';

type ExchangeStatusType = keyof typeof ExchangeStatus;

export class ExchangeEntity {
  constructor(
    public readonly id: number,
    public readonly requestedById: string,
    public readonly offeredById: string,
    public readonly serviceId: number,
    public readonly date: Date,
    public readonly state: ExchangeStatusType,
    public readonly exchangedTime: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // Business logic methods
  canBeCancelled(): boolean {
    return this.state === ExchangeStatus.PENDING || this.state === ExchangeStatus.CONFIRMED;
  }

  canBeCompleted(): boolean {
    return this.state === ExchangeStatus.IN_PROGRESS;
  }

  canBeConfirmed(): boolean {
    return this.state === ExchangeStatus.PENDING;
  }

  // Convert to contract format
  toContract() {
    return {
      id: this.id,
      requestedById: this.requestedById,
      offeredById: this.offeredById,
      serviceId: this.serviceId,
      date: this.date,
      state: this.state,
      exchangedTime: this.exchangedTime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
