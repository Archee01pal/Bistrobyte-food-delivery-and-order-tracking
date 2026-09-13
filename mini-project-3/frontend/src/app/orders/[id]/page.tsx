'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderByIdApi } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  History, 
  CheckCircle2, 
  Clock, 
  UtensilsCrossed, 
  PackageCheck, 
  Truck, 
  Home, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

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
  PREPARING: UtensilsCrossed,
  READY: PackageCheck,
  IN_TRANSIT: Truck,
  DELIVERED: Home,
  CANCELLED: Clock,
};

// Custom Hover Animation Variants for Progress Step Icons
const ICON_ANIMATIONS: Record<string, any> = {
  PENDING: {
    hover: {
      rotate: [0, -20, 20, -20, 0],
      transition: { duration: 0.5, repeat: Infinity },
    },
  },
  CONFIRMED: {
    hover: {
      scale: [1, 1.25, 1],
      transition: { duration: 0.4 },
    },
  },
  PREPARING: {
    hover: {
      rotate: [0, -14, 14, -14, 14, 0],
      transition: { duration: 0.4, repeat: Infinity },
    },
  },
  READY: {
    hover: {
      y: [0, -6, 0],
      transition: { duration: 0.4, repeat: Infinity },
    },
  },
  IN_TRANSIT: {
    hover: {
      x: [-3, 6, -3],
      transition: { duration: 0.4, repeat: Infinity },
    },
  },
  DELIVERED: {
    hover: {
      scale: [1, 1.15, 1],
      transition: { duration: 0.4, repeat: Infinity },
    },
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const res = await getOrderByIdApi(id);
      if (res?.data) {
        setOrder(res.data);
        setRefreshing(false);
        return;
      }
    } catch (error) {
      console.warn(`API fetch failed for order ${id}, reading from local storage fallback:`, error);
    }

    // Dynamic fallback reading order payload saved during checkout
    const storedStatus = (localStorage.getItem(`order_status_${id}`) as OrderStatus) || 'CONFIRMED';
    const storedOrderData = localStorage.getItem(`latest_order_${id}`);
    
    let parsedItems = [];
    let parsedTotal = 0;
    let parsedAddress = 'Delivery Address';

    if (storedOrderData) {
      try {
        const parsed = JSON.parse(storedOrderData);
        parsedItems = parsed.items || [];
        parsedTotal = parsed.totalAmount || 0;
        parsedAddress = parsed.deliveryAddress || parsedAddress;
      } catch (e) {
        console.error('Error parsing stored order details', e);
      }
    }

    const cleanId = String(id).toUpperCase();
    const stages: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED'];
    const targetIdx = stages.indexOf(storedStatus);
    const activeStages = targetIdx !== -1 ? stages.slice(0, targetIdx + 1) : stages;

    setOrder({
      id: cleanId,
      orderNumber: cleanId.startsWith('ORD-') ? cleanId : `ORD-${cleanId}`,
      restaurantId: 'rest-1',
      restaurantName: 'Bistro Byte',
      customerName: 'Customer',
      deliveryAddress: parsedAddress,
      subtotal: parsedTotal,
      deliveryFee: 0,
      discount: 0,
      totalAmount: parsedTotal,
      status: storedStatus,
      paymentStatus: 'SUCCESSFUL',
      items: parsedItems,
      statusHistory: activeStages.map((st, i) => ({
        status: st,
        timestamp: new Date(Date.now() - (activeStages.length - i) * 600000).toISOString(),
      })),
      createdAt: new Date().toISOString(),
    });

    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen bg-culinary-pattern flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600 font-medium bg-white/80 backdrop-blur-xs px-5 py-3 rounded-2xl border border-amber-100 shadow-xs">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-600" /> Loading order details...
        </div>
      </div>
    );
  }

  const currentIdx = STATUS_STAGES.indexOf(order.status);

  return (
    <div className="min-h-screen bg-culinary-pattern text-slate-800 pb-16">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/restaurants')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-100/50 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Restaurants
          </button>
        </div>

        {/* Top Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-serif">
              Order #{order.orderNumber || order.id}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {order.paymentStatus && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${
                  order.paymentStatus === 'SUCCESSFUL' || order.paymentStatus === 'PAID'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border border-rose-200 text-rose-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Payment: {order.paymentStatus}
              </span>
            )}
            
            <button
              onClick={fetchOrder}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </motion.div>

        {/* Delivery Progress Stepper */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100/80 shadow-sm space-y-6"
        >
          <h2 className="text-base font-bold text-slate-900 font-serif">Delivery Progress</h2>
          
          {order.status !== 'CANCELLED' ? (
            <div className="relative flex justify-between items-center w-full my-4 px-2">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[3px] bg-slate-100 -z-0" />
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-[3px] bg-emerald-500 transition-all duration-500 -z-0"
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
                const animationVariant = ICON_ANIMATIONS[st] || {};

                return (
                  <motion.div 
                    key={st} 
                    initial="initial"
                    whileHover="hover"
                    className="flex flex-col items-center bg-white z-10 px-1 group cursor-pointer"
                  >
                    <motion.div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-4 ring-emerald-100'
                          : 'bg-white border-2 border-slate-200 text-slate-400'
                      }`}
                    >
                      <motion.div variants={animationVariant}>
                        <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                      </motion.div>
                    </motion.div>
                    <span
                      className={`text-[10px] font-extrabold tracking-wide mt-2 transition-colors ${
                        isDone ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {st.replace('_', ' ')}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl font-bold text-center text-xs">
              Order Cancelled / Timed Out
            </div>
          )}
        </motion.div>

        {/* Items & Order Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Purchased Items List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm space-y-4"
          >
            <h2 className="text-base font-bold text-slate-900 font-serif border-b border-slate-100 pb-3">
              Ordered Items
            </h2>

            {order.items && order.items.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {order.items.map((rawItem: any, index: number) => {
                  const item = rawItem.menuItem ? rawItem.menuItem : rawItem;
                  const itemName = item.name || rawItem.name || 'Menu Item';
                  const quantity = rawItem.quantity || item.quantity || 1;
                  const price = Number(item.price || rawItem.price || 0);

                  return (
                    <div key={index} className="py-2.5 flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                          {quantity}x
                        </span>
                        <span className="font-medium text-slate-800">{itemName}</span>
                      </div>
                      <span className="font-bold text-slate-900">${(price * quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No item details available for this order.</p>
            )}
          </motion.div>

          {/* Status History & Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
                <History className="w-4 h-4 text-amber-600" /> Status History Log
              </h2>

              {order.statusHistory && order.statusHistory.length > 0 ? (
                <div className="space-y-2 border-l-2 border-slate-100 ml-2 pl-4">
                  {order.statusHistory.map((h, i) => (
                    <div key={i} className="text-xs flex justify-between items-center text-slate-600">
                      <span className="font-bold text-slate-800">
                        {String(h.status).replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 font-medium">
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

            <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-center">
              <span className="font-serif font-black text-slate-900 text-base">Total Paid</span>
              <span className="text-emerald-600 font-extrabold text-xl font-sans">
                ${Number(order.totalAmount || 0).toFixed(2)}
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
}