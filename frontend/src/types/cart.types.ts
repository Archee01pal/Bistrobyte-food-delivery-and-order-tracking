import { MenuItem } from './restaurant.types';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
}