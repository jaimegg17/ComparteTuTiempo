import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ExchangeEntity } from '../domain/exchange.entity';
import { ExchangeRepositoryPort } from '../domain/exchange-repository.port';
import { ExchangeCreate, ExchangeUpdate, ExchangeListQuery } from '@comparte-tu-tiempo/contracts';
import { ExchangeMapper } from './exchange.mapper';

@Injectable()
export class PrismaExchangeRepository implements ExchangeRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: ExchangeCreate): Promise<ExchangeEntity> {
    const prismaExchange = await this.prisma.exchange.create({
      data: ExchangeMapper.toPrismaCreate(data),
    });

    return ExchangeMapper.toDomain(prismaExchange);
  }

  async findById(id: number): Promise<ExchangeEntity | null> {
    const prismaExchange = await this.prisma.exchange.findUnique({
      where: { id },
    });

    return prismaExchange ? ExchangeMapper.toDomain(prismaExchange) : null;
  }

  async findByUserId(userId: string): Promise<ExchangeEntity[]> {
    const prismaExchanges = await this.prisma.exchange.findMany({
      where: {
        OR: [
          { requestedById: userId },
          { offeredById: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return prismaExchanges.map(ExchangeMapper.toDomain);
  }

  async findByServiceId(serviceId: number): Promise<ExchangeEntity[]> {
    const prismaExchanges = await this.prisma.exchange.findMany({
      where: { serviceId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaExchanges.map(ExchangeMapper.toDomain);
  }

  async findByRequestedById(userId: string): Promise<ExchangeEntity[]> {
    const prismaExchanges = await this.prisma.exchange.findMany({
      where: { requestedById: userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaExchanges.map(ExchangeMapper.toDomain);
  }

  async findByOfferedById(userId: string): Promise<ExchangeEntity[]> {
    const prismaExchanges = await this.prisma.exchange.findMany({
      where: { offeredById: userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaExchanges.map(ExchangeMapper.toDomain);
  }

  async update(id: number, data: ExchangeUpdate): Promise<ExchangeEntity> {
    const prismaExchange = await this.prisma.exchange.update({
      where: { id },
      data: ExchangeMapper.toPrismaUpdate(data),
    });

    return ExchangeMapper.toDomain(prismaExchange);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.exchange.delete({
      where: { id },
    });
  }

  async list(query: ExchangeListQuery): Promise<{
    exchanges: ExchangeEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page, pageSize, requestedById, offeredById, serviceId, state } = query;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (requestedById) {
      where.requestedById = requestedById;
    }
    
    if (offeredById) {
      where.offeredById = offeredById;
    }
    
    if (serviceId) {
      where.serviceId = serviceId;
    }
    
    if (state) {
      where.state = state;
    }

    // Get total count
    const total = await this.prisma.exchange.count({ where });

    // Get paginated results
    const prismaExchanges = await this.prisma.exchange.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const exchanges = prismaExchanges.map(ExchangeMapper.toDomain);
    const totalPages = Math.ceil(total / pageSize);

    return {
      exchanges,
      total,
      page,
      pageSize,
      totalPages,
    };
  }
}
