export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  contact: string;
  operatingHours: string;
  menu?: MenuItem[];
}