import { ExchangeEntity } from '../domain/exchange.entity';
import { ExchangeStatus, ExchangeCreate, ExchangeUpdate } from '@comparte-tu-tiempo/contracts';
import { Prisma } from '@prisma/client';

type ExchangeStatusType = keyof typeof ExchangeStatus;

interface ExchangePersistence {
  id: number;
  requestedById: string;
  offeredById: string;
  serviceId: number;
  date: Date;
  state: ExchangeStatusType;
  exchangedTime: Prisma.Decimal | number | null;
  createdAt: Date;
  updatedAt: Date;
}

export class ExchangeMapper {
  static toDomain(prismaExchange: ExchangePersistence): ExchangeEntity {
    return new ExchangeEntity(
      prismaExchange.id,
      prismaExchange.requestedById,
      prismaExchange.offeredById,
      prismaExchange.serviceId,
      prismaExchange.date,
      prismaExchange.state as ExchangeStatusType,
      prismaExchange.exchangedTime ? Number(prismaExchange.exchangedTime) : 0, // Convert Decimal to number, default to 0 if null
      prismaExchange.createdAt,
      prismaExchange.updatedAt,
    );
  }

  static toPrisma(exchange: ExchangeEntity): Prisma.ExchangeUncheckedCreateInput {
    return {
      id: exchange.id,
      requestedById: exchange.requestedById,
      offeredById: exchange.offeredById,
      serviceId: exchange.serviceId,
      date: exchange.date,
      state: exchange.state,
      exchangedTime: exchange.exchangedTime, // Will be converted to Decimal by Prisma
      createdAt: exchange.createdAt,
      updatedAt: exchange.updatedAt,
    };
  }

  static toPrismaCreate(data: ExchangeCreate): Prisma.ExchangeUncheckedCreateInput {
    return {
      requestedById: data.requestedById,
      offeredById: data.offeredById,
      serviceId: data.serviceId,
      date: data.date,
      exchangedTime: data.exchangedTime,
    };
  }

  static toPrismaUpdate(data: ExchangeUpdate): Prisma.ExchangeUncheckedUpdateInput {
    const updateData: Prisma.ExchangeUncheckedUpdateInput = {};
    
    if (data.date !== undefined) updateData.date = data.date;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.exchangedTime !== undefined) updateData.exchangedTime = data.exchangedTime;
    
    return updateData;
  }
}
