'use client';

import { useEffect, useState } from 'react';
import { Restaurant } from '@/types/restaurant.types';
import { RestaurantService } from '@/services/restaurant.service';
import Link from 'next/link';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    RestaurantService.getAll()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setRestaurants(data);
        } else if (data && Array.isArray(data.data)) {
          setRestaurants(data.data);
        } else {
          setRestaurants([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-600 font-medium">Loading restaurants...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Available Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {restaurants.length > 0 ? (
          restaurants.map((res) => (
            <div key={res.id} className="border rounded-lg p-5 shadow-sm hover:shadow-md bg-white flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{res.name}</h2>
                <p className="text-slate-600 text-sm mt-1">{res.address}</p>
                <p className="text-slate-500 text-xs mt-2">Hours: {res.operatingHours}</p>
              </div>
              <Link
                href={`/restaurants/${res.id}`}
                className="mt-4 block text-center bg-amber-500 text-slate-900 font-semibold py-2 rounded text-sm hover:bg-amber-600 transition-colors"
              >
                View Menu
              </Link>
            </div>
          ))
        ) : (
          <p className="text-slate-500">No restaurants found.</p>
        )}
      </div>
    </div>
  );
}