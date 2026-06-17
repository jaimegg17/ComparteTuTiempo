import { Service as ServiceContract } from '@comparte-tu-tiempo/contracts';

// Extended Service interface that includes imageUrl
export interface ServiceWithImage extends ServiceContract {
  imageUrl?: string | null;
  communityId?: number | null;
}

// Extended Service entity that includes imageUrl
export interface ServiceCreateWithImage {
  title: string;
  description: string;
  detailedDescription?: string;
  duration: number;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string;
  placeId?: string;
  availability?: string;
  category: ServiceContract['category'];
  type: ServiceContract['type'];
  intent: ServiceContract['intent'];
  price: number;
  imageUrl?: string | null;
  communityId?: number | null;
}
