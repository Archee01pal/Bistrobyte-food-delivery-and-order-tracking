'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Check, Clock, AlertTriangle, PackageCheck, Truck } from 'lucide-react';
import { useNotifications } from '@/context/notification-context';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONFIRMATION': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'ASSIGNMENT': return <Truck className="w-4 h-4 text-purple-500" />;
      case 'COMPLETION': return <PackageCheck className="w-4 h-4 text-emerald-500" />;
      case 'TIMEOUT': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
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

          <div className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3 text-sm cursor-pointer transition ${
                    item.read ? 'bg-white' : 'bg-emerald-50/50'
                  }`}
                >
                  <div className="flex gap-2 items-start">
                    <div className="mt-0.5">{getIcon(item.type)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 flex justify-between">
                        <span>{item.title}</span>
                        {!item.read && <span className="h-2 w-2 rounded-full bg-emerald-500"></span>}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            href="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center py-2 bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 font-semibold border-t"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}