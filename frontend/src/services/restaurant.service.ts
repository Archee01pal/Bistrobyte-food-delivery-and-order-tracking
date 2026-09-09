import { apiClient } from '@/lib/api-client';
import { Restaurant, RestaurantQueryParams, PaginatedResponse } from '@/types/restaurant.types';

export const RestaurantService = {
  getAll: async (params?: RestaurantQueryParams): Promise<PaginatedResponse<Restaurant> | Restaurant[]> => {
    const { data } = await apiClient.get('/restaurants', { params });
    return data;
  },

  getById: async (id: string): Promise<Restaurant> => {
    const { data } = await apiClient.get(`/restaurants/${id}`);
    return data;
  },
};