'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getMyOrdersApi } from '@/lib/api-client';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      getMyOrdersApi()
        .then((res) => {
          setOrders(res.data || []);
        })
        .catch((err) => {
          console.error('Failed to fetch user orders:', err);
        })
        .finally(() => {
          setIsLoadingOrders(false);
        });
    }
  }, [user]);

  if (isAuthLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-12 p-6 text-center">
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white border rounded-lg shadow-sm text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-600 mb-6">Please log in to view your profile and order history.</p>
        <Link
          href="/login"
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 space-y-8">
      {/* Profile Header */}
      <div className="bg-white border rounded-lg p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{user.name || 'User Profile'}</h1>
          <p className="text-slate-600 text-sm mt-1">{user.email}</p>
          <span className="inline-block bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded mt-2 uppercase">
            {user.role || 'Customer'}
          </span>
        </div>
        <button
          onClick={logout}
          className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded text-sm transition"
        >
          Logout
        </button>
      </div>

      {/* Order History */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Order History</h2>

        {isLoadingOrders ? (
          <p className="text-slate-500 text-sm">Loading order history...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">You have not placed any orders yet.</p>
            <Link
              href="/restaurants"
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded inline-block"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id || order._id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-bold text-slate-800">
                    Order #{order.id?.slice(-6) || order._id?.slice(-6)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 mt-2">
                    Total: ${order.totalAmount || order.total}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-3 py-1 rounded-full uppercase ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {order.status}
                  </span>
                  <div className="mt-3">
                    <Link
                      href={`/orders/${order.id || order._id}`}
                      className="text-xs font-semibold text-amber-600 hover:underline"
                    >
                      Track Order &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}