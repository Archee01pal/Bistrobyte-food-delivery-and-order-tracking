'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  History, 
  ArrowLeft, 
  Search, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  DollarSign, 
  Truck, 
  Calendar,
  Package,
  User
} from 'lucide-react';

export default function DriverHistoryPage() {
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

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

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    if (typeof window === 'undefined') return;
    const completedMap = new Map<string, any>();

    // 1. Fetch real-time orders stored in LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('latest_order_') || key.startsWith('order_'))) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const orderId = key.replace('latest_order_', '').replace('order_', '');
            const parsed = JSON.parse(raw);
            const status = 
              localStorage.getItem(`order_status_${orderId}`) || 
              parsed.status || 
              parsed.orderStatus || 
              'DELIVERED';

            if (status === 'DELIVERED' || status === 'COMPLETED') {
              const formattedId = orderId.startsWith('ORD-') ? orderId : `ORD-${orderId.slice(-6).toUpperCase()}`;
              
              completedMap.set(formattedId, {
                id: orderId,
                orderNumber: formattedId,
                customerName: parsed.customerName || parsed.customer?.name || parsed.user?.name || 'Customer #411',
                deliveryAddress: parsed.deliveryAddress || parsed.address || '123 Main Street, Suite 5',
                restaurantName: resolveRestaurantName(parsed),
                totalAmount: parsed.totalAmount || parsed.total || parsed.price || 28.0,
                paymentMethod: parsed.paymentMethod || 'ONLINE',
                createdAt: parsed.createdAt || new Date().toISOString(),
                itemsCount: parsed.items?.length || 1,
              });
            }
          }
        } catch (e) {
          console.error('Error parsing driver order from storage:', e);
        }
      }
    }

    // 2. Optional: Fetch active/history driver orders from API backend if endpoint exists
    try {
      const res = await fetch('/api/driver/orders/history');
      if (res.ok) {
        const apiData = await res.json();
        const ordersArray = Array.isArray(apiData) ? apiData : apiData?.data || [];

        ordersArray.forEach((item: any) => {
          const rawId = item.orderNumber || item.id || item._id;
          const formattedId = String(rawId).startsWith('ORD-') ? String(rawId) : `ORD-${String(rawId).slice(-6).toUpperCase()}`;

          if (item.status === 'DELIVERED' || item.status === 'COMPLETED') {
            completedMap.set(formattedId, {
              id: item.id || rawId,
              orderNumber: formattedId,
              customerName: item.customerName || item.user?.name || item.customer || 'Customer #411',
              deliveryAddress: item.deliveryAddress || item.address || '123 Main Street, Suite 5',
              restaurantName: resolveRestaurantName(item),
              totalAmount: item.totalAmount || item.total || item.price || 28.0,
              paymentMethod: item.paymentMethod || 'ONLINE',
              createdAt: item.createdAt || new Date().toISOString(),
              itemsCount: item.items?.length || 1,
            });
          }
        });
      }
    } catch (err) {
      // Gracefully continue with local storage data if API is unbonded
    }

    setHistoryOrders(Array.from(completedMap.values()));
    setIsLoading(false);
  }, [resolveRestaurantName]);

  // Sync real-time storage events and cross-tab updates
  useEffect(() => {
    loadHistory();

    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key &&
        (e.key.startsWith('latest_order_') ||
          e.key.startsWith('order_status_') ||
          e.key.startsWith('order_'))
      ) {
        loadHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadHistory]);

  // Compute stats
  const totalEarnings = useMemo(() => {
    return historyOrders.reduce((sum, ord) => sum + Number(ord.totalAmount || 0), 0);
  }, [historyOrders]);

  // Filter orders by search term and status
  const filteredOrders = useMemo(() => {
    return historyOrders.filter((ord) => {
      const matchesSearch = 
        ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ord.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [historyOrders, searchTerm]);

  // Handle Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert('No delivery records available to export.');

    const headers = ['Order #,Customer,Dropoff Address,Kitchen,Trip Total,Date\n'];
    const rows = filteredOrders.map((ord) => 
      `"${ord.orderNumber}","${ord.customerName}","${ord.deliveryAddress}","${ord.restaurantName}","$${Number(ord.totalAmount).toFixed(2)}","${new Date(ord.createdAt).toLocaleString()}"\n`
    );

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HERO BANNER - Driver Blue */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 p-8 sm:p-10 text-white shadow-xl shadow-sky-500/15">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link
                  href="/driver"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 hover:bg-white/25 text-white rounded-full text-xs font-bold transition backdrop-blur-md"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Driver Dashboard</span>
                </Link>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md">
                  <Truck className="w-3.5 h-3.5" /> DRIVER VIEW
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white">
                Delivery History
              </h1>
              <p className="text-sm sm:text-base font-medium text-sky-100 max-w-xl">
                Track your past completed driver fulfilled trips, review earnings, and manage drop-off details.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => loadHistory()}
                className="p-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl transition backdrop-blur-md active:scale-95 cursor-pointer"
                title="Refresh History"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL EARNED</p>
              <p className="text-2xl font-black text-slate-900 mt-1">${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL DELIVERIES</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{historyOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center border border-sky-100">
              <Package className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">ACTIVE TRIPS</p>
              <p className="text-2xl font-black text-slate-900 mt-1">0</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
              <Truck className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">COMPLETED</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{historyOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS TOOLBAR */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sky-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order #, Address, Customer, or Restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-extrabold text-slate-400 mr-2 uppercase">Filter:</span>
            {['ALL', 'DELIVERED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* HISTORY ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-sky-100 shadow-xs">
            <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-100">
              <History className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">No Delivery Records Found</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Completed driver orders will automatically sync here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-6 rounded-3xl border border-sky-100 shadow-xs hover:border-sky-300 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Left Section: Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-slate-900 tracking-tight font-serif">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DELIVERED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-sky-600 shrink-0" />
                      <span><strong>Customer:</strong> {ord.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="truncate"><strong>Dropoff:</strong> {ord.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-sky-600 shrink-0" />
                      <span><strong>Kitchen:</strong> <span className="font-extrabold text-sky-900">{ord.restaurantName}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        {new Date(ord.createdAt).toLocaleDateString()} • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Earnings & Payment */}
                <div className="lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 flex lg:flex-col justify-between items-center lg:items-end shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">
                      Trip Total
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      ${Number(ord.totalAmount).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl mt-2">
                    ✓ PAID ONLINE
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}