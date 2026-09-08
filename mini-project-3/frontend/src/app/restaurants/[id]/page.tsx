'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Restaurant } from '@/types/restaurant.types';
import { RestaurantService } from '@/services/restaurant.service';

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      RestaurantService.getById(id)
        .then(setRestaurant)
        .catch((err) => console.error('Error loading restaurant details:', err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-600">Loading menu...</div>;
  if (!restaurant) return <div className="p-8 text-center text-red-500">Restaurant not found.</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
        <h1 className="text-3xl font-bold text-slate-800">{restaurant.name}</h1>
        <p className="text-slate-600 mt-1">{restaurant.address}</p>
        <p className="text-slate-500 text-sm mt-2">Operating Hours: {restaurant.operatingHours}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-slate-800">Menu Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restaurant.menu && restaurant.menu.length > 0 ? (
          restaurant.menu.map((item) => (
            <div key={item.id} className="border p-4 rounded-lg bg-white flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
                <p className="text-amber-600 font-bold mt-2">${item.price.toFixed(2)}</p>
              </div>
              <button
                disabled={!item.isAvailable}
                className={`px-4 py-2 rounded text-sm font-semibold text-white ${
                  item.isAvailable ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          ))
        ) : (
          <p className="text-slate-500 italic">No menu items available yet.</p>
        )}
      </div>
    </div>
  );
}