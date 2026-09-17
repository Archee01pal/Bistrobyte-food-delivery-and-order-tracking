'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  Search,
  ArrowUpDown,
  Download,
  CheckCircle2,
  Clock,
  ShoppingBag,
  RefreshCw,
  Calendar,
  User,
  ChevronRight,
  Package,
  XCircle,
  Utensils,
  ChevronLeft,
} from 'lucide-react';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { role, user } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Role Redirect: Ensure non-customers go to their dedicated routes
  useEffect(() => {
    const currentRole = role as string;
    if (currentRole === 'DRIVER') {
      router.replace('/driver');
    } else if (currentRole === 'SYSTEM_ADMIN' || currentRole === 'ADMIN') {
      router.replace('/admin/orders');
    }
  }, [role, router]);

  const isOrderClosed = (rawStatus: string) => {
    return ['DELIVERED', 'CANCELLED'].includes((rawStatus || '').toUpperCase());
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    let loadedOrders: any[] = [];
    let apiSuccess = false;

    try {
      // Customer-scoped endpoint
      const res = await api.get('/orders/my-orders', {
        params: { startDate, endDate, sort: sortOrder, page, limit: 10 },
      });

      const rawItems = Array.isArray(res.data)
        ? res.data
        : res.data?.items || res.data?.orders || [];

      if (rawItems.length > 0) {
        loadedOrders = rawItems;
        setTotalPages(res.data?.totalPages || 1);
        apiSuccess = true;
      }
    } catch (err) {
      console.warn('Backend fetch for customer orders failed, checking local cache:', err);
    }

    // Local Storage Fallback (User Scoped)
    if (typeof window !== 'undefined') {
      const localOrders: any[] = [];
      const userIdentifier = (user as any)?.email || (user as any)?.id || 'Guest';

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('latest_order_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const orderId = key.replace('latest_order_', '');
              const parsed = JSON.parse(raw);
              const statusOverride = localStorage.getItem(`order_status_${orderId}`);

              const belongsToUser =
                parsed.customerEmail === userIdentifier ||
                parsed.customerName === userIdentifier ||
                !parsed.customerEmail;

              if (belongsToUser) {
                localOrders.push({
                  id: orderId,
                  orderNumber: parsed.orderNumber || orderId,
                  customerName: parsed.customerName || '',
                  deliveryAddress: parsed.deliveryAddress || parsed.address || '',
                  status: statusOverride || parsed.status || 'CONFIRMED',
                  createdAt: parsed.createdAt || new Date().toISOString(),
                  totalAmount: Number(parsed.totalAmount || parsed.total || 0),
                  items: parsed.items || [],
                });
              }
            }
          } catch (e) {
            console.error('Failed parsing local order item', e);
          }
        }
      }

      const orderMap = new Map<string, any>();
      [...loadedOrders, ...localOrders].forEach((o) => {
        const cleanId = String(o.id || o._id || '');
        if (!orderMap.has(cleanId)) {
          orderMap.set(cleanId, o);
        } else {
          const existing = orderMap.get(cleanId);
          const localStatus = localStorage.getItem(`order_status_${cleanId}`);
          if (localStatus) existing.status = localStatus;
        }
      });

      loadedOrders = Array.from(orderMap.values());
    }

    if (!apiSuccess && loadedOrders.length === 0) {
      setError('Unable to sync live server orders. Displaying cached orders.');
    }

    setOrders(loadedOrders);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [role, startDate, endDate, sortOrder, page]);

  const metrics = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount || o.total || 0), 0);
    const active = orders.filter((o) => !isOrderClosed(o.status)).length;
    const completed = orders.filter((o) => isOrderClosed(o.status)).length;
    return { totalSpent, count: orders.length, active, completed };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const id = String(order.id || order._id || '');
        const orderNum = String(order.orderNumber || id);
        const query = searchQuery.toLowerCase();

        const matchesQuery = orderNum.toLowerCase().includes(query);
        if (!matchesQuery) return false;

        const currentStatus = (order.status || '').toUpperCase();
        if (statusFilter === 'OPEN' && isOrderClosed(currentStatus)) return false;
        if (statusFilter === 'CLOSED' && !isOrderClosed(currentStatus)) return false;
        if (
          statusFilter !== 'ALL' &&
          statusFilter !== 'OPEN' &&
          statusFilter !== 'CLOSED' &&
          currentStatus !== statusFilter
        ) {
          return false;
        }

        if (startDate && new Date(order.createdAt) < new Date(startDate)) return false;
        if (endDate && new Date(order.createdAt) > new Date(endDate + 'T23:59:59')) return false;

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [orders, searchQuery, statusFilter, startDate, endDate, sortOrder]);

  const downloadCSVReport = () => {
    const headers = ['Order ID,Total ($),Status,Date,Items'];
    const rows = filteredOrders.map((o) => {
      const id = String(o.id || o._id || '');
      const displayId = o.orderNumber || id;
      const itemSummary = (o.items || [])
        .map((i: any) => `${i.quantity || 1}x ${i.name || i.menuItem?.name || i.title || 'Item'}`)
        .join('; ');

      return `"${displayId}",${Number(o.totalAmount || o.total || 0).toFixed(2)},"${o.status}","${new Date(
        o.createdAt
      ).toLocaleString()}","${itemSummary}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `My_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && orders.length === 0) return <Loader label="Loading your order history..." />;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 pb-16 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Customer Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-orange-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-2">
              <User className="w-3.5 h-3.5" /> CUSTOMER VIEW
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-serif tracking-tight">My Order History</h1>
            <p className="text-amber-100 text-xs md:text-sm max-w-xl mt-1 font-medium">
              Track your ongoing food deliveries and review past receipt details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSVReport}
              className="bg-white text-slate-900 hover:bg-slate-50 font-black px-5 py-3 rounded-2xl text-xs uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4 text-orange-600" /> Export CSV
            </button>
            <button
              onClick={fetchOrders}
              className="bg-white/15 hover:bg-white/25 text-white font-bold p-3 rounded-2xl transition backdrop-blur-md cursor-pointer active:scale-95"
              title="Refresh order status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-amber-100/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Spent</p>
              <p className="text-2xl font-black text-slate-900 mt-1">${metrics.totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-100/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Orders</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{metrics.count}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-100/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Deliveries</p>
              <p className="text-2xl font-black text-orange-600 mt-1">{metrics.active}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-100/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Delivered</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{metrics.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {error && <ErrorState message={error} onRetry={fetchOrders} />}

        {/* Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-amber-100/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-bold">
              <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 border border-slate-200 rounded-2xl">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[10px] uppercase font-black text-slate-400">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-700 cursor-pointer"
                />
                <span className="text-[10px] uppercase font-black text-slate-400 ml-1">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-700 cursor-pointer"
                />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl transition flex items-center gap-1.5 cursor-pointer shadow-xs font-black uppercase text-[11px] tracking-wider active:scale-95"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs font-bold">
            <span className="text-slate-400 mr-2 text-[11px] font-black uppercase tracking-wider">Filter:</span>
            {['ALL', 'OPEN', 'CLOSED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl transition cursor-pointer text-xs font-black ${
                  statusFilter === st
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Order Cards Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-amber-100 text-center shadow-xs">
            <Utensils className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <EmptyState title="No orders found" description="Place your first order or adjust your active filters." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOrders.map((order) => {
              const orderId = String(order.id || order._id || '');
              const displayId = order.orderNumber || orderId;
              const currentStatus = (order.status || 'CONFIRMED').toUpperCase();
              const closed = isOrderClosed(currentStatus);

              return (
                <div
                  key={orderId}
                  onClick={() => router.push(`/orders/${orderId}`)}
                  className="bg-white rounded-3xl border-2 border-amber-100/90 hover:border-amber-300 p-6 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <span className="font-black text-slate-900 text-lg font-serif group-hover:text-amber-600 transition-colors block">
                        {displayId}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div>
                      {closed ? (
                        <span
                          className={`font-black px-3 py-1 rounded-full text-[10px] uppercase inline-flex items-center gap-1 border ${
                            currentStatus === 'CANCELLED'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {currentStatus === 'CANCELLED' ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {currentStatus}
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 font-black px-3 py-1 rounded-full text-[10px] uppercase inline-flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3" /> {currentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Item List */}
                  <div className="space-y-1.5 py-1">
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Order Items:</p>
                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-1">
                        {order.items.map((it: any, idx: number) => (
                          <p key={idx} className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {it.quantity || 1}x {it.name || it.menuItem?.name || it.title || 'Item'}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-medium italic text-slate-400">No items specified</p>
                    )}
                  </div>

                  {/* Summary Footer */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-black block uppercase tracking-wider">
                        Total Price
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl group-hover:bg-amber-100 transition-all">
                      View Receipt <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-amber-100/80 shadow-xs">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-xs font-black text-slate-700 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-xl">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition disabled:opacity-40 cursor-pointer active:scale-95"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}