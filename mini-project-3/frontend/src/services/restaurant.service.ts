import { apiClient } from '@/lib/api-client';
import { Restaurant, MenuItem } from '@/types/restaurant.types';

export const RestaurantService = {
  getAll: async (): Promise<Restaurant[]> => {
    const { data } = await apiClient.get('/restaurants');
    return data;
  },

  getById: async (id: string): Promise<Restaurant> => {
    const { data } = await apiClient.get(`/restaurants/${id}`);
    return data;
  },

  create: async (payload: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
    const { data } = await apiClient.post('/restaurants', payload);
    return data;
  },

  addMenuItem: async (restaurantId: string, payload: Omit<MenuItem, 'id' | 'restaurantId'>): Promise<MenuItem> => {
    const { data } = await apiClient.post(`/restaurants/${restaurantId}/menu`, payload);
    return data;
  },

  toggleMenuAvailability: async (restaurantId: string, menuItemId: string, isAvailable: boolean): Promise<MenuItem> => {
    const { data } = await apiClient.patch(`/restaurants/${restaurantId}/menu/${menuItemId}`, { isAvailable });
    return data;
  },
};