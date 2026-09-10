import React from 'react';

export default function RestaurantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="font-bold text-amber-600 text-lg">Portal: Restaurant Admin</span>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}