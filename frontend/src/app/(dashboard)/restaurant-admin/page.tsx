'use client';

import Link from 'next/link';
import { Utensils, ClipboardList, Settings } from 'lucide-react';

export default function RestaurantAdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Restaurant Management</h1>
      <p className="text-slate-600 mb-8">Manage your restaurant menu, active orders, and settings.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/restaurant-admin/menu"
          className="p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Menu Management</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove menu items and set prices.</p>
        </Link>

        <div className="p-6 bg-white rounded-lg border shadow-sm opacity-60">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Incoming Orders</h2>
          <p className="text-sm text-slate-500">View real-time customer orders (Coming soon).</p>
        </div>

        <div className="p-6 bg-white rounded-lg border shadow-sm opacity-60">
          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 mb-4">
            <Settings className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">Store Settings</h2>
          <p className="text-sm text-slate-500">Update business hours and address (Coming soon).</p>
        </div>
      </div>
    </div>
  );
}