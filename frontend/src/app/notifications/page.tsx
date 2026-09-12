'use client';

import React from 'react';
import { useNotifications } from '@/context/notification-context';
import { Bell, Check, Clock, AlertTriangle, PackageCheck, Truck } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'CONFIRMATION':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'ASSIGNMENT':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'COMPLETION':
        return <PackageCheck className="w-5 h-5 text-emerald-500" />;
      case 'TIMEOUT':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white border p-4 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">All Notifications</h1>
          <p className="text-xs text-slate-500">
            View your order alerts, status updates, and delivery notifications
          </p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
          >
            <Check className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden divide-y">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No notifications found.</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markAsRead(item.id)}
              className={`p-4 cursor-pointer transition flex items-start gap-4 ${
                item.read ? 'bg-white' : 'bg-emerald-50/40'
              }`}
            >
              <div className="p-2 bg-slate-100 rounded-full mt-0.5">{getIcon(item.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 text-sm">{item.title}</h3>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{item.message}</p>
                {item.orderId && (
                  <span className="inline-block mt-2 text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Order ID: {item.orderId}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}