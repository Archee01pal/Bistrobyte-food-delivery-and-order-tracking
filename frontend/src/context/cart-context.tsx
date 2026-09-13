'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from './auth-context';

export const CartContext = createContext<any>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<any>({ items: [], subtotal: 0, restaurantName: '' });
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await apiClient.get('/cart');
      if (res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch backend cart, using local state fallback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Main Add to Cart function allowing items from any restaurant
  const addToCart = (item: any, restId?: string, restName?: string) => {
    const currentRestId = restId || item.restaurantId;
    const currentRestName = restName || item.restaurantName || 'Restaurant';

    if (currentRestId) setRestaurantId(currentRestId);

    setCart((prev: any) => {
      const existingItems = prev?.items || [];
      const existingIndex = existingItems.findIndex(
        (i: any) => i.id === item.id || i.menuItemId === item.id
      );

      let updatedItems = [];
      if (existingIndex > -1) {
        updatedItems = [...existingItems];
        const currentQty = updatedItems[existingIndex].quantity || 1;
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: currentQty + 1,
        };
      } else {
        updatedItems = [
          ...existingItems,
          { ...item, menuItemId: item.id, quantity: 1, restaurantId: currentRestId },
        ];
      }

      const newSubtotal = updatedItems.reduce(
        (acc: number, curr: any) => acc + curr.price * curr.quantity,
        0
      );

      return {
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal,
        restaurantName: currentRestName,
      };
    });

    apiClient
      .post('/cart/items', { menuItemId: item.id, quantity: 1, restaurantId: currentRestId })
      .catch(() => {});

    return { success: true };
  };

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    setCart((prev: any) => {
      const existingItems = prev?.items || [];
      const updatedItems = existingItems
        .map((i: any) => {
          if (i.id === menuItemId || i.menuItemId === menuItemId) {
            return { ...i, quantity: Math.max(0, quantity) };
          }
          return i;
        })
        .filter((i: any) => i.quantity > 0);

      const newSubtotal = updatedItems.reduce(
        (acc: number, curr: any) => acc + curr.price * curr.quantity,
        0
      );

      return {
        ...prev,
        items: updatedItems,
        subtotal: newSubtotal,
      };
    });

    try {
      await apiClient.post('/cart/items', { menuItemId, quantity });
    } catch (err) {
      console.error('Backend sync unavailable, updated locally');
    }
  };

  const removeFromCart = async (menuItemId: string) => {
    setCart((prev: any) => {
      const updatedItems = (prev?.items || []).filter(
        (i: any) => i.id !== menuItemId && i.menuItemId !== menuItemId
      );
      const newSubtotal = updatedItems.reduce(
        (acc: number, curr: any) => acc + curr.price * curr.quantity,
        0
      );
      return { ...prev, items: updatedItems, subtotal: newSubtotal };
    });

    try {
      await apiClient.delete(`/cart/items/${menuItemId}`);
    } catch (err) {
      console.error('Backend sync unavailable, removed locally');
    }
  };

  const clearCart = async () => {
    setCart({ items: [], subtotal: 0, restaurantName: '' });
    setRestaurantId(null);

    try {
      await apiClient.delete('/cart');
    } catch (err) {
      console.error('Backend sync unavailable, cleared locally');
    }
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const restaurantName = cart?.restaurantName || cart?.restaurant?.name || '';

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        subtotal,
        restaurantName,
        addToCart,
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: { items: [], subtotal: 0 },
      items: [],
      subtotal: 0,
      restaurantName: '',
      addToCart: () => ({ success: true }),
      fetchCart: () => {},
      updateQuantity: () => {},
      removeFromCart: () => {},
      clearCart: () => {},
      isLoading: false,
    };
  }
  return context;
};