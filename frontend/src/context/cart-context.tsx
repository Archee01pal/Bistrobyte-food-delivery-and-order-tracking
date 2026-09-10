'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './auth-context';

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await apiClient.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch backend cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
      setIsLoading(false);
    }
  }, [user]);

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    try {
      await apiClient.post('/cart/items', { menuItemId, quantity });
      await fetchCart();
    } catch (err) {
      console.error('Failed to update item quantity:', err);
    }
  };

  const removeFromCart = async (menuItemId: string) => {
    try {
      await apiClient.delete(`/cart/items/${menuItemId}`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove item from cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      await apiClient.delete('/cart');
      setCart(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setCart(null);
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const restaurantName = cart?.restaurant?.name || cart?.restaurantName || '';

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        restaurantName,
        fetchCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);