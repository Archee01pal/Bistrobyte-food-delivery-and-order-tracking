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
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 2 hours in milliseconds (2 * 60 * 60 * 1000)
const EXPIRATION_TIME_MS = 2 * 60 * 60 * 1000;

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Helper to filter out items older than 2 hours
  const filterExpired = (items: AppNotification[]): AppNotification[] => {
    const now = Date.now();
    return items.filter((item) => {
      const itemTime = new Date(item.createdAt).getTime();
      return now - itemTime < EXPIRATION_TIME_MS;
    });
  };

  const getReadNotificationIds = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('read_notification_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveReadNotificationId = (id: string) => {
    if (typeof window === 'undefined') return;
    try {
      const readIds = getReadNotificationIds();
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem('read_notification_ids', JSON.stringify(readIds));
      }
    } catch (e) {
      console.error('Failed to persist read notification state:', e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(filterExpired(res.data));
        return;
      }
    } catch {
      console.warn('Backend notification fetch failed, loading active local order notifications.');
    }

    const dynamicNotifications: AppNotification[] = [];
    const readIds = getReadNotificationIds();

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('latest_order_')) {
          try {
            const rawData = localStorage.getItem(key);
            if (rawData) {
              const orderId = key.replace('latest_order_', '');
              const parsed = JSON.parse(rawData);
              const displayId = orderId.startsWith('ORD-') ? orderId : `ORD-${orderId.slice(-6)}`;
              const currentStatus = localStorage.getItem(`order_status_${orderId}`) || 'CONFIRMED';
              const notifId = `notif-${displayId}`;

              dynamicNotifications.push({
                id: notifId,
                title: `Order ${currentStatus.replace('_', ' ')}`,
                message: `Your order #${displayId} has been updated to ${currentStatus.toLowerCase().replace('_', ' ')}.`,
                type: currentStatus === 'DELIVERED' ? 'COMPLETION' : 'CONFIRMATION',
                read: readIds.includes(notifId),
                createdAt: parsed.createdAt || new Date().toISOString(),
                orderId: displayId,
              });
            }
          } catch (e) {
            console.error('Failed reading order notification from storage:', e);
          }
        }
      }
    }

    // Apply the 2-hour filter to local notifications
    setNotifications(filterExpired(dynamicNotifications));
  };

  useEffect(() => {
    fetchNotifications();
    
    // Periodically re-check and clean up expired notifications every 5 minutes
    const interval = setInterval(() => {
      setNotifications((prev) => filterExpired(prev));
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const addNotification = (notif: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const notifId = notif.orderId ? `notif-${notif.orderId}` : `notif-${Date.now()}`;
    
    const newNotification: AppNotification = {
      ...notif,
      id: notifId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => {
      const filtered = prev.filter(
        (n) => (notif.orderId && n.orderId !== notif.orderId) && n.id !== notifId
      );
      return filterExpired([newNotification, ...filtered]);
    });
  };

  const markAsRead = (id: string) => {
    saveReadNotificationId(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        saveReadNotificationId(n.id);
        return { ...n, read: true };
      })
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        addNotification,
      }}
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