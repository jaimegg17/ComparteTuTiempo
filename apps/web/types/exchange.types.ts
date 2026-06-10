export type ExchangeState = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export interface ExchangeService {
  id: number;
  title: string;
  duration: number;
  category: string;
  imageUrl?: string;
}

export interface ExchangeUser {
  id: string;
  name: string;
  imageUrl?: string;
  email: string;
}

export interface Exchange {
  id: number;
  serviceId: number;
  requestedById: string;
  offeredById: string;
  state: ExchangeState;
  message?: string;
  createdAt: string;
  updatedAt: string;
  service?: ExchangeService;
  requestedBy?: ExchangeUser;
  offeredBy?: ExchangeUser;
}

export interface ExchangesListResponse {
  exchanges: Exchange[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

