export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
}

// DAY 09: Shopping Cart StructuralBlueprints
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