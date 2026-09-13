'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { Order, OrderStatus } from '@/types';
import { 
  Truck, 
  MapPin, 
  Package, 
  Phone, 
  CreditCard, 
  Banknote, 
  QrCode, 
  History, 
  CheckCircle2,
  Clock,
  UtensilsCrossed,
  PackageCheck,
  Home
} from 'lucide-react';
import { useNotifications } from '@/context/notification-context';

type ExtendedOrder = Order & {
  paymentMethod?: string;
};

// Hover Animation Variants for Status Buttons
const STATUS_BTN_ANIMATIONS: Record<string, any> = {
  CONFIRMED: {
    hover: { scale: [1, 1.2, 1], transition: { duration: 0.3 } },
  },
  PREPARING: {
    hover: { rotate: [0, -12, 12, -12, 12, 0], transition: { duration: 0.4, repeat: Infinity } },
  },
  READY: {
    hover: { y: [0, -4, 0], transition: { duration: 0.4, repeat: Infinity } },
  },
  IN_TRANSIT: {
    hover: { x: [-2, 5, -2], transition: { duration: 0.4, repeat: Infinity } },
  },
  DELIVERED: {
    hover: { scale: [1, 1.15, 1], transition: { duration: 0.4, repeat: Infinity } },
  },
};

const STATUS_ICONS: Record<string, any> = {
  CONFIRMED: CheckCircle2,
  PREPARING: UtensilsCrossed,
  READY: PackageCheck,
  IN_TRANSIT: Truck,
  DELIVERED: Home,
};

