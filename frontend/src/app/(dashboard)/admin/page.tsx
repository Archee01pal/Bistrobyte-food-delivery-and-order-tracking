'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/summary');
      setData(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) return <Loader label="Loading metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchMetrics} />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Summary Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{data?.totalOrders || 0}</p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">{data?.completedOrders || 0}</p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{data?.cancelledOrders || 0}</p>
        </div>
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-blue-600">${data?.revenue?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
    </div>
  );
}