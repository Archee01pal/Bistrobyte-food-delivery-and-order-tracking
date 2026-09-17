'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/axios';

// --- Types ---
type AdminTab = 'METRICS' | 'FINANCIALS' | 'USERS' | 'RESTAURANTS' | 'DRIVERS';
type UserRole = 'CUSTOMER' | 'RESTAURANT_ADMIN' | 'DRIVER' | 'ADMIN';
type AccountStatus = 'ACTIVE' | 'SUSPENDED';
type OrderFilter = 'ALL' | 'COMPLETED' | 'CANCELLED';

interface AdminMetrics {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
}

interface FinancialBreakdown {
  grossOrderValue: number;
  deliveryFeesCollected: number;
  platformCommission: number;
  restaurantPayoutOwed: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
}

interface Restaurant {
  id: string;
  name: string;
  owner: string;
  isApproved: boolean;
  isOpen: boolean;
  itemCount: number;
}

interface ActiveOrder {
  id: string;
  customerName: string;
  restaurantName: string;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignmentStatus?: 'ACCEPTED' | 'PENDING' | 'REJECTED';
  status: 'PENDING' | 'PREPARING' | 'CONFIRMED' | 'READY' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  totalAmount?: number;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  isAvailable: boolean;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('METRICS');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [financials, setFinancials] = useState<FinancialBreakdown>({
    grossOrderValue: 0,
    deliveryFeesCollected: 0,
    platformCommission: 0,
    restaurantPayoutOwed: 0,
  });
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('ALL');

