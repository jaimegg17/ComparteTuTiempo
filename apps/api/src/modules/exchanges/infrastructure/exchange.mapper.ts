import { ExchangeEntity } from '../domain/exchange.entity';
import { ExchangeStatus } from '@comparte-tu-tiempo/contracts';

type ExchangeStatusType = keyof typeof ExchangeStatus;

export class ExchangeMapper {
  static toDomain(prismaExchange: any): ExchangeEntity {
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

  static toPrisma(exchange: ExchangeEntity): any {
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

  static toPrismaCreate(data: any): any {
    return {
      requestedById: data.requestedById,
      offeredById: data.offeredById,
      serviceId: data.serviceId,
      date: data.date,
      state: data.state || ExchangeStatus.PENDING,
      exchangedTime: data.exchangedTime,
    };
  }

  static toPrismaUpdate(data: any): any {
    const updateData: any = {};
    
    if (data.date !== undefined) updateData.date = data.date;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.exchangedTime !== undefined) updateData.exchangedTime = data.exchangedTime;
    
    return updateData;
  }
}
