'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Truck,
  History,
  Trash2,
  CreditCard,
  PhoneCall,
  MapPin,
  Store,
  CheckCircle2,
  PackageCheck,
  Clock,
  X,
  Sparkles
} from 'lucide-react';

export default function DriverDashboard() {
  const [driverStatus, setDriverStatus] = useState<'Available' | 'Busy' | 'Offline'>('Available');
  const [sidebarTab, setSidebarTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  
  // Orders State
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Dynamic Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState<boolean>(false);
  const [offerTimer, setOfferTimer] = useState<number>(25);

  // Dynamic Restaurant Name Resolver Helper
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

  // Sync / Load Real-Time Orders from Local Storage
  const loadOrders = useCallback(() => {
    if (typeof window === 'undefined') return;
    const active: any[] = [];
    const completed: any[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('latest_order_')) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const orderId = key.replace('latest_order_', '');
            const parsed = JSON.parse(raw);
            const status = localStorage.getItem(`order_status_${orderId}`) || parsed.status || 'CONFIRMED';

            const formattedOrder = {
              id: orderId,
              orderNumber: orderId.startsWith('ORD-') ? orderId : `ORD-${orderId.slice(-6)}`,
              customerName: parsed.customerName || parsed.customer?.name || parsed.user?.name || parsed.deliveryDetails?.name || 'Customer',
              deliveryAddress: parsed.deliveryAddress || parsed.address || parsed.deliveryDetails?.address || 'Address Not Provided',
              restaurantName: resolveRestaurantName(parsed),
              totalAmount: parsed.totalAmount || parsed.total || 0,
              paymentMethod: parsed.paymentMethod || 'ONLINE',
              status: status,
              createdAt: parsed.createdAt || new Date().toISOString(),
              items: parsed.items || parsed.orderItems || [],
            };

            if (status === 'DELIVERED') {
              completed.push(formattedOrder);
            } else {
              active.push(formattedOrder);
            }
          }
        } catch (e) {
          console.error('Error reading real-time order payload:', e);
        }
      }
    }

    setActiveOrders(active);
    setHistoryOrders(completed);

    setSelectedOrderId((prev) => {
      if (prev) return prev;
      if (active.length > 0) return active[0].id;
      if (completed.length > 0) return completed[0].id;
      return null;
    });
  }, [resolveRestaurantName]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 2000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key && (e.key.startsWith('latest_order_') || e.key.startsWith('order_status_'))) {
        loadOrders();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadOrders]);

  // Modal Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOfferModal && offerTimer > 0) {
      timer = setInterval(() => setOfferTimer((prev) => prev - 1), 1000);
    } else if (offerTimer === 0) {
      setShowOfferModal(false);
    }
    return () => clearInterval(timer);
  }, [showOfferModal, offerTimer]);

  const handleClearHistory = () => {
    if (typeof window === 'undefined') return;
    historyOrders.forEach((ord) => {
      localStorage.removeItem(`latest_order_${ord.id}`);
      localStorage.removeItem(`order_status_${ord.id}`);
    });
    setHistoryOrders([]);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`order_status_${orderId}`, newStatus);
    loadOrders();
  };

  const selectedOrder =
    activeOrders.find((o) => o.id === selectedOrderId) ||
    historyOrders.find((o) => o.id === selectedOrderId) ||
    activeOrders[0] ||
    historyOrders[0];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* DRIVER STATUS HEADER CARD - Blue Theme */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={`w-3.5 h-3.5 rounded-full ${
                driverStatus === 'Available'
                  ? 'bg-emerald-500 animate-pulse'
                  : driverStatus === 'Busy'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                DRIVER STATUS
              </p>
              <p className="text-lg font-black text-slate-900">
                {driverStatus === 'Available'
                  ? 'Online • Ready for Pickups'
                  : driverStatus === 'Busy'
                  ? 'On Delivery • Busy'
                  : 'Offline • Paused'}
              </p>
            </div>
          </div>

          {/* Status Controls Toggle Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            {(['Available', 'Busy', 'Offline'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setDriverStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  driverStatus === status
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: DELIVERIES LIST */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs space-y-4">
              
              {/* Header & Tabs */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 font-serif flex items-center gap-2">
                  <Truck className="w-5 h-5 text-sky-600" /> Deliveries
                </h2>
                
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setSidebarTab('ACTIVE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      sidebarTab === 'ACTIVE'
                        ? 'bg-white text-sky-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Active ({activeOrders.length})
                  </button>
                  <button
                    onClick={() => setSidebarTab('HISTORY')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      sidebarTab === 'HISTORY'
                        ? 'bg-white text-sky-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <History className="w-3.5 h-3.5 inline mr-1" />
                    ({historyOrders.length})
                  </button>
                </div>

                {sidebarTab === 'HISTORY' && historyOrders.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    title="Clear History"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* LIST ITEMS */}
              <div className="space-y-3">
                {(sidebarTab === 'ACTIVE' ? activeOrders : historyOrders).length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <p className="text-xs font-bold">No {sidebarTab.toLowerCase()} orders right now.</p>
                  </div>
                ) : (
                  (sidebarTab === 'ACTIVE' ? activeOrders : historyOrders).map((ord) => {
                    const isSelected = selectedOrder?.id === ord.id;
                    return (
                      <div
                        key={ord.id}
                        onClick={() => setSelectedOrderId(ord.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/60 border-sky-400 shadow-xs ring-2 ring-sky-400/20'
                            : 'bg-white border-slate-100 hover:border-sky-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-slate-900 text-sm">{ord.orderNumber}</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status === 'CONFIRMED' ? 'READY FOR PICKUP' : ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium truncate mb-2">
                          {ord.deliveryAddress}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                            {ord.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}
                          </span>
                          <span className="font-black text-slate-900 text-xs">
                            ${Number(ord.totalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: ACTIVE ORDER DETAIL & PROGRESS ACTION PANEL */}
          <div className="lg:col-span-8 space-y-6">
            {selectedOrder ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xs space-y-6">
                
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                      Order #{selectedOrder.orderNumber}
                    </h1>
                    <p className="text-xs font-bold text-slate-500 mt-1">
                      Customer: <span className="text-slate-800">{selectedOrder.customerName}</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                      TOTAL AMOUNT
                    </span>
                    <span className="text-3xl font-black text-slate-900">
                      ${Number(selectedOrder.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Badge Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900">
                        {selectedOrder.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PAID ONLINE'}
                      </p>
                      <p className="text-xs font-medium text-emerald-700">
                        {selectedOrder.paymentMethod === 'COD'
                          ? 'Collect payment from customer at door'
                          : 'No payment collection needed at door'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {selectedOrder.paymentMethod === 'COD' ? 'COLLECT CASH' : 'PAID ONLINE'}
                  </span>
                </div>

                {/* Driver Identity Card */}
                <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-600 text-white font-black rounded-full flex items-center justify-center text-sm shadow-xs">
                      A
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 flex items-center gap-2">
                        Alex (You)
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">
                          4.9 ★
                        </span>
                      </p>
                      <p className="text-xs font-medium text-slate-500">Order successfully assigned.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Contacting Dispatch Support...')}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-sky-600" /> Support
                  </button>
                </div>

                {/* Pickup & Dropoff Address Section - Dynamic Real-Time Data */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs font-medium text-slate-700">
                    <Store className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Pickup Location:</strong> {selectedOrder.restaurantName}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs font-medium text-slate-700">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Dropoff Location:</strong> {selectedOrder.deliveryAddress}
                    </div>
                  </div>
                </div>

                {/* UPDATE PROGRESS ACTION BUTTONS - Standardized Blue Active Palette */}
                <div className="pt-4 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    UPDATE PROGRESS (DRIVER VIEW)
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Stage 1: At Restaurant */}
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'AT_RESTAURANT')}
                      className={`p-4 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-2 border ${
                        selectedOrder.status === 'AT_RESTAURANT'
                          ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Store className="w-5 h-5" />
                      <span>AT RESTAURANT (READY)</span>
                    </button>

                    {/* Stage 2: Picked Up */}
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'IN_TRANSIT')}
                      className={`p-4 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-2 border ${
                        selectedOrder.status === 'IN_TRANSIT'
                          ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Truck className="w-5 h-5" />
                      <span>PICKED UP (IN TRANSIT)</span>
                    </button>

                    {/* Stage 3: Mark Delivered */}
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'DELIVERED')}
                      className={`p-4 rounded-2xl font-black text-xs transition-all flex flex-col items-center justify-center gap-2 border ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <PackageCheck className="w-5 h-5" />
                      <span>MARK DELIVERED</span>
                    </button>

                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-sky-100 text-center shadow-xs">
                <Truck className="w-12 h-12 text-sky-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Order Selected</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select an active delivery from the left sidebar to view details.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* POPUP OFFER MODAL - Styled with Driver Blue Header Accents */}
      {showOfferModal && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-sky-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top Modal Header Badge */}
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white text-center font-black text-xs tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 uppercase">
                <Sparkles className="w-4 h-4 text-amber-300" /> NEW ORDER OFFER • {offerTimer}S
              </span>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 font-serif">
                  {selectedOrder.orderNumber}
                </h3>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Payout</span>
                  <span className="text-2xl font-black text-emerald-600">
                    ${Number(selectedOrder.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-sky-50/60 border border-sky-100 p-4 rounded-2xl space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pickup From:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.restaurantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deliver To:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.deliveryAddress}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition"
                >
                  Decline
                </button>
                <button
                  onClick={() => {
                    setShowOfferModal(false);
                    alert('Offer Accepted!');
                  }}
                  className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-2xl transition shadow-md"
                >
                  Accept Offer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}