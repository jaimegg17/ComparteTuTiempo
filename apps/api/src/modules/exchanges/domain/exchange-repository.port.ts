import { ExchangeEntity } from './exchange.entity';
import { ExchangeCreate, ExchangeUpdate, ExchangeListQuery } from '@comparte-tu-tiempo/contracts';

export interface ExchangeRepositoryPort {
  create(data: ExchangeCreate): Promise<ExchangeEntity>;
  findById(id: number): Promise<ExchangeEntity | null>;
  findByUserId(userId: string): Promise<ExchangeEntity[]>;
  findByServiceId(serviceId: number): Promise<ExchangeEntity[]>;
  findByRequestedById(userId: string): Promise<ExchangeEntity[]>;
  findByOfferedById(userId: string): Promise<ExchangeEntity[]>;
  update(id: number, data: ExchangeUpdate): Promise<ExchangeEntity>;
  delete(id: number): Promise<void>;
  list(query: ExchangeListQuery): Promise<{
    exchanges: ExchangeEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}
