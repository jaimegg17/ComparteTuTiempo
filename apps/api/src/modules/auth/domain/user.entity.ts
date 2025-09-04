export interface User {
  id: string; // Auth0 user ID as primary key
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  skills: string[];
  imageUrl?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreate {
  id: string; // Auth0 user ID
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  imageUrl?: string;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  name?: string;
  phoneNumber?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  imageUrl?: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}
