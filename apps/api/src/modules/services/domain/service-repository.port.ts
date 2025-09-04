import { Service } from './service.entity';
import { ServiceCreate, ServiceUpdate, ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';

export interface ServiceRepositoryPort {
  create(data: ServiceCreate, userId: string): Promise<Service>;
  findById(id: number): Promise<Service | null>;
  findByUserId(userId: string): Promise<Service[]>;
  list(query: ServiceListQuery): Promise<ServiceListResponse>;
  update(id: number, data: ServiceUpdate, userId: string): Promise<Service>;
  delete(id: number, userId: string): Promise<void>;
  exists(id: number): Promise<boolean>;
}
