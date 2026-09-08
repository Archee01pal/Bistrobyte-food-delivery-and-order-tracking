'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link href="/" className="font-bold text-xl text-amber-500">
        BistroByte
      </Link>

      <div className="flex items-center space-x-6 text-sm font-medium">
        {user?.role === 'customer' && (
          <Link href="/restaurants" className="hover:text-amber-400">Restaurants</Link>
        )}
        {user?.role === 'restaurant_admin' && (
          <Link href="/restaurant-admin" className="hover:text-amber-400">My Restaurant</Link>
        )}
        {user?.role?.toLowerCase() === 'driver' && (
          <Link href="/driver" className="hover:text-amber-400">Deliveries</Link>
        )}
        {user?.role === 'admin' && (
          <Link href="/admin" className="hover:text-amber-400">Reports Dashboard</Link>
        )}

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-300">
              {user.name} ({user.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-xs font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded text-slate-900 font-semibold"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};