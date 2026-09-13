'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

export default function DeliveryDashboardPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/delivery/active');
      setDeliveries(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (deliveryId: string, status: string) => {
    try {
      await api.patch(`/delivery/${deliveryId}/status`, { status });
      fetchDeliveries();
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  if (loading) return <Loader label="Fetching active delivery tasks..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDeliveries} />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Delivery Driver Dispatch</h1>

      {deliveries.length === 0 ? (
        <EmptyState title="No active assignments" description="Available delivery requests will show up here." />
      ) : (
        <div className="grid gap-4">
          {deliveries.map((item) => (
            <div key={item.id} className="border p-4 bg-white rounded-lg flex justify-between items-center shadow-sm">
              <div>
                <p className="font-bold">Delivery #{item.id.slice(-6)}</p>
                <p className="text-sm text-gray-600">Drop-off: {item.deliveryAddress}</p>
                <span className="inline-block mt-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                  {item.status}
                </span>
              </div>
              <div className="flex gap-2">
                {item.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'IN_TRANSIT')}
                    className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded"
                  >
                    Start Transit
                  </button>
                )}
                {item.status === 'IN_TRANSIT' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'DELIVERED')}
                    className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded"
                  >
                    Mark Delivered
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