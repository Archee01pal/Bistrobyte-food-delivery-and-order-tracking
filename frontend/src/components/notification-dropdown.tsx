'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Clock, AlertTriangle, PackageCheck, Truck, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '@/context/notification-context';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Deduplicate notifications per order: keep only the latest status update per orderId
  const latestNotifications = notifications.reduce((acc, current) => {
    if (!current.orderId) {
      acc.push(current);
      return acc;
    }
    const existingIndex = acc.findIndex((n) => n.orderId === current.orderId);
    if (existingIndex === -1) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof notifications);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      markAllAsRead();
    }
  };

  const getStatusBadge = (type?: string, title?: string) => {
    const isDelivered = type === 'COMPLETION' || title?.toUpperCase().includes('DELIVERED');

    if (isDelivered) {
      return (
        <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      );
    }

    switch (type) {
      case 'CONFIRMATION':
        return (
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-full shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'ASSIGNMENT':
        return (
          <div className="p-1.5 bg-purple-100 text-purple-600 rounded-full shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        );
      case 'TIMEOUT':
        return (
          <div className="p-1.5 bg-red-100 text-red-600 rounded-full shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-1.5 bg-amber-100 text-amber-600 rounded-full shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-slate-100 transition focus:outline-none"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
            <span className="font-bold text-slate-800 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {latestNotifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 italic">
                No active notifications
              </div>
            ) : (
              latestNotifications.map((item) => {
                const isDelivered =
                  item.type === 'COMPLETION' || item.title?.toUpperCase().includes('DELIVERED');

                return (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-3 text-sm cursor-pointer transition flex items-start gap-3 ${
                      item.read ? 'bg-white opacity-80' : 'bg-emerald-50/40'
                    }`}
                  >
                    {/* Visual Status Indicator */}
                    {getStatusBadge(item.type, item.title)}

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-bold text-xs truncate ${
                            isDelivered ? 'text-emerald-800' : 'text-slate-800'
                          }`}
                        >
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 ml-2"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{item.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-semibold border-t transition"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}