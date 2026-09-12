'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { ShoppingBag, Truck } from 'lucide-react';
import NotificationDropdown from './notification-dropdown';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-amber-500">
          BistroByte
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/restaurants" className="text-slate-600 hover:text-slate-900 font-medium text-sm">
            Restaurants
          </Link>

          {/* Cart Icon & Badge */}
          <Link href="/cart" className="relative p-2 text-slate-600 hover:text-slate-900">
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Prevent layout flash during localStorage read */}
          {isLoading ? (
            <div className="w-16 h-8 bg-slate-100 animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Day 04 Notification Bell & Dropdown */}
              <NotificationDropdown />

              {/* Day 04 Driver Portal Link */}
              <Link
                href="/driver"
                className="flex items-center gap-1 text-slate-600 hover:text-amber-600 text-sm font-medium transition"
              >
                <Truck className="w-4 h-4" /> Driver
              </Link>

              <span className="text-sm font-semibold text-slate-700">
                {user.email || user.name || 'Account'}
              </span>

              <button
                onClick={logout}
                className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;