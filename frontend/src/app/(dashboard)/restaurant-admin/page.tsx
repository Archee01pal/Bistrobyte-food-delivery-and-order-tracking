'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

export default function RestaurantDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/restaurant/orders');
      setOrders(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/restaurant/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loader label="Loading restaurant dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Restaurant Kitchen Operations</h1>

      {orders.length === 0 ? (
        <EmptyState title="No active kitchen orders" description="New orders will appear here automatically." />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border p-4 bg-white rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold">Order #{order.id.slice(-6)}</p>
                <p className="text-sm text-gray-500">Items: {order.items?.length || 0}</p>
                <p className="text-xs text-amber-600 font-semibold mt-1">Status: {order.status}</p>
              </div>
              <div className="flex gap-2">
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium"
                  >
                    Accept & Prepare
                  </button>
                )}
                {order.status === 'PREPARING' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}