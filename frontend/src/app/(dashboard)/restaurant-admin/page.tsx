'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/axios';
import Loader from '@/components/common/Loader';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';

export default function RestaurantOrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewTab, setViewTab] = useState<'HISTORICAL' | 'ACTIVE' | 'ALL'>('HISTORICAL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetches all restaurant orders to parse history
      const res = await api.get('/restaurant/orders');
      setOrders(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Classify and filter orders dynamically
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = (order.status || '').toUpperCase();
      const isClosed = ['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);

      // Filter by Tab (Active vs Historical)
      if (viewTab === 'HISTORICAL' && !isClosed) return false;
      if (viewTab === 'ACTIVE' && isClosed) return false;

      // Filter by Status dropdown
      if (selectedStatus !== 'ALL' && status !== selectedStatus) return false;

      // Search by Order ID or Customer Name
      const matchesSearch =
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [orders, viewTab, selectedStatus, searchQuery]);

  if (loading) return <Loader label="Loading order history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchOrders} />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Order History</h1>
          <p className="text-sm text-gray-500">View and inspect completed, delivered, and past kitchen orders.</p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition"
        >
          Refresh History
        </button>
      </div>

      {/* Tabs and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b pb-3">
          {(['HISTORICAL', 'ACTIVE', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                viewTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab === 'HISTORICAL' ? 'Completed History' : tab === 'ACTIVE' ? 'Active Kitchen' : 'All Orders'}
            </button>
          ))}
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered / Completed</option>
            <option value="CANCELLED">Cancelled / Rejected</option>
            <option value="PREPARING">Preparing</option>
            <option value="READY_FOR_PICKUP">Ready For Pickup</option>
            <option value="PENDING">Pending</option>
          </select>

          <div className="text-right text-xs font-semibold text-gray-500 self-center">
            Showing {filteredOrders.length} records
          </div>
        </div>
      </div>

      {/* Main Content View */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No history records found"
          description="Try adjusting your filters or search query to locate past orders."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Cards List */}
          <div className="lg:col-span-2 space-y-3 max-h-[650px] overflow-y-auto pr-1">
            {filteredOrders.map((order) => {
              const status = (order.status || 'UNKNOWN').toUpperCase();
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 bg-white border rounded-xl shadow-xs cursor-pointer transition hover:border-slate-400 flex justify-between items-center ${
                    isSelected ? 'ring-2 ring-slate-900 border-transparent' : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">Order #{order.id.slice(-6)}</span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          status === 'DELIVERED' || status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 font-medium">
                      Customer: {order.customerName || order.user?.name || 'Guest'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date N/A'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-gray-900 text-sm">
                      ${Number(order.totalAmount || order.total || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Order Detail Sidebar */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-fit">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="border-b pb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Order Details</span>
                  <h3 className="text-lg font-black text-gray-900">#{selectedOrder.id}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Placed: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer Name:</span>
                    <span className="font-bold text-gray-800">
                      {selectedOrder.customerName || selectedOrder.user?.name || 'Guest'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-bold text-gray-800">{selectedOrder.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Address:</span>
                    <span className="font-semibold text-gray-800 text-right truncate max-w-[150px]">
                      {selectedOrder.address || selectedOrder.deliveryAddress || 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase">Items Ordered</h4>
                  <div className="divide-y max-h-48 overflow-y-auto bg-gray-50 p-2 rounded-lg border">
                    {(selectedOrder.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="py-1.5 flex justify-between text-xs">
                        <span>
                          <strong className="text-amber-600 mr-1">x{item.quantity || 1}</strong>
                          {item.name || item.menuItem?.name || 'Item'}
                        </span>
                        <span className="font-bold">
                          ${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between items-center font-bold text-sm">
                  <span>Total Amount</span>
                  <span className="text-base text-gray-900">
                    ${Number(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs font-medium">
                Select an order from the list to view breakdown and item receipts.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}