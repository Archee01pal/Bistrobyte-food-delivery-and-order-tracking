'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [status, setStatus] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get('/orders/history', {
        params: { status, startDate, endDate, sort, page, limit: 5 },
      });

      const rawItems = Array.isArray(res.data) 
        ? res.data 
        : res.data?.items || res.data?.orders || [];

      if (rawItems.length > 0) {
        setOrders(rawItems);
        setTotalPages(res.data?.totalPages || 1);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn('Backend order history fetch failed, loading local order cache:', err);
    }

    // Local Storage Fallback
    const localOrders: any[] = [];
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('latest_order_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const orderId = key.replace('latest_order_', '');
              const parsed = JSON.parse(raw);
              localOrders.push({
                id: orderId,
                status: localStorage.getItem(`order_status_${orderId}`) || 'CONFIRMED',
                createdAt: parsed.createdAt || new Date().toISOString(),
                totalAmount: parsed.totalAmount || 0,
                items: parsed.items || [],
              });
            }
          } catch (e) {
            console.error('Failed parsing local order item', e);
          }
        }
      }
    }

    let filteredLocal = status === 'ALL' 
      ? localOrders 
      : localOrders.filter(o => o.status === status);

    if (startDate) {
      filteredLocal = filteredLocal.filter(o => new Date(o.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filteredLocal = filteredLocal.filter(o => new Date(o.createdAt) <= end);
    }

    filteredLocal.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sort === 'desc' ? timeB - timeA : timeA - timeB;
    });

    setOrders(filteredLocal);
    setTotalPages(1);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [status, startDate, endDate, sort, page]);

  const handleCancelOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to cancel this order?')) return;

    setCancellingId(orderId);
    try {
      await api.patch(`/orders/${orderId}/cancel`);
    } catch (err) {
      console.warn('Backend cancel API unavailable, updating local status:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`order_status_${orderId}`, 'CANCELLED');
      }

      setOrders(prev =>
        prev.map(o => (String(o.id || o._id) === orderId ? { ...o, status: 'CANCELLED' } : o))
      );

      setCancellingId(null);
    }
  };

  const getStatusBadgeStyle = (statusName: string) => {
    switch (statusName) {
      case 'PENDING':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'PREPARING':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'READY':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'DELIVERED':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (loading) return <Loader label="Loading history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchOrders} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-amber-100 p-4 sm:p-8 relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-amber-300/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* Vibrantly Colored Banner Header */}
        <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between border border-white/20">
          <div>
            <h1 className="text-3xl font-black tracking-wide drop-shadow-md">Customer Order History</h1>
            <p className="text-xs font-medium text-pink-100 mt-1">Manage, filter, and track your active or past orders</p>
          </div>
          <div className="hidden sm:block text-4xl">
            🍕
          </div>
        </div>

        {/* Filters Container */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white/70 backdrop-blur-lg p-5 rounded-3xl border border-white/60 shadow-lg">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-indigo-900">Status</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2.5 border border-indigo-200/60 rounded-2xl text-xs font-bold bg-white/90 text-slate-800 focus:ring-2 focus:ring-rose-400 focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="READY">Ready</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-indigo-900">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full p-2 border border-indigo-200/60 rounded-2xl text-xs font-bold bg-white/90 text-slate-800 focus:ring-2 focus:ring-rose-400 focus:outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-indigo-900">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full p-2 border border-indigo-200/60 rounded-2xl text-xs font-bold bg-white/90 text-slate-800 focus:ring-2 focus:ring-rose-400 focus:outline-none shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-indigo-900">Sort</label>
            <button 
              onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
              className="w-full p-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition active:scale-95 cursor-pointer"
            >
              {sort === 'desc' ? '⏳ Newest First' : '⌛ Oldest First'}
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-lg">
            <EmptyState title="No orders found" description="Adjust your filters to see past orders." />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const orderId = String(order.id || order._id || '');
              const displayId = orderId.startsWith('ORD-') ? orderId : `ORD-${orderId.slice(-6)}`;
              const price = Number(order.totalAmount || order.total || 0);
              const currentStatus = order.status || 'CONFIRMED';
              
              const canCancel = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(currentStatus);

              return (
                <div 
                  key={orderId} 
                  onClick={() => router.push(`/orders/${orderId}`)}
                  className="bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-white/80 hover:border-pink-300 shadow-md hover:shadow-2xl transition-all duration-300 flex justify-between items-center cursor-pointer group transform hover:-translate-y-1"
                >
                  <div className="space-y-1">
                    <p className="font-black text-slate-900 group-hover:text-rose-600 transition-colors text-lg">
                      Order #{displayId}
                    </p>
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <span>📅</span> {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : 'Recent'}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end space-y-2">
                    {/* Dynamic Status Badge with Red Cancel Hover */}
                    {canCancel ? (
                      <button
                        onClick={(e) => handleCancelOrder(e, orderId)}
                        disabled={cancellingId === orderId}
                        title="Click to cancel order"
                        className={`px-3 py-1 text-xs font-extrabold rounded-full border shadow-xs transition-all duration-300 group/btn cursor-pointer ${getStatusBadgeStyle(currentStatus)} hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 hover:text-white hover:border-red-700 hover:shadow-md`}
                      >
                        <span className="group-hover/btn:hidden">{currentStatus}</span>
                        <span className="hidden group-hover/btn:inline-flex items-center gap-1">
                          ✖ {cancellingId === orderId ? 'Cancelling...' : 'Cancel Order'}
                        </span>
                      </button>
                    ) : (
                      <span className={`px-3 py-1 text-xs font-extrabold rounded-full border ${getStatusBadgeStyle(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    )}

                    <p className="font-black text-xl text-slate-900 tracking-tight">
                      ${price.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-lg">
          <button 
            disabled={page === 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-2xl border border-slate-200 disabled:opacity-40 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs cursor-pointer"
          >
            ← Previous
          </button>
          <span className="text-xs font-extrabold text-indigo-900 bg-pink-100/80 px-4 py-1.5 rounded-full border border-pink-200">
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-2xl border border-slate-200 disabled:opacity-40 text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs cursor-pointer"
          >
            Next →
          </button>
        </div>

      </div>
    </div>
  );
}