'use client';
import { useEffect, useState } from 'react';
import { getMyOrdersApi, updateOrderStatusApi } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types';

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
    const res = await getMyOrdersApi();
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      fetchOrders();
    } catch {
      alert('Invalid transition');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Restaurant Order Management</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
            <div>
              <p className="font-bold">Order #{o.orderNumber || o.id.slice(0, 6)}</p>
              <p className="text-sm text-gray-500">Status: <span className="font-semibold text-emerald-600">{o.status}</span></p>
            </div>
            <div className="flex gap-2">
              {VALID_TRANSITIONS[o.status]?.map((nextStatus) => (
                <button
                  key={nextStatus}
                  onClick={() => handleStatusUpdate(o.id, nextStatus)}
                  className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700"
                >
                  Mark as {nextStatus}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}