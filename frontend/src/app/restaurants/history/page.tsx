'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Download, 
  RotateCw, 
  Search, 
  DollarSign, 
  ShoppingBag, 
  Utensils, 
  Store,
  Clock,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';

export default function RestaurantManagerHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Fallback helper for Order IDs across MongoDB _id, orderNumber, id, etc.
  const resolveOrderId = (order: any) => {
    const rawId =
      order?.orderNumber ||
      order?.order_number ||
      order?.orderId ||
      order?.order_id ||
      order?.id ||
      order?._id ||
      order?.code;

    if (!rawId) return 'N/A';
    const strId = String(rawId);
    return strId.startsWith('ORD-') ? strId : `ORD-${strId.slice(-6).toUpperCase()}`;
  };

  // Fallback helper for status across orderStatus, status, state
  const resolveOrderStatus = (order: any) => {
    const rawStatus =
      order?.status ||
      order?.orderStatus ||
      order?.state ||
      order?.deliveryStatus ||
      'DELIVERED';

    return String(rawStatus).toUpperCase();
  };

  // Fetch orders with backend API + local storage sync
  const fetchHistory = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    let fetchedData: any[] = [];

    try {
      const res = await api.get('/restaurants/history');
      fetchedData = Array.isArray(res.data) ? res.data : res.data?.data || [];
    } catch (err) {
      try {
        const resFallback = await api.get('/restaurants/orders');
        fetchedData = Array.isArray(resFallback.data) ? resFallback.data : resFallback.data?.data || [];
      } catch (inner) {
        // Silently handle fallback
      }
    }

    // Merge cached local storage items if available
    if (typeof window !== 'undefined') {
      const cachedOrders: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('latest_order_') ||
            key.startsWith('order_') ||
            key.startsWith('cart_order_'))
        ) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed) cachedOrders.push(parsed);
            }
          } catch (e) {
            console.error('Error parsing order storage:', e);
          }
        }
      }

      // Deduplicate orders
      const mergedMap = new Map();
      [...fetchedData, ...cachedOrders].forEach((item) => {
        const idKey = resolveOrderId(item);
        mergedMap.set(idKey !== 'N/A' ? idKey : Math.random(), item);
      });
      fetchedData = Array.from(mergedMap.values());
    }

    setOrders(fetchedData);
    setIsLoading(false);
  }, []);

  // Sync lifecycle with 5s polling interval and storage change listener
  useEffect(() => {
    fetchHistory(true);

    const interval = setInterval(() => {
      fetchHistory(false);
    }, 5000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('order_') || e.key.startsWith('latest_order_'))) {
        fetchHistory(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchHistory]);

  // Computed filter logic
  const filteredOrders = useMemo(() => {
    const now = new Date();

    return orders
      .filter((order) => {
        const status = resolveOrderStatus(order);

        if (statusFilter !== 'ALL' && status !== statusFilter) {
          return false;
        }

        if (timeFilter !== 'ALL' && order.createdAt) {
          const orderDate = new Date(order.createdAt);
          if (timeFilter === 'TODAY' && orderDate.toDateString() !== now.toDateString())
            return false;
          if (
            timeFilter === 'WEEK' &&
            orderDate < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          )
            return false;
          if (
            timeFilter === 'MONTH' &&
            orderDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          )
            return false;
        }

        const query = searchQuery.toLowerCase();
        const orderNum = resolveOrderId(order);
        const customer =
          order.customerName ||
          order.user?.name ||
          order.deliveryDetails?.name ||
          order.customer ||
          '';
        const address = order.address || order.deliveryAddress || '';

        return (
          orderNum.toLowerCase().includes(query) ||
          customer.toLowerCase().includes(query) ||
          address.toLowerCase().includes(query)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || Date.now()).getTime() -
          new Date(a.createdAt || Date.now()).getTime()
      );
  }, [orders, searchQuery, timeFilter, statusFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const validOrders = filteredOrders.filter((o) =>
      ['DELIVERED', 'COMPLETED', 'READY'].includes(resolveOrderStatus(o))
    );

    const totalRev = validOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount || o.total || o.price || 0),
      0
    );
    const count = validOrders.length;
    const avg = count > 0 ? totalRev / count : 0;

    return {
      totalRevenue: `$${totalRev.toFixed(2)}`,
      completedOrders: count,
      avgOrderValue: `$${avg.toFixed(2)}`,
    };
  }, [filteredOrders]);

  // CSV Export trigger
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert('No orders available to export.');

    const headers = ['Order Reference,Customer,Status,Total Amount,Date\n'];
    const rows = filteredOrders.map((o) => {
      const ref = resolveOrderId(o);
      const cust = o.customerName || o.user?.name || o.customer || 'Guest Customer';
      const st = resolveOrderStatus(o);
      const amt = Number(o.totalAmount || o.total || 0).toFixed(2);
      const date = o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A';
      return `"${ref}","${cust}","${st}","$${amt}","${date}"\n`;
    });

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `manager_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                <Store className="w-3.5 h-3.5" />
                <span>Manager View</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Manager Order History
              </h1>
              <p className="text-emerald-100/90 text-sm sm:text-base max-w-xl font-medium">
                Complete archive of past orders, metrics, and detailed financial reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-900 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:bg-emerald-50 transition-all cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => fetchHistory(true)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all cursor-pointer active:scale-95"
                title="Refresh Live Data"
              >
                <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Revenue</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalRevenue}</p>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Completed Orders</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.completedOrders}</p>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Avg Order Value</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.avgOrderValue}</p>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Utensils className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer, address..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-0 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
              {(['ALL', 'TODAY', 'WEEK', 'MONTH'] as const).map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeFilter(time)}
                  className={`px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                    timeFilter === time
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-100 text-slate-700 px-3 py-2 rounded-2xl text-xs font-bold border-0 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DELIVERED">Delivered</option>
              <option value="READY">Ready</option>
              <option value="PREPARING">Preparing</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="py-12 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <Loader label="Syncing Manager Historical Records..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No historical orders found</h3>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your search terms or filter constraints.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider">
                  <tr>
                    <th className="p-4 pl-6">Order Reference</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredOrders.map((order, idx) => {
                    const orderRef = resolveOrderId(order);
                    const status = resolveOrderStatus(order);
                    const items = order.items || order.orderItems || [];

                    return (
                      <tr 
                        key={order.id || order.orderNumber || idx} 
                        onClick={() => setSelectedOrder(order)}
                        className="hover:bg-emerald-50/40 transition cursor-pointer"
                      >
                        <td className="p-4 pl-6 font-mono font-black text-slate-900">
                          #{orderRef}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">
                            {order.customerName || order.user?.name || order.deliveryDetails?.name || order.customer || 'Guest Customer'}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent'}
                          </p>
                        </td>
                        <td className="p-4 max-w-xs truncate text-slate-600">
                          {items.length > 0
                            ? items.map((i: any) => `${i.quantity || 1}x ${i.name || i.menuItem?.name || 'Item'}`).join(', ')
                            : 'Standard Order Items'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border inline-flex items-center gap-1.5 ${
                              status === 'DELIVERED' || status === 'COMPLETED'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              status === 'DELIVERED' || status === 'COMPLETED' ? 'bg-emerald-500' : status === 'CANCELLED' ? 'bg-rose-500' : 'bg-amber-500'
                            }`} />
                            {status}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6 font-black text-slate-900 text-sm">
                          ${Number(order.totalAmount || order.total || order.price || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Inspector Detail */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Manager Receipt View</span>
                  <h3 className="text-lg font-black font-mono text-slate-900">
                    Order #{resolveOrderId(selectedOrder)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full font-bold cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Customer:</span>
                  <span className="font-extrabold text-slate-900">
                    {selectedOrder.customerName || selectedOrder.user?.name || selectedOrder.customer || 'Guest Customer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <span className="font-black uppercase text-emerald-700">{resolveOrderStatus(selectedOrder)}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-xs font-extrabold text-slate-500 uppercase">Gross Revenue</span>
                <span className="text-xl font-black text-slate-900">
                  ${Number(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}