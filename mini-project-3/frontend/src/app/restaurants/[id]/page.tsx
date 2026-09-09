'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Restaurant, MenuItem } from '@/types/restaurant.types';
import { RestaurantService } from '@/services/restaurant.service';
import { useCart } from '@/context/cart-context';

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      RestaurantService.getById(id)
        .then(setRestaurant)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading details...</div>;
  if (!restaurant) return <div className="p-8 text-center text-red-500">Restaurant not found.</div>;

  const groupedMenu = (restaurant.menu || []).reduce((acc, item) => {
    const cat = item.category || 'Main';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const handleAddToCart = (item: MenuItem) => {
    setValidationMessage(null);
    const res = addToCart(item, restaurant.id, restaurant.name);
    if (!res.success && res.message) {
      setValidationMessage(res.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {validationMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm flex justify-between items-center">
          <span>{validationMessage}</span>
          <button onClick={() => setValidationMessage(null)} className="font-bold ml-4">✕</button>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
        <h1 className="text-3xl font-bold text-slate-800">{restaurant.name}</h1>
        <p className="text-slate-600 mt-1">{restaurant.address}</p>
        <p className="text-slate-500 text-sm mt-2">Hours: {restaurant.operatingHours}</p>
      </div>

      {Object.keys(groupedMenu).length > 0 ? (
        Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg bg-white flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                    <p className="text-slate-600 text-sm">{item.description}</p>
                    <p className="text-amber-600 font-bold mt-2">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    disabled={!item.isAvailable}
                    onClick={() => handleAddToCart(item)}
                    className={`px-4 py-2 rounded text-sm font-semibold text-white transition-colors ${
                      item.isAvailable ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-500 italic">No menu items available.</p>
      )}
    </div>
  );
}