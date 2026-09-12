'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { AppNotification } from '@/types/order.types';
import { useAuth } from './auth-context';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data);
    } catch {
      // Fallback fallback mock feed if backend notification service is offline
      setNotifications([
        {
          id: 'n1',
          title: 'Order Confirmed',
          message: 'Your order #ORD-8821 has been received by the kitchen.',
          type: 'CONFIRMATION',
          read: false,
          createdAt: new Date().toISOString(),
          orderId: 'ORD-8821',
        },
        {
          id: 'n2',
          title: 'Delivery Partner Assigned',
          message: 'Driver Alex has been assigned to your order.',
          type: 'ASSIGNMENT',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          orderId: 'ORD-8821',
        },
      ]);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};