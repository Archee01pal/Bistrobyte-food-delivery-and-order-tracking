'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function MenuManagementPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main',
  });

  // Fetch current menu items
  const fetchMenu = async () => {
    try {
      const res = await apiClient.get('/restaurants/my-restaurant/menu');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/restaurants/my-restaurant/menu', {
        ...formData,
        price: parseFloat(formData.price),
      });
      setFormData({ name: '', description: '', price: '', category: 'Main' });
      fetchMenu(); // Refresh list after adding
    } catch (err) {
      alert('Failed to add item. Ensure you are logged in as a restaurant admin.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Menu Items</h1>

      {/* Add Item Form */}
      <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Menu Item</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2 text-slate-800"
                placeholder="e.g. Taco Pack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border rounded px-3 py-2 text-slate-800"
                placeholder="12.99"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded px-3 py-2 text-slate-800"
              rows={2}
              placeholder="Crispy beef tacos with fresh salsa..."
            />
          </div>

          <button
            type="submit"
            className="self-start bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-2 rounded transition-colors"
          >
            Add Menu Item
          </button>
        </form>
      </div>

      {/* Menu Item List */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Current Menu Items</h2>
        {loading ? (
          <p className="text-slate-500">Loading menu items...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500">No items created yet.</p>
        ) : (
          <div className="divide-y">
            {items.map((item: any) => (
              <div key={item.id || item._id} className="py-3 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-slate-800">{item.name}</h3>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
                <span className="font-bold text-amber-600">${Number(item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}