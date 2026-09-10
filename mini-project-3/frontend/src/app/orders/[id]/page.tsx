'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderByIdApi } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types';

const STATUS_STAGES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      getOrderByIdApi(id as string).then((res) => setOrder(res.data));
    }
  }, [id]);

  if (!order) return <div className="p-8 text-center">Loading order...</div>;

  const currentIdx = STATUS_STAGES.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border rounded-xl mt-8 shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">Order #{order.orderNumber || order.id.slice(0, 8)}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          order.paymentStatus === 'SUCCESSFUL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          Payment: {order.paymentStatus}
        </span>
      </div>

      {/* Timeline */}
      {order.status !== 'CANCELLED' ? (
        <div className="flex justify-between items-center my-8 relative">
          {STATUS_STAGES.map((st, idx) => (
            <div key={st} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                idx <= currentIdx ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <span className="text-xs mt-2 font-medium text-gray-600">{st}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg font-bold text-center mb-6">
          Order Cancelled / Refunded
        </div>
      )}

      {/* Bill Breakdown */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm"><span>Total</span><span className="font-bold">${order.totalAmount}</span></div>
      </div>
    </div>
  );
}