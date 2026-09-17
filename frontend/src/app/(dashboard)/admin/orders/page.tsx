'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Dynamic Restaurant Name Resolver
  const resolveRestaurantName = useCallback((parsed: any) => {
    return (
      parsed?.restaurantName ||
      parsed?.restaurant_name ||
      parsed?.restaurant?.name ||
      parsed?.restaurant?.title ||
      parsed?.vendorName ||
      parsed?.vendor?.name ||
      parsed?.items?.[0]?.restaurantName ||
      parsed?.items?.[0]?.restaurant?.name ||
      (parsed?.restaurantId ? `Restaurant #${String(parsed.restaurantId).slice(-4)}` : 'Italiano')
    );
  }, []);

  // Dynamic Order ID Resolver
  const resolveOrderNumber = useCallback((order: any) => {
    const rawId = order?.orderNumber || order?.id || order?._id || '';
    if (!rawId) return 'ORD-UNKNOWN';
    const strId = String(rawId);
    return strId.startsWith('ORD-') ? strId : `ORD-${strId.slice(-6).toUpperCase()}`;
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let fetchedData: any[] = [];
      try {
        const res = await api.get('/admin/orders');
        fetchedData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      } catch (e: any) {
        if (e?.response?.status === 401) throw e;
        try {
          const resFallback = await api.get('/orders');
          fetchedData = Array.isArray(resFallback.data) ? resFallback.data : resFallback.data?.data || [];
        } catch (innerErr) {
          // Continue to local storage fallback
        }
      }

      // Fallback local storage sync if no backend items returned
      if (fetchedData.length === 0 && typeof window !== 'undefined') {
        const localOrdersMap = new Map<string, any>();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('latest_order_') || key.startsWith('order_'))) {
            try {
              const raw = localStorage.getItem(key);
              if (raw && !key.startsWith('order_status_')) {
                const parsed = JSON.parse(raw);
                const orderId = parsed.id || parsed.orderNumber || key.replace('latest_order_', '').replace('order_', '');
                const dynamicStatus = localStorage.getItem(`order_status_${orderId}`) || parsed.status || 'PENDING';
                
                localOrdersMap.set(orderId, {
                  ...parsed,
                  id: orderId,
                  status: dynamicStatus,
                  restaurantName: resolveRestaurantName(parsed),
                });
              }
            } catch (e) {
              console.error('Failed to parse cached order', e);
            }
          }
        }
        fetchedData = Array.from(localOrdersMap.values());
      } else {
        // Normalize backend data with dynamic resolvers
        fetchedData = fetchedData.map((item) => ({
          ...item,
          restaurantName: resolveRestaurantName(item),
        }));
      }

      setOrders(fetchedData);

      if (fetchedData.length > 0) {
        setSelectedOrder((prev: any) => {
          if (prev) {
            const updated = fetchedData.find((o) => o.id === prev.id);
            return updated || fetchedData[0];
          }
          return fetchedData[0];
        });
      } else {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message;

      if (status === 401 || message?.toLowerCase().includes('token')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
        }
        router.push('/login');
        return;
      }

      setError(message || 'Failed to fetch platform orders.');
    } finally {
      setLoading(false);
    }
  }, [router, resolveRestaurantName]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`order_status_${orderId}`, newStatus);
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
    }
  };

  useEffect(() => {
    fetchOrders();

    // Listen for real-time updates across local tabs / browser storage
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key &&
        (e.key.startsWith('latest_order_') ||
          e.key.startsWith('order_status_') ||
          e.key.startsWith('order_'))
      ) {
        fetchOrders();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const status = (order.status || '').toUpperCase();
        if (selectedStatus !== 'ALL' && status !== selectedStatus) return false;

        const orderNum = resolveOrderNumber(order);
        const customer = order.customerName || order.user?.name || order.deliveryDetails?.name || '';
        const restaurant = order.restaurantName || resolveRestaurantName(order);

        const query = searchQuery.toLowerCase();
        return (
          orderNum.toLowerCase().includes(query) ||
          customer.toLowerCase().includes(query) ||
          restaurant.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
  }, [orders, selectedStatus, searchQuery, resolveOrderNumber, resolveRestaurantName]);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'READY':
      case 'CONFIRMED':
        return 'bg-violet-100 text-violet-900 border-violet-300';
      case 'PREPARING':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  if (loading) return <Loader label="Retrieving Platform Order Records..." />;

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <h3 className="font-bold text-purple-950 text-base">Session Authorization Required</h3>
        <p className="text-xs text-purple-600">{error}</p>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
        >
          Re-authenticate Session
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-purple-700/30">
        <div>
          <span className="bg-purple-500/20 text-purple-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-400/30 backdrop-blur-md">
            Global Audit
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-purple-50">Platform Order History</h1>
          <p className="text-purple-200 text-sm mt-1 max-w-xl">
            System-wide order logs, real-time status auditing, and transactional receipts across all participating restaurants.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer border border-purple-300/30 flex items-center gap-2"
        >
          <span>Sync Order Ledger</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, or Restaurant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-purple-50/50 border border-purple-200 rounded-xl text-xs font-medium text-purple-950 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 border border-purple-200 bg-purple-50/50 rounded-xl text-xs font-extrabold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition cursor-pointer"
        >
          <option value="ALL">All Order Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Main Content Area */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-purple-100 p-8">
          <EmptyState title="No platform orders recorded" description="There are no transaction records matching your query criteria." />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Feed List */}
          <div className="lg:col-span-2 space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {filteredOrders.map((order) => {
              const status = (order.status || '').toUpperCase();
              const isSelected = selectedOrder?.id === order.id;
              const formattedOrderNum = resolveOrderNumber(order);
              const dynamicRestaurantName = resolveRestaurantName(order);

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-5 bg-white border rounded-2xl shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                    isSelected
                      ? 'ring-2 ring-purple-600 border-transparent bg-purple-50/20'
                      : 'border-purple-100 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-purple-950">
                        #{formattedOrderNum}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border uppercase ${getStatusBadgeStyle(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-purple-900 font-bold">
                      Customer: <span className="font-semibold text-purple-700">{order.customerName || order.user?.name || order.deliveryDetails?.name || 'Guest User'}</span>
                    </p>

                    <p className="text-[11px] text-purple-500 font-medium">
                      Restaurant: <span className="font-semibold text-purple-800">{dynamicRestaurantName}</span>
                    </p>

                    <p className="text-[10px] text-purple-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent Activity'}
                    </p>
                  </div>

                  <div className="sm:text-right space-y-2 flex sm:flex-col justify-between items-end">
                    <p className="font-black text-purple-950 text-base">
                      ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                    </p>

                    {status !== 'DELIVERED' && status !== 'CANCELLED' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'DELIVERED');
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                      >
                        Force Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Order Inspector Panel */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm h-fit space-y-5 sticky top-6">
            {selectedOrder ? (
              <>
                <div className="border-b border-purple-100 pb-3">
                  <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                    Executive Receipt Inspection
                  </span>
                  <h3 className="text-lg font-black text-purple-950 font-mono">
                    Order #{resolveOrderNumber(selectedOrder)}
                  </h3>
                  <p className="text-xs text-purple-400 mt-0.5">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}
                  </p>
                </div>

                <div className="space-y-2.5 text-xs bg-purple-50/60 p-3.5 rounded-xl border border-purple-100">
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-bold">Customer:</span>
                    <span className="font-extrabold text-purple-950">
                      {selectedOrder.customerName || selectedOrder.user?.name || selectedOrder.deliveryDetails?.name || 'Guest'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-bold">Vendor:</span>
                    <span className="font-bold text-purple-900">
                      {resolveRestaurantName(selectedOrder)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-bold">Destination:</span>
                    <span className="font-semibold text-purple-900 text-right truncate max-w-[170px]">
                      {selectedOrder.address || selectedOrder.deliveryAddress || selectedOrder.deliveryDetails?.address || 'Standard Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-bold">Current State:</span>
                    <span className="font-black text-purple-950 uppercase">{selectedOrder.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-purple-400 uppercase tracking-wider">
                    Itemized Breakdown
                  </h4>
                  <div className="divide-y divide-purple-50 max-h-52 overflow-y-auto border border-purple-100 rounded-xl">
                    {(selectedOrder.items || selectedOrder.orderItems || []).length > 0 ? (
                      (selectedOrder.items || selectedOrder.orderItems || []).map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex justify-between text-xs bg-white">
                          <span className="font-bold text-purple-900">
                            <span className="text-purple-600 font-black mr-1.5">x{item.quantity || 1}</span>
                            {item.name || item.menuItem?.name || 'Item Entry'}
                          </span>
                          <span className="font-black text-purple-950">
                            ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-purple-400 italic text-center">
                        Standard Menu Bundle
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-purple-100 pt-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-600 uppercase">Gross Total</span>
                  <span className="text-xl font-black text-purple-950">
                    ${Number(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-purple-400 font-medium">
                Select an order record from the feed to review detailed platform log data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}