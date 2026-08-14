export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// DAY 10: PRODUCT REVIEW MODELS
export interface Review {
  id: string;
  productId: string;
  userId: string;
  comment: string;
  rating: number;
  createdAt: Date;
}