  const [users, setUsers] = useState<User[]>([
    { id: 'usr-1', name: 'Archee Paliwal', email: 'paliwalarchee@gmail.com', role: 'ADMIN', status: 'ACTIVE' },
    { id: 'usr-2', name: 'Alex Driver', email: 'alex@bistrobyte.com', role: 'DRIVER', status: 'ACTIVE' },
    { id: 'usr-3', name: 'Sarah Jenkins', email: 'sarah@example.com', role: 'CUSTOMER', status: 'ACTIVE' },
  ]);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    { id: 'rst-1', name: 'Bistro Byte Central', owner: 'Archee Paliwal', isApproved: true, isOpen: true, itemCount: 12 },
    { id: 'rst-2', name: 'Gourmet Burger Hub', owner: 'Chef Marco', isApproved: false, isOpen: false, itemCount: 8 },
    { id: 'rst-3', name: 'Spice Route Kitchen', owner: 'Priya Sharma', isApproved: true, isOpen: true, itemCount: 15 },
    { id: 'rst-4', name: 'The Wooden Oven Pizza', owner: 'Luigi Rossi', isApproved: true, isOpen: true, itemCount: 10 },
    { id: 'rst-5', name: 'Sushi Master Exquisite', owner: 'Kenji Sato', isApproved: false, isOpen: false, itemCount: 18 },
  ]);

  const [drivers, setDrivers] = useState<Driver[]>([
    { id: 'driver-alex-101', name: 'Alex', phone: '+1 555-0192', isAvailable: true },
    { id: 'drv-1', name: 'David Rider', phone: '+1 555-0143', isAvailable: true },
    { id: 'drv-2', name: 'Sarah Connor', phone: '+1 555-0188', isAvailable: false },
  ]);

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Data Fetchers ---
  const fetchMetricsAndFinancials = useCallback((ordersList: ActiveOrder[]) => {
    let total = ordersList.length;
    let completed = 0;
    let cancelled = 0;
    let grossValue = 0;

    ordersList.forEach((ord) => {
      const amt = Number(ord.totalAmount || 0);
      if (ord.status === 'DELIVERED') {
        completed++;
        grossValue += amt;
      } else if (ord.status === 'CANCELLED') {
        cancelled++;
      } else {
        grossValue += amt;
      }
    });

    setMetrics({ totalOrders: total, completedOrders: completed, cancelledOrders: cancelled, revenue: grossValue });

    const deliveryFees = grossValue * 0.10;
    const commission = grossValue * 0.15;
    const payout = grossValue - commission - deliveryFees;

    setFinancials({
      grossOrderValue: grossValue,
      deliveryFeesCollected: deliveryFees,
      platformCommission: commission,
      restaurantPayoutOwed: payout > 0 ? payout : 0,
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data);
      }
    } catch {
      // Retain default user state
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await api.get('/admin/restaurants');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setRestaurants(res.data);
      }
    } catch {
      // Retain default restaurant state
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const res = await api.get('/admin/drivers');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setDrivers(res.data);
      }
    } catch {
      // Retain default driver state
    }
  }, []);

  // Dynamic restaurant name extraction helper
  const resolveRestaurantName = useCallback(
    (parsed: any) => {
      if (parsed.restaurantName) return parsed.restaurantName;
      if (parsed.restaurant?.name) return parsed.restaurant.name;
      if (parsed.vendorName) return parsed.vendorName;

      // Check order items for nested restaurant info
      if (Array.isArray(parsed.items) && parsed.items.length > 0) {
        const firstItem = parsed.items[0];
        const menuItem = firstItem.menuItem || firstItem;
        if (menuItem.restaurantName) return menuItem.restaurantName;
        if (menuItem.restaurant?.name) return menuItem.restaurant.name;
        if (menuItem.vendorName) return menuItem.vendorName;

        // Match against known restaurants if ID exists
        const restId = parsed.restaurantId || menuItem.restaurantId || firstItem.restaurantId;
        if (restId) {
          const matched = restaurants.find((r) => r.id === restId);
          if (matched) return matched.name;
        }
      }

      return 'General Store';
    },
    [restaurants]
  );

  const fetchOrders = useCallback(async () => {
    let loadedOrders: ActiveOrder[] = [];
    try {
      const res = await api.get('/admin/orders');
      if (res.data && Array.isArray(res.data)) {
        loadedOrders = res.data.map((ord: any) => ({
          ...ord,
          restaurantName: resolveRestaurantName(ord),
        }));
      }
    } catch {
      // Fallback to reading live local orders
    }

    if (loadedOrders.length === 0 && typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('latest_order_')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const orderId = key.replace('latest_order_', '');
              const parsed = JSON.parse(raw);

              const driverMetaRaw = localStorage.getItem(`order_driver_${orderId}`);
              let driverMeta = driverMetaRaw ? JSON.parse(driverMetaRaw) : null;

              const assignedDriverId =
                parsed.assignedDriver?.driverId ||
                driverMeta?.driverId ||
                localStorage.getItem(`assigned_driver_${orderId}`) ||
                null;

              const assignedDriverName =
                parsed.assignedDriver?.driverName ||
                driverMeta?.driverName ||
                localStorage.getItem(`assigned_driver_name_${orderId}`) ||
                null;

              const status =
                parsed.status ||
                (localStorage.getItem(`order_status_${orderId}`) as ActiveOrder['status']) ||
                (assignedDriverId ? 'READY' : 'PENDING');

              const assignmentStatus = parsed.assignmentStatus || (assignedDriverId ? 'ACCEPTED' : 'PENDING');

              loadedOrders.push({
                id: parsed.id || orderId,
                customerName: parsed.customerName || parsed.user?.name || parsed.deliveryDetails?.name || 'Customer',
                restaurantName: resolveRestaurantName(parsed),
                assignedDriverId,
                assignedDriverName,
                assignmentStatus,
                status,
                totalAmount: Number(parsed.totalAmount || parsed.total || 45.00),
              });
            }
          } catch (e) {
            console.error('Error loading order details:', e);
          }
        }
      }
    }

    setActiveOrders(loadedOrders);
    return loadedOrders;
  }, [resolveRestaurantName]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchRestaurants(), fetchDrivers()]);
    const orders = await fetchOrders();
    fetchMetricsAndFinancials(orders);
    setLoading(false);
  }, [fetchOrders, fetchMetricsAndFinancials, fetchUsers, fetchRestaurants, fetchDrivers]);

  // Sync real-time events, interval polling, and storage updates
  useEffect(() => {
    loadAllData();

    // Event listener for Driver accepting offer in real-time
    const handleOrderAssignedEvent = (event: any) => {
      const orderData = event.detail?.order;
      if (orderData) {
        setActiveOrders((prevOrders) => {
          const exists = prevOrders.some((o) => o.id === orderData.id);
          const updated = {
            id: orderData.id,
            customerName: orderData.customerName || 'Customer',
            restaurantName: resolveRestaurantName(orderData),
            assignedDriverId: orderData.assignedDriver?.driverId || 'driver-alex-101',
            assignedDriverName: orderData.assignedDriver?.driverName || 'Alex',
            assignmentStatus: 'ACCEPTED',
            status: orderData.status || 'READY',
            totalAmount: Number(orderData.totalAmount || 45.00),
          } as ActiveOrder;

          if (exists) {
            return prevOrders.map((o) => (o.id === orderData.id ? updated : o));
          }
          return [updated, ...prevOrders];
        });
      } else {
        fetchOrders();
      }
    };

    const handleStorageChange = () => {
      fetchOrders();
    };

    // Live poll every 3 seconds to capture status updates across browser tabs
    const intervalId = setInterval(() => {
      fetchOrders().then((updatedOrders) => {
        fetchMetricsAndFinancials(updatedOrders);
      });
    }, 3000);

    if (typeof window !== 'undefined') {
      window.addEventListener('order_assigned_event', handleOrderAssignedEvent);
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('order_assigned_event', handleOrderAssignedEvent);
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, [loadAllData, fetchOrders, fetchMetricsAndFinancials, resolveRestaurantName]);

  // --- Handlers ---
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
    } catch {
      // Fallback
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
  };

  const handleToggleStatus = async (userId: string, currentStatus: AccountStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: nextStatus });
    } catch {
      // Fallback
    }
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
  };

  const handleToggleApproval = async (restId: string, currentApproval: boolean) => {
    try {
      await api.patch(`/admin/restaurants/${restId}/approval`, { isApproved: !currentApproval });
    } catch {
      // Fallback
    }
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restId ? { ...r, isApproved: !r.isApproved } : r))
    );
  };

  const handleToggleOpen = async (restId: string, currentOpen: boolean) => {
    try {
      await api.patch(`/admin/restaurants/${restId}/open-status`, { isOpen: !currentOpen });
    } catch {
      // Fallback
    }
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restId ? { ...r, isOpen: !r.isOpen } : r))
    );
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    const selectedDriver = drivers.find((d) => d.id === driverId);
    const driverName = selectedDriver ? selectedDriver.name : null;

    try {
      await api.post(`/admin/orders/${orderId}/assign-driver`, { driverId });
    } catch {
      if (typeof window !== 'undefined') {
        if (driverId) {
          localStorage.setItem(`assigned_driver_${orderId}`, driverId);
          if (driverName) localStorage.setItem(`assigned_driver_name_${orderId}`, driverName);
          localStorage.setItem(`order_status_${orderId}`, 'IN_TRANSIT');
        } else {
          localStorage.removeItem(`assigned_driver_${orderId}`);
          localStorage.removeItem(`assigned_driver_name_${orderId}`);
        }
      }
    }

    const updatedOrders = activeOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            assignedDriverId: driverId || null,
            assignedDriverName: driverName,
            assignmentStatus: (driverId ? 'ACCEPTED' : 'PENDING') as ActiveOrder['assignmentStatus'],
            status: (driverId ? 'IN_TRANSIT' : 'PENDING') as ActiveOrder['status'],
          }
        : o
    );

    setActiveOrders(updatedOrders);
    fetchMetricsAndFinancials(updatedOrders);
  };

  const getStatusBadgeClass = (status: string) => {
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
      default:
        return 'bg-amber-100 text-amber-900 border-amber-300';
    }
  };

  const filteredOrders = activeOrders.filter((ord) => {
    if (orderFilter === 'COMPLETED') return ord.status === 'DELIVERED';
    if (orderFilter === 'CANCELLED') return ord.status === 'CANCELLED';
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-purple-900 font-semibold text-sm">Syncing BistroByte Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-purple-700/30">
        <div>
          <span className="bg-purple-500/20 text-purple-200 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-purple-400/30 backdrop-blur-md">
            Executive Operations
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2 text-purple-50">Admin Control Panel</h1>
          <p className="text-purple-200 text-sm mt-1 max-w-xl">
            Real-time platform dispatch, user account governance, restaurant onboarding auditing, and platform revenue splits.
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer flex items-center space-x-2 border border-purple-300/30"
        >
          <span>Sync Live Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-purple-100 overflow-x-auto space-x-2 scrollbar-none">
        {(['METRICS', 'FINANCIALS', 'USERS', 'RESTAURANTS', 'DRIVERS'] as AdminTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-5 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? 'border-purple-600 text-purple-900 bg-purple-50 rounded-t-xl'
                : 'border-transparent text-purple-600 hover:text-purple-950 hover:bg-purple-50/50 rounded-t-xl'
            }`}
          >
            {tab === 'METRICS' && 'Overview Metrics'}
            {tab === 'FINANCIALS' && 'Revenue & Split'}
            {tab === 'USERS' && `Users (${users.length})`}
            {tab === 'RESTAURANTS' && `Restaurants (${restaurants.length})`}
            {tab === 'DRIVERS' && `Driver Dispatch (${activeOrders.length})`}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview Metrics */}
      {activeTab === 'METRICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => setOrderFilter('ALL')}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                orderFilter === 'ALL'
                  ? 'bg-purple-50 border-purple-600 shadow-lg ring-2 ring-purple-600/20'
                  : 'bg-white border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider text-purple-900">
                  Total Orders
                </span>
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs">
                  📦 All
                </span>
              </div>
              <p className="text-4xl font-black text-purple-950 mt-4 tracking-tight">
                {metrics?.totalOrders ?? 0}
              </p>
            </div>

            <div
              onClick={() => setOrderFilter('COMPLETED')}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                orderFilter === 'COMPLETED'
                  ? 'bg-emerald-50 border-emerald-600 shadow-lg ring-2 ring-emerald-600/20'
                  : 'bg-white border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider text-emerald-900">
                  Completed Orders
                </span>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs">
                  ✓ Done
                </span>
              </div>
              <p className="text-4xl font-black text-emerald-600 mt-4 tracking-tight">
                {metrics?.completedOrders ?? 0}
              </p>
            </div>

            <div
              onClick={() => setOrderFilter('CANCELLED')}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                orderFilter === 'CANCELLED'
                  ? 'bg-rose-50 border-rose-600 shadow-lg ring-2 ring-rose-600/20'
                  : 'bg-white border-purple-100 shadow-sm hover:shadow-md hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider text-rose-900">
                  Cancelled Orders
                </span>
                <span className="p-2 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs">
                  ✕ Void
                </span>
              </div>
              <p className="text-4xl font-black text-rose-600 mt-4 tracking-tight">
                {metrics?.cancelledOrders ?? 0}
              </p>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-purple-800 via-indigo-800 to-purple-900 text-white p-6 rounded-2xl shadow-lg border border-purple-700/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black uppercase tracking-wider text-purple-200">
                  Gross Revenue
                </span>
                <span className="p-2 rounded-xl bg-white/20 text-white font-bold text-xs backdrop-blur-sm">
                  💰 Revenue
                </span>
              </div>
              <p className="text-4xl font-black text-white mt-4 tracking-tight drop-shadow-sm">
                ${Number(metrics?.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-purple-950 text-base">
              {orderFilter === 'ALL' && 'All Orders'}
              {orderFilter === 'COMPLETED' && 'Completed Orders'}
              {orderFilter === 'CANCELLED' && 'Cancelled Orders'}
            </h3>

            {filteredOrders.length === 0 ? (
              <p className="text-xs text-purple-500 italic py-4">No orders match this filter.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-purple-900">
                  <thead className="bg-purple-50/80 border-b border-purple-100 uppercase font-bold text-purple-600">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Restaurant</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-purple-50/40 transition">
                        <td className="p-4 font-mono font-bold text-purple-950">{ord.id}</td>
                        <td className="p-4 font-semibold text-purple-900">{ord.customerName}</td>
                        <td className="p-4 text-purple-700 font-bold">{ord.restaurantName}</td>
                        <td className="p-4 font-bold text-purple-950">${Number(ord.totalAmount || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 font-extrabold text-[10px] rounded-full border ${getStatusBadgeClass(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Financials */}
      {activeTab === 'FINANCIALS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-purple-950 to-indigo-900 text-white p-6 rounded-2xl shadow-md border border-purple-800">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-300">Gross Order Value</p>
              <p className="text-3xl font-black mt-2 text-white">${financials.grossOrderValue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Delivery Fees</p>
              <p className="text-3xl font-black text-purple-950 mt-2">${financials.deliveryFeesCollected.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50/70 p-6 rounded-2xl border border-purple-200 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Platform Commission</p>
              <p className="text-3xl font-black text-purple-900 mt-2">${financials.platformCommission.toFixed(2)}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Payout Owed</p>
              <p className="text-3xl font-black text-emerald-800 mt-2">${financials.restaurantPayoutOwed.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-purple-900">
            <thead className="bg-purple-50/80 border-b border-purple-100 uppercase font-bold text-purple-600">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-purple-50/30 transition">
                  <td className="p-4 font-bold text-purple-950">{u.name}</td>
                  <td className="p-4 text-purple-600">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="border border-purple-200 rounded-lg px-2.5 py-1 text-xs bg-purple-50 font-bold text-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="RESTAURANT_ADMIN">RESTAURANT_ADMIN</option>
                      <option value="DRIVER">DRIVER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-4 font-semibold">{u.status}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-lg transition"
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Restaurants */}
      {activeTab === 'RESTAURANTS' && (
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs text-purple-900">
            <thead className="bg-purple-50/80 border-b border-purple-100 uppercase font-bold text-purple-600">
              <tr>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Approval</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50">
              {restaurants.map((r) => (
                <tr key={r.id} className="hover:bg-purple-50/30 transition">
                  <td className="p-4 font-bold text-purple-950">{r.name}</td>
                  <td className="p-4 text-purple-600">{r.owner}</td>
                  <td className="p-4 font-semibold">{r.isApproved ? 'APPROVED' : 'PENDING'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleApproval(r.id, r.isApproved)}
                      className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-lg transition"
                    >
                      {r.isApproved ? 'Reject' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleToggleOpen(r.id, r.isOpen)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
                    >
                      Toggle Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Driver Dispatch */}
      {activeTab === 'DRIVERS' && (
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-purple-950 text-base">Live Dispatch Controller</h3>
            <span className="text-xs text-purple-500 font-semibold">{activeOrders.length} active order streams</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-purple-900">
              <thead className="bg-purple-50/80 border-b border-purple-100 uppercase font-bold text-purple-600">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Restaurant</th>
                  <th className="p-4">Driver Status</th>
                  <th className="p-4">Assigned Driver</th>
                  <th className="p-4 text-right">Dispatch Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {activeOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-purple-50/40 transition">
                    <td className="p-4 font-mono font-bold text-purple-950">{ord.id}</td>
                    <td className="p-4 font-semibold text-purple-900">{ord.customerName}</td>
                    <td className="p-4 text-purple-700 font-bold">{ord.restaurantName}</td>
                    <td className="p-4">
                      {ord.assignedDriverId || ord.assignmentStatus === 'ACCEPTED' ? (
                        <span className="px-3 py-1 font-black text-[10px] rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ ACCEPTED & ASSIGNED
                        </span>
                      ) : (
                        <span className="px-3 py-1 font-black text-[10px] rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          UNASSIGNED / PENDING
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-purple-950">
                      {ord.assignedDriverName ||
                        drivers.find((d) => d.id === ord.assignedDriverId)?.name || (
                          <span className="text-purple-400 italic">None assigned</span>
                        )}
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={ord.assignedDriverId || ''}
                        onChange={(e) => handleAssignDriver(ord.id, e.target.value)}
                        className="border border-purple-200 rounded-lg px-2.5 py-1 text-xs bg-purple-50 font-bold text-purple-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">-- Manual Reassign --</option>
                        {drivers.map((drv) => (
                          <option key={drv.id} value={drv.id}>
                            {drv.name} ({drv.phone})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}