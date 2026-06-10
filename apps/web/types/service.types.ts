export interface RatingItem {
  id: number;
  score: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface ServiceUser {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  location?: string;
  bio?: string;
  skills: string[];
  timeCredits: number;
  createdAt: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  detailedDescription?: string;
  price: number;
  duration: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  placeId?: string | null;
  availability?: string;
  category: string;
  type: string;
  intent: 'OFFER' | 'REQUEST';
  status: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: ServiceUser;
  ratings?: RatingItem[];
  averageRating?: number;
  totalRatings?: number;
  totalExchanges?: number;
  _count?: {
    ratings: number;
    exchanges: number;
  };
}
