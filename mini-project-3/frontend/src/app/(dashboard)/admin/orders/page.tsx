'use client';

import { useEffect, useState } from 'react';
import { getMyOrdersApi, updateOrderStatusApi } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types/order.types';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await getMyOrdersApi();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
        return;
      }
    } catch {
      console.warn('Backend unavailable, falling back to local storage orders.');
    }

    // LocalStorage Fallback for Admin Panel
    if (typeof window !== 'undefined') {
      const localOrders: Order[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('latest_order_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              const orderId = key.replace('latest_order_', '');
              const currentStatus = (localStorage.getItem(`order_status_${orderId}`) || 'CONFIRMED') as OrderStatus;
              
              localOrders.push({
                ...parsed,
                id: orderId,
                status: currentStatus,
              });
            }
          } catch (e) {
            console.error('Failed parsing local order:', e);
          }
        }
      }
      setOrders(localOrders);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update backend
      await updateOrderStatusApi(orderId, newStatus);
    } catch {
      console.warn('Backend update failed, applying status update locally.');
    }

    // Persist status update to local storage state
    if (typeof window !== 'undefined') {
      localStorage.setItem(`order_status_${orderId}`, newStatus);
    }

    fetchOrders();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Restaurant Order Management</h1>
      
      {orders.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border text-slate-500">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
              <div>
                <p className="font-bold text-slate-800">Order #{o.orderNumber || (o.id ? o.id.slice(-6) : 'N/A')}</p>
                <p className="text-sm text-slate-500">
                  Status: <span className="font-semibold text-emerald-600">{o.status}</span>
                </p>
              </div>
              <div className="flex gap-2">
                {VALID_TRANSITIONS[o.status]?.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusUpdate(o.id, nextStatus)}
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition"
                  >
                    Mark as {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}