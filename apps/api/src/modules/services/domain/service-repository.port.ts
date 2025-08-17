import { Service } from './service.entity';
import { ServiceCreate, ServiceUpdate, ServiceListQuery, ServiceListResponse } from '@comparte-tu-tiempo/contracts';

export interface ServiceRepositoryPort {
  create(data: ServiceCreate, userId: number): Promise<Service>;
  findById(id: number): Promise<Service | null>;
  findByUserId(userId: number): Promise<Service[]>;
  list(query: ServiceListQuery): Promise<ServiceListResponse>;
  update(id: number, data: ServiceUpdate, userId: number): Promise<Service>;
  delete(id: number, userId: number): Promise<void>;
  exists(id: number): Promise<boolean>;
}
