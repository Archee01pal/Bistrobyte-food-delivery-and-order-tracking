'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import { ShoppingBag, Truck, History, Utensils } from 'lucide-react';
import NotificationDropdown from './notification-dropdown';

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const cartContext = useCart();

  // Extract items fallback to ensure total count displays reliably
  const items = cartContext?.items || cartContext?.cart?.items || [];
  
  // Calculate total items dynamically if cartContext.totalItems is not exported
  const itemCount =
    typeof cartContext?.totalItems === 'number'
      ? cartContext.totalItems
      : items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Enlarged BistroByte Brand Header */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 text-white flex items-center justify-center rounded-2xl shadow-md shadow-amber-500/20 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
            <Utensils className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
            Bistro<span className="text-amber-500">Byte</span>
          </span>
        </Link>

        {/* Navigation & Action Links */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link 
            href="/restaurants" 
            className="px-3.5 py-2 text-sm font-bold text-slate-700 hover:text-amber-600 hover:bg-amber-50/80 rounded-xl transition-all"
          >
            Restaurants
          </Link>

          {/* Cart Icon & Badge */}
          <Link 
            href="/cart" 
            className="relative p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-emerald-500/20 hover:scale-110 active:scale-95 group" 
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Authentication Handling */}
          {isLoading ? (
            <div className="w-16 h-8 bg-slate-100 animate-pulse rounded-xl" />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Order History */}
              <Link 
                href="/orders" 
                className="p-2.5 bg-violet-50 text-violet-600 hover:bg-violet-500 hover:text-white rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-violet-500/20 hover:scale-110 active:scale-95 group"
                title="Order History"
              >
                <History className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="p-0.5 bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white rounded-2xl transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-sky-500/20 hover:scale-110 active:scale-95">
                <NotificationDropdown />
              </div>

              {/* Driver Portal Link */}
              <Link
                href="/driver"
                className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-500 hover:to-orange-500 hover:text-white rounded-2xl font-black text-xs transition-all duration-200 border border-amber-200/70 shadow-xs hover:shadow-md hover:shadow-amber-500/20 hover:scale-105 active:scale-95 group"
              >
                <Truck className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span>Driver</span>
              </Link>

              {/* User Identity Pill */}
              <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-slate-100/80 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[130px] truncate">
                  {user.email || user.name || 'Account'}
                </span>
              </div>

              {/* Vibrant Logout Button */}
              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
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