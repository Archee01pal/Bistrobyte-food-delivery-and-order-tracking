'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Restaurant } from '@/types/restaurant.types';
import { RestaurantService } from '@/services/restaurant.service';
import { RestaurantFilters } from '@/components/restaurant-filters';
import Link from 'next/link';

// Unsplash high-resolution food photos and theme mapping per Cuisine
const CUISINE_THEMES: Record<
  string,
  { image: string; tagBg: string; tagText: string; label: string }
> = {
  Indian: {
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    tagBg: 'bg-amber-100/90',
    tagText: 'text-amber-900',
    label: 'Indian',
  },
  Italian: {
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    tagBg: 'bg-rose-100/90',
    tagText: 'text-rose-900',
    label: 'Italian',
  },
  Japanese: {
    image:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
    tagBg: 'bg-emerald-100/90',
    tagText: 'text-emerald-900',
    label: 'Japanese',
  },
  Chinese: {
    image:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    tagBg: 'bg-red-100/90',
    tagText: 'text-red-900',
    label: 'Chinese',
  },
  Mexican: {
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
    tagBg: 'bg-teal-100/90',
    tagText: 'text-teal-900',
    label: 'Mexican',
  },
  American: {
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    tagBg: 'bg-orange-100/90',
    tagText: 'text-orange-900',
    label: 'American',
  },
};

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

  // Fallback mock data enriched with delivery details
  const mockRestaurants: any[] = [
    {
      id: 'rest-1',
      name: 'Bistro Byte Central',
      cuisine: 'Mexican',
      cuisineType: 'Mexican',
      address: '742 Evergreen Terrace, Sector 4',
      isOpen: true,
      rating: 4.8,
      deliveryTime: '20–35 min',
      deliveryFee: 'Free Delivery',
    },
    {
      id: 'rest-2',
      name: 'Italiano Pizza & Pasta Hub',
      cuisine: 'Italian',
      cuisineType: 'Italian',
      address: '128 Roma Street, Downtown',
      isOpen: true,
      rating: 4.6,
      deliveryTime: '25–40 min',
      deliveryFee: '$0.99 Delivery',
    },
    {
      id: 'rest-3',
      name: 'Sakura Sushi & Ramen Bar',
      cuisine: 'Japanese',
      cuisineType: 'Japanese',
      address: '88 Cherry Blossom Lane, Midtown',
      isOpen: true,
      rating: 4.9,
      deliveryTime: '15–30 min',
      deliveryFee: 'Free Delivery',
    },
    {
      id: 'rest-4',
      name: 'Golden Dragon Palace',
      cuisine: 'Chinese',
      cuisineType: 'Chinese',
      address: '102 Lantern Way, Chinatown',
      isOpen: true,
      rating: 4.7,
      deliveryTime: '30–45 min',
      deliveryFee: '$1.49 Delivery',
    },
    {
      id: 'rest-5',
      name: 'Spice Junction Curry House',
      cuisine: 'Indian',
      cuisineType: 'Indian',
      address: '89 Taj Avenue, Westend',
      isOpen: true,
      rating: 4.9,
      deliveryTime: '20–35 min',
      deliveryFee: 'Free Delivery',
    },
    {
      id: 'rest-6',
      name: 'The Classic Burger Joint',
      cuisine: 'American',
      cuisineType: 'American',
      address: '500 Main Boulevard',
      isOpen: false,
      rating: 4.4,
      deliveryTime: '30–45 min',
      deliveryFee: '$2.00 Delivery',
    },
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);

    RestaurantService.getAll({
      search,
      cuisine,
      isOpen: isOpenOnly ? true : undefined,
      sortBy: sortBy as 'name' | 'rating',
      page,
      limit: 6,
    })
      .then((res: any) => {
        let fetchedData: any[] = [];
        if (Array.isArray(res) && res.length > 0) {
          fetchedData = res;
          setTotalPages(1);
        } else if (res && Array.isArray(res.data) && res.data.length > 0) {
          fetchedData = res.data;
          setTotalPages(res.totalPages || 1);
        } else {
          fetchedData = mockRestaurants;
          setTotalPages(1);
        }

        const filtered = fetchedData.filter((r) => {
          const rCuisine = r.cuisineType || r.cuisine || '';
          const matchesSearch =
            !search ||
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            rCuisine.toLowerCase().includes(search.toLowerCase()) ||
            r.address.toLowerCase().includes(search.toLowerCase());
          const matchesCuisine =
            !cuisine || rCuisine.toLowerCase() === cuisine.toLowerCase();
          const matchesOpen = !isOpenOnly || r.isOpen;

          return matchesSearch && matchesCuisine && matchesOpen;
        });

        if (sortBy === 'name') {
          filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'rating') {
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setRestaurants(filtered);
      })
      .catch(() => {
        const filteredMock = mockRestaurants.filter((r) => {
          const rCuisine = r.cuisineType || r.cuisine || '';
          const matchesSearch =
            !search ||
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            rCuisine.toLowerCase().includes(search.toLowerCase()) ||
            r.address.toLowerCase().includes(search.toLowerCase());
          const matchesCuisine =
            !cuisine || rCuisine.toLowerCase() === cuisine.toLowerCase();
          const matchesOpen = !isOpenOnly || r.isOpen;

          return matchesSearch && matchesCuisine && matchesOpen;
        });

        if (sortBy === 'name') {
          filteredMock.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'rating') {
          filteredMock.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setRestaurants(filteredMock);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [search, cuisine, isOpenOnly, sortBy, page]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 pb-16">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Banner Section */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-3.5 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 font-bold text-xs tracking-wide"
          >
            ✨ Explore Local Kitchens
          </motion.div>

          <h1 className="text-4xl font-black text-slate-900 tracking-tight font-serif">
            Available Restaurants
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Discover curated dining options and view detailed menus.
          </p>
        </div>

        {/* Filter Controls Container with Amber Border */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-400/80 shadow-md text-slate-800">
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
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center text-amber-700 font-semibold animate-pulse">
            🍲 Loading available restaurants...
          </div>
        )}

        {/* Error State */}
        {error && <div className="p-8 text-center text-rose-500">{error}</div>}

        {/* Content Section */}
        {!loading && !error && (
          <>
            {restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {restaurants.map((res: any, index: number) => {
                  const resCuisine =
                    res.cuisineType || res.cuisine || 'American';
                  const theme =
                    CUISINE_THEMES[resCuisine] || CUISINE_THEMES.American;
                  const deliveryTime = res.deliveryTime || '20–35 min';
                  const deliveryFee = res.deliveryFee || 'Free Delivery';

                  return (
                    <motion.div
                      key={res.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                      className="bg-white border-2 border-amber-300/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-amber-500 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Food Image Header Container with Overlay Badges */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                          <img
                            src={theme.image}
                            alt={res.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />

                          {/* Top Badges: Rating & Open/Closed Status */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-black shadow-md flex items-center gap-1">
                              ★ {res.rating || '4.8'}
                            </span>

                            <span
                              className={`text-xs px-3 py-1 rounded-full font-black shadow-md backdrop-blur-md ${
                                res.isOpen
                                  ? 'bg-emerald-500/90 text-white'
                                  : 'bg-rose-500/90 text-white'
                              }`}
                            >
                              {res.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>

                          {/* Bottom Badges: Delivery Time & Fee */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold shadow-sm flex items-center gap-1">
                              🕒 {deliveryTime}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded-xl backdrop-blur-md text-[11px] font-extrabold shadow-sm ${
                                deliveryFee.includes('Free')
                                  ? 'bg-emerald-100/95 text-emerald-800'
                                  : 'bg-white/95 text-slate-700'
                              }`}
                            >
                              {deliveryFee}
                            </span>
                          </div>
                        </div>

                        {/* Restaurant Details */}
                        <div className="p-5">
                          <h2 className="text-xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                            {res.name}
                          </h2>

                          <p className="text-slate-500 text-xs mt-1 font-medium">
                            {res.address}
                          </p>

                          <div className="flex items-center gap-2 mt-4 text-xs">
                            <span
                              className={`px-3 py-1 rounded-xl font-bold ${theme.tagBg} ${theme.tagText}`}
                            >
                              Cuisine: {resCuisine}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="px-5 pb-5 pt-1">
                        <Link
                          href={`/restaurants/${res.id}`}
                          className="block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm active:scale-95"
                        >
                          View Menu
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                No restaurants match your filters. Try updating your search terms!
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl disabled:opacity-50 text-sm hover:bg-slate-50 transition font-medium"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-600 flex items-center font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-xl disabled:opacity-50 text-sm hover:bg-slate-50 transition font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}