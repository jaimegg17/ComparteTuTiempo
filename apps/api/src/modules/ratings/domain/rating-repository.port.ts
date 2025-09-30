import { RatingEntity } from './rating.entity';
import { RatingCreate, RatingUpdate, RatingListQuery } from '@comparte-tu-tiempo/contracts';

export interface RatingRepositoryPort {
  create(data: RatingCreate): Promise<RatingEntity>;
  findById(id: number): Promise<RatingEntity | null>;
  findByUserId(userId: string): Promise<RatingEntity[]>;
  findByServiceId(serviceId: number): Promise<RatingEntity[]>;
  findByUserAndService(userId: string, serviceId: number): Promise<RatingEntity | null>;
  update(id: number, data: RatingUpdate): Promise<RatingEntity>;
  delete(id: number): Promise<void>;
  list(query: RatingListQuery): Promise<{
    ratings: RatingEntity[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>;
}
