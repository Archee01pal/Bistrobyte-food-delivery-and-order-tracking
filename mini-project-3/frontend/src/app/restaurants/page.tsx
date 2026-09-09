'use client';

import { useEffect, useState } from 'react';
import { Restaurant } from '@/types/restaurant.types';
import { RestaurantService } from '@/services/restaurant.service';
import { RestaurantFilters } from '@/components/restaurant-filters';
import Link from 'next/link';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isOpenOnly, setIsOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    RestaurantService.getAll({
      search,
      cuisine,
      isOpen: isOpenOnly ? true : undefined,
      sortBy: sortBy as 'name' | 'rating',
      page,
      limit: 6,
    })
      .then((res: any) => {
        if (Array.isArray(res)) {
          setRestaurants(res);
          setTotalPages(1);
        } else if (res && Array.isArray(res.data)) {
          setRestaurants(res.data);
          setTotalPages(res.totalPages || 1);
        } else {
          setRestaurants([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching restaurants:', err);
        setError('Failed to load restaurants.');
      })
      .finally(() => setLoading(false));
  }, [search, cuisine, isOpenOnly, sortBy, page]);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Available Restaurants</h1>

      <RestaurantFilters
        search={search}
        setSearch={setSearch}
        cuisine={cuisine}
        setCuisine={setCuisine}
        isOpenOnly={isOpenOnly}
        setIsOpenOnly={setIsOpenOnly}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {loading && <div className="p-8 text-center text-slate-600">Loading restaurants...</div>}
      {error && <div className="p-8 text-center text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {restaurants.map((res) => (
                <div key={res.id} className="border rounded-lg p-5 shadow-sm bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-bold text-slate-800">{res.name}</h2>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${res.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {res.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-1">{res.address}</p>
                    <p className="text-slate-500 text-xs mt-2">Cuisine: {res.cuisineType || 'General'}</p>
                  </div>
                  <Link
                    href={`/restaurants/${res.id}`}
                    className="mt-4 block text-center bg-amber-500 text-slate-900 font-semibold py-2 rounded text-sm hover:bg-amber-600 transition-colors"
                  >
                    View Menu
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No restaurants match your filters.</div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-50 text-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 border rounded disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}