export type DeliveryStatus = 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface StatusHistory {
  status: DeliveryStatus | string;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  deliveryAddress: string;
  restaurantName: string;
  totalAmount: number;
  status: DeliveryStatus;
  items: OrderItem[];
  statusHistory: StatusHistory[];
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'CONFIRMATION' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'COMPLETION' | 'TIMEOUT';
  read: boolean;
  createdAt: string;
  orderId?: string;
}