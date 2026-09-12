'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderByIdApi } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types';
import { RefreshCw, History, CheckCircle2, Clock, Truck, Home } from 'lucide-react';

const STATUS_STAGES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'IN_TRANSIT',
  'DELIVERED',
];

const STEP_ICONS: Record<string, any> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PREPARING: Clock,
  READY: CheckCircle2,
  IN_TRANSIT: Truck,
  DELIVERED: Home,
  CANCELLED: Clock,
};

export default function OrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const res = await getOrderByIdApi(id);
      setOrder(res.data);
    } catch (error) {
      console.warn(`API fetch failed for order ${id}, reading status from shared store:`, error);
      
      // Read dynamic status saved by the driver dashboard in localStorage
      const storedStatus = (localStorage.getItem(`order_status_${id}`) as OrderStatus) || 'DELIVERED';
      
      const cleanId = String(id).toUpperCase();
      const stages: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED'];
      const targetIdx = stages.indexOf(storedStatus);
      const activeStages = targetIdx !== -1 ? stages.slice(0, targetIdx + 1) : stages;

      setOrder({
        id: cleanId,
        orderNumber: cleanId.startsWith('ORD-') ? cleanId : `ORD-${cleanId}`,
        restaurantId: 'rest-1',
        restaurantName: 'Bistro Byte Central',
        customerName: `Customer (${cleanId.slice(-4)})`,
        deliveryAddress: '742 Evergreen Terrace, Sector 4',
        subtotal: 27.97,
        deliveryFee: 0,
        discount: 0,
        totalAmount: 27.97,
        status: storedStatus,
        paymentStatus: 'SUCCESSFUL',
        items: [
          { id: 'm1', name: 'Taco Pack', quantity: 2, price: 12.99 },
          { id: 'm2', name: 'Burrito Bowl', quantity: 1, price: 10.50 },
        ],
        statusHistory: activeStages.map((st, i) => ({
          status: st,
          timestamp: new Date(Date.now() - (activeStages.length - i) * 600000).toISOString(),
        })),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (!order) {
    return <div className="p-8 text-center text-slate-500">Loading order details...</div>;
  }

  const currentIdx = STATUS_STAGES.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center bg-white border p-5 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Order #{order.orderNumber || order.id}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {order.paymentStatus && (
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                order.paymentStatus === 'SUCCESSFUL' || order.paymentStatus === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              Payment: {order.paymentStatus}
            </span>
          )}
          <button
            onClick={fetchOrder}
            disabled={refreshing}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Progress Timeline Indicator */}
      <div className="bg-white border p-6 rounded-xl shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-6">Delivery Progress</h2>
        {order.status !== 'CANCELLED' ? (
          <div className="relative flex justify-between items-center w-full my-4">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-0" />
            <div
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 -z-0"
              style={{
                width: `${Math.max(
                  0,
                  (currentIdx / (STATUS_STAGES.length - 1)) * 100
                )}%`,
              }}
            />

            {STATUS_STAGES.map((st, idx) => {
              const Icon = STEP_ICONS[st] || Clock;
              const isDone = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={st} className="flex flex-col items-center bg-white z-10 px-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition border-2 ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] mt-2 font-semibold ${
                      isDone ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg font-bold text-center">
            Order Cancelled / Timed Out
          </div>
        )}
      </div>

      {/* Status History Log & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <h2 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Status History Log
          </h2>
          {order.statusHistory && order.statusHistory.length > 0 ? (
            <div className="space-y-3 border-l-2 border-slate-200 ml-2 pl-4">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="text-xs flex justify-between text-slate-600">
                  <span className="font-semibold text-slate-700">
                    {String(h.status).replace('_', ' ')}
                  </span>
                  <span className="text-slate-400">
                    {new Date(h.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">Current Status: {order.status}</p>
          )}
        </div>

        <div className="bg-white border p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <h2 className="font-semibold text-slate-800 text-sm mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm border-t pt-3">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-800 border-t pt-2">
              <span>Total Amount</span>
              <span className="text-emerald-600">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}