export default function DriverDashboard() {
  const [orders, setOrders] = useState<ExtendedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const { addNotification } = useNotifications();

  // Mock assigned driver details
  const driverInfo = {
    name: 'Alex',
    phone: '+1 (555) 019-2834',
    rating: '4.9 ★',
    vehicle: 'Toyota Prius (Green) • License: 7XYZ89',
  };

  const fetchAssignedOrders = async () => {
    try {
      const res = await apiClient.get('/driver/orders');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
        setSelectedOrder(res.data[0]);
        return;
      }
    } catch {
      console.warn('Backend driver endpoint offline, scanning local storage for active orders.');
    }

    const localOrders: ExtendedOrder[] = [];
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('latest_order_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const orderId = key.replace('latest_order_', '');
              const parsed = JSON.parse(raw);
              const displayId = orderId.startsWith('ORD-') ? orderId : `ORD-${orderId.slice(-6)}`;
              const currentStatus = (localStorage.getItem(`order_status_${orderId}`) as OrderStatus) || 'CONFIRMED';
              const pMethod = parsed.paymentMethod || 'CARD';

              localOrders.push({
                id: orderId,
                orderNumber: displayId,
                restaurantId: parsed.restaurantId || 'rest-1',
                customerName: parsed.customerName || 'Customer',
                deliveryAddress: parsed.deliveryAddress || 'Address specified in order details',
                restaurantName: parsed.restaurantName || 'Bistro Byte Central',
                subtotal: parsed.totalAmount || 0,
                deliveryFee: 3.99,
                discount: 2.00,
                totalAmount: parsed.totalAmount || 0,
                status: currentStatus,
                paymentStatus: parsed.paymentStatus || (pMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL'),
                paymentMethod: pMethod,
                items: parsed.items || [],
                statusHistory: [
                  { status: currentStatus, timestamp: new Date().toLocaleTimeString() },
                ],
                createdAt: parsed.createdAt || new Date().toISOString(),
              });
            }
          } catch (e) {
            console.error('Failed to parse local driver order payload:', e);
          }
        }
      }
    }

    setOrders(localOrders);
    if (localOrders.length > 0) {
      setSelectedOrder(localOrders[0]);
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  // Filter active orders vs delivered history
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED');
  const historyOrders = orders.filter((o) => o.status === 'DELIVERED');
  const displayedOrders = sidebarTab === 'ACTIVE' ? activeOrders : historyOrders;

  const updateLocalOrder = (orderId: string, status: OrderStatus) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`order_status_${orderId}`, status);
    }

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

  const getNotificationText = (status: OrderStatus, orderId: string) => {
    switch (status) {
      case 'READY':
        return {
          title: 'Driver Arrived at Restaurant',
          message: `${driverInfo.name} is here to pick up your order #${orderId}!`,
        };
      case 'IN_TRANSIT':
        return {
          title: 'Order On The Way',
          message: `${driverInfo.name} has picked up order #${orderId} and is headed your way!`,
        };
      case 'DELIVERED':
        return {
          title: 'Order Delivered',
          message: `${driverInfo.name} delivered your order #${orderId}. Enjoy your meal!`,
        };
      default:
        return {
          title: `Order Status: ${status.replace('_', ' ')}`,
          message: `Your order #${orderId} status has been updated to ${status.replace('_', ' ').toLowerCase()}.`,
        };
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setLoading(true);

    const targetOrderId = selectedOrder.orderNumber || selectedOrder.id;

    try {
      await apiClient.patch(`/driver/orders/${selectedOrder.id}/status`, {
        status: newStatus,
      });
      updateLocalOrder(selectedOrder.id, newStatus);
    } catch {
      updateLocalOrder(selectedOrder.id, newStatus);
    } finally {
      const notifData = getNotificationText(newStatus, targetOrderId);
      
      addNotification({
        title: notifData.title,
        message: notifData.message,
        type: newStatus === 'DELIVERED' ? 'COMPLETION' : 'CONFIRMATION',
        orderId: targetOrderId,
      });

      setLoading(false);
    }
  };

  // Helper function to render explicit collection instructions for drivers
  const renderPaymentInfoBox = (order: ExtendedOrder) => {
    const isCOD = order.paymentMethod === 'COD';
    const isUPI = order.paymentMethod === 'UPI';

    if (isCOD) {
      return (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                Cash On Delivery (COD)
              </p>
              <p className="text-xs text-amber-700 font-medium">
                Collect payment at doorstep upon delivery
              </p>
            </div>
          </div>
          <span className="text-sm font-black text-amber-900 bg-amber-200/60 px-3 py-1.5 rounded-xl border border-amber-300/80">
            Collect ${Number(order.totalAmount).toFixed(2)}
          </span>
        </div>
      );
    }

    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
            {isUPI ? <QrCode className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
              {isUPI ? 'Paid via UPI' : 'Paid Online (Card)'}
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              No cash collection required
            </p>
          </div>
        </div>
        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
          ✓ PAID ONLINE
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar Navigation */}
        <div className="bg-white border border-amber-100/80 rounded-3xl p-5 shadow-xs flex flex-col">
          <h2 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2 font-serif">
            <Truck className="w-5 h-5 text-amber-600" /> Driver Deliveries
          </h2>

          {/* Active vs History Tab Navigation */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold mb-4">
            <button
              onClick={() => setSidebarTab('ACTIVE')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                sidebarTab === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active ({activeOrders.length})
            </button>
            <button
              onClick={() => setSidebarTab('HISTORY')}
              className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                sidebarTab === 'HISTORY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" /> History ({historyOrders.length})
            </button>
          </div>

          {/* Orders List View */}
          {displayedOrders.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                {sidebarTab === 'ACTIVE'
                  ? 'No active deliveries currently in progress.'
                  : 'No completed delivery history found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
              {displayedOrders.map((ord) => (
                <motion.div
                  key={ord.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedOrder?.id === ord.id
                      ? 'border-amber-300 bg-amber-50/50 ring-2 ring-amber-400/20 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center font-black text-slate-900 text-sm">
                    <span>{ord.orderNumber || ord.id}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide ${
                        ord.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  
                  {/* List Item Details Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                    <p className="text-slate-500 truncate max-w-[130px] font-medium">
                      {ord.deliveryAddress || 'Address specified'}
                    </p>
                    {ord.paymentMethod === 'COD' ? (
                      <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-[10px]">
                        COD: ${Number(ord.totalAmount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                        {ord.status === 'DELIVERED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        PAID ONLINE
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Order Details & Action Controls */}
        <div className="md:col-span-2 bg-white border border-amber-100/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          {selectedOrder ? (
            <div>
              <div className="flex justify-between border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 font-serif">
                    Order #{selectedOrder.orderNumber || selectedOrder.id}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Customer: <span className="text-slate-800">{selectedOrder.customerName || 'Customer'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
                  <p className="text-2xl font-black text-slate-900 font-sans">
                    ${Number(selectedOrder.totalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Prominent Payment Banner */}
              {renderPaymentInfoBox(selectedOrder)}

              {/* Dynamic Driver Info Banner */}
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    {driverInfo.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{driverInfo.name}</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                        {driverInfo.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {selectedOrder.status === 'READY' && `${driverInfo.name} is here to pick up your order!`}
                      {selectedOrder.status === 'IN_TRANSIT' && `${driverInfo.name} is on the way to deliver your order.`}
                      {selectedOrder.status === 'DELIVERED' && `${driverInfo.name} delivered this order.`}
                      {['CONFIRMED', 'PREPARING'].includes(selectedOrder.status) && `${driverInfo.name} has been assigned to this delivery.`}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{driverInfo.vehicle}</span>
                  </div>
                </div>

                <a
                  href={`tel:${driverInfo.phone}`}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95 shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Contact
                </a>
              </div>

              <div className="space-y-3 mb-6 text-xs font-medium text-slate-700">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <span>{selectedOrder.deliveryAddress}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <span>Restaurant: {selectedOrder.restaurantName || 'Bistro Byte Central'}</span>
                </div>
              </div>

              {/* Status Transition Controls */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                  Update Delivery Status
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['CONFIRMED', 'PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERED'] as OrderStatus[]).map(
                    (st) => {
                      const Icon = STATUS_ICONS[st] || Clock;
                      const isCurrent = selectedOrder.status === st;
                      const animVariant = STATUS_BTN_ANIMATIONS[st] || {};

                      return (
                        <motion.button
                          key={st}
                          initial="initial"
                          whileHover={!isCurrent ? "hover" : undefined}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(st)}
                          disabled={loading || isCurrent}
                          className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                            isCurrent
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/20 cursor-default'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <motion.div variants={animVariant}>
                            <Icon className={`w-4 h-4 ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`} />
                          </motion.div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wide">
                            {st.replace('_', ' ')}
                          </span>
                        </motion.button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12 font-medium text-xs">
              Select an order from the list to view details.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}