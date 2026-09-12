'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types';
import { Truck, MapPin, Package } from 'lucide-react';

export default function DriverDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssignedOrders = async () => {
    try {
      const res = await apiClient.get('/driver/orders');
      setOrders(res.data);
      if (res.data.length > 0 && !selectedOrder) setSelectedOrder(res.data[0]);
    } catch {
      const mockOrders: Order[] = [
        {
          id: 'ORD-8821',
          orderNumber: 'ORD-8821',
          restaurantId: 'rest-1',
          customerName: 'John Doe',
          deliveryAddress: '742 Evergreen Terrace, Sector 4',
          restaurantName: 'Bistro Byte Central',
          subtotal: 27.97,
          deliveryFee: 0,
          discount: 0,
          totalAmount: 27.97,
          status: (localStorage.getItem('order_status_ORD-8821') as OrderStatus) || 'IN_TRANSIT',
          paymentStatus: 'SUCCESSFUL',
          items: [
            { id: 'm1', name: 'Taco Pack', quantity: 2, price: 12.99 },
            { id: 'm2', name: 'Burrito Bowl', quantity: 1, price: 10.50 },
          ],
          statusHistory: [
            { status: 'PENDING', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString() },
            { status: 'IN_TRANSIT', timestamp: new Date(Date.now() - 300000).toLocaleTimeString() },
          ],
          createdAt: new Date().toISOString(),
        },
      ];
      setOrders(mockOrders);
      setSelectedOrder(mockOrders[0]);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  const updateLocalOrder = (orderId: string, status: OrderStatus) => {
    // Persist status change to localStorage for cross-page sync
    localStorage.setItem(`order_status_${orderId}`, status);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              statusHistory: [
                ...(o.statusHistory || []),
                { status, timestamp: new Date().toLocaleTimeString() },
              ],
            }
          : o
      )
    );

    setSelectedOrder((prev) =>
      prev && prev.id === orderId
        ? {
            ...prev,
            status,
            statusHistory: [
              ...(prev.statusHistory || []),
              { status, timestamp: new Date().toLocaleTimeString() },
            ],
          }
        : prev
    );
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setLoading(true);

    try {
      await apiClient.patch(`/driver/orders/${selectedOrder.id}/status`, {
        status: newStatus,
      });
      updateLocalOrder(selectedOrder.id, newStatus);
    } catch {
      updateLocalOrder(selectedOrder.id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Assigned Orders List */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
          <Truck className="w-5 h-5 text-emerald-600" /> Assigned Deliveries
        </h2>
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => setSelectedOrder(ord)}
              className={`p-3 rounded-lg border cursor-pointer transition ${
                selectedOrder?.id === ord.id
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center font-semibold text-slate-800">
                <span>{ord.orderNumber || ord.id}</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                  {ord.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 truncate">
                {ord.deliveryAddress || 'Address specified in order details'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Order Details & Actions */}
      <div className="md:col-span-2 bg-white border rounded-lg p-6 shadow-sm">
        {selectedOrder ? (
          <div>
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  Order #{selectedOrder.orderNumber || selectedOrder.id}
                </h1>
                <p className="text-sm text-slate-500">
                  Customer: {selectedOrder.customerName || 'John Doe'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total</span>
                <p className="text-xl font-bold text-slate-800">
                  ${Number(selectedOrder.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <span>{selectedOrder.deliveryAddress || '742 Evergreen Terrace, Sector 4'}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <Package className="w-4 h-4 text-slate-400 mt-1" />
                <span>Restaurant: {selectedOrder.restaurantName || 'Bistro Byte Central'}</span>
              </div>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-sm mb-3 text-slate-800">
                Update Delivery Status
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED'] as OrderStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      disabled={loading || selectedOrder.status === st}
                      className={`py-2 px-3 text-xs font-bold rounded-lg transition ${
                        selectedOrder.status === st
                          ? 'bg-slate-800 text-white cursor-default'
                          : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500">Select an order to view details</p>
        )}
      </div>
    </div>
  );
}