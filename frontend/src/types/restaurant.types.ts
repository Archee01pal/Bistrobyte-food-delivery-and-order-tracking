export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  cuisineType: string;
  operatingHours: string;
  isOpen: boolean;
  rating?: number;
  imageUrl?: string;
  menu?: MenuItem[];
}

export interface RestaurantQueryParams {
  search?: string;
  cuisine?: string;
  isOpen?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}