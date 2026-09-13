'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RestaurantService } from '@/services/restaurant.service';
import { useCart } from '@/context/cart-context';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Star, Clock, MapPin, Check } from 'lucide-react';

// Define explicit interfaces to fix all TypeScript red squigglies
interface Tag {
  label: string;
  bg: string;
  text: string;
}

interface MenuItem {
  id: string;
  name: string;
  desc?: string;
  description?: string;
  price: number;
  image?: string;
  tags?: Tag[];
}

interface RestaurantData {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  hours?: string;
  isOpen: boolean;
  rating?: number;
  categories: Record<string, MenuItem[]>;
}

const CUISINE_EMOJIS: Record<string, string> = {
  Indian: '🍛',
  Italian: '🍕',
  Japanese: '🍣',
  Chinese: '🥢',
  Mexican: '🌮',
  American: '🍔',
};

const ITEM_FALLBACK_IMAGES: Record<string, string> = {
  'Street Tacos Trio': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80',
  'Crispy Fish Taco': 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?auto=format&fit=crop&w=500&q=80',
  'Loaded Beef Burrito': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80',
  'Margherita Supreme': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
  'Pepperoni Overload': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80',
  'Truffle Mushroom Fettuccine': 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80',
  'Dragon Roll': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
  'Tonkotsu Pork Ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80',
  'Steamed Pork Dumplings': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
  'Kung Pao Chicken': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=500&q=80',
  'Butter Chicken': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=500&q=80',
  'Paneer Tikka Masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
  'Double Smash Cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
};

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80';

const MOCK_RESTAURANTS_MAP: Record<string, RestaurantData> = {
  'rest-1': {
    id: 'rest-1',
    name: 'Bistro Byte Central',
    cuisine: 'Mexican',
    address: '742 Evergreen Terrace, Sector 4',
    hours: '10:00 AM - 10:00 PM',
    isOpen: true,
    rating: 4.8,
    categories: {
      Tacos: [
        {
          id: 'm1',
          name: 'Street Tacos Trio',
          desc: 'Three authentic corn tortilla tacos with spicy salsa.',
          price: 12.99,
          image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80',
          tags: [
            { label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' },
            { label: '🌶️ Spicy', bg: 'bg-rose-100', text: 'text-rose-700' },
          ],
        },
        {
          id: 'm2',
          name: 'Crispy Fish Taco',
          desc: 'Battered fish with chipotle mayo and red cabbage slaw.',
          price: 14.50,
          image: 'https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '🌊 Fresh Catch', bg: 'bg-sky-100', text: 'text-sky-800' }],
        },
      ],
      Burritos: [
        {
          id: 'm3',
          name: 'Loaded Beef Burrito',
          desc: 'Rice, beans, seasoned beef, and guacamole wrapped in a flour tortilla.',
          price: 15.99,
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' }],
        },
      ],
    },
  },
  'rest-2': {
    id: 'rest-2',
    name: 'Italiano Pizza & Pasta Hub',
    cuisine: 'Italian',
    address: '128 Roma Street, Downtown',
    hours: '11:00 AM - 11:00 PM',
    isOpen: true,
    rating: 4.6,
    categories: {
      Pizza: [
        {
          id: 'm4',
          name: 'Margherita Supreme',
          desc: 'Fresh mozzarella, basil leaves, and San Marzano tomato sauce.',
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '🌱 Vegetarian', bg: 'bg-emerald-100', text: 'text-emerald-800' }],
        },
        {
          id: 'm5',
          name: 'Pepperoni Overload',
          desc: 'Double pepperoni with melted provolone and oregano.',
          price: 18.50,
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' }],
        },
      ],
      Pasta: [
        {
          id: 'm6',
          name: 'Truffle Mushroom Fettuccine',
          desc: 'Handmade pasta tossed in rich wild mushroom cream sauce.',
          price: 19.99,
          image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '🌱 Vegetarian', bg: 'bg-emerald-100', text: 'text-emerald-800' }],
        },
      ],
    },
  },
  'rest-3': {
    id: 'rest-3',
    name: 'Sakura Sushi & Ramen Bar',
    cuisine: 'Japanese',
    address: '88 Cherry Blossom Lane, Midtown',
    hours: '12:00 PM - 10:00 PM',
    isOpen: true,
    rating: 4.9,
    categories: {
      Sushi: [
        {
          id: 'm7',
          name: 'Dragon Roll',
          desc: 'Eel, cucumber, topped with sliced avocado and sweet unagi sauce.',
          price: 17.50,
          image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' }],
        },
      ],
      Ramen: [
        {
          id: 'm8',
          name: 'Tonkotsu Pork Ramen',
          desc: 'Rich pork broth with chashu pork, bamboo shoots, and soft egg.',
          price: 16.00,
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '🌶️ Spicy', bg: 'bg-rose-100', text: 'text-rose-700' }],
        },
      ],
    },
  },
  'rest-4': {
    id: 'rest-4',
    name: 'Golden Dragon Palace',
    cuisine: 'Chinese',
    address: '102 Lantern Way, Chinatown',
    hours: '11:00 AM - 10:30 PM',
    isOpen: true,
    rating: 4.7,
    categories: {
      'Dim Sum': [
        {
          id: 'm9',
          name: 'Steamed Pork Dumplings',
          desc: 'Traditional soup dumplings filled with savory pork and broth.',
          price: 13.99,
          image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' }],
        },
      ],
      Mains: [
        {
          id: 'm10',
          name: 'Kung Pao Chicken',
          desc: 'Diced chicken wok-tossed with peanuts, chili peppers, and scallions.',
          price: 15.50,
          image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '🌶️ Spicy', bg: 'bg-rose-100', text: 'text-rose-700' }],
        },
      ],
    },
  },
  'rest-5': {
    id: 'rest-5',
    name: 'Spice Junction Curry House',
    cuisine: 'Indian',
    address: '89 Taj Avenue, Westend',
    hours: '12:00 PM - 10:00 PM',
    isOpen: true,
    rating: 4.9,
    categories: {
      Curries: [
        {
          id: 'm11',
          name: 'Butter Chicken',
          desc: 'Tender chicken cooked in a rich, creamy tomato butter gravy.',
          price: 16.99,
          image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' }],
        },
        {
          id: 'm12',
          name: 'Paneer Tikka Masala',
          desc: 'Grilled cottage cheese cubes simmered in a spiced tomato gravy.',
          price: 15.50,
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '🌱 Vegetarian', bg: 'bg-emerald-100', text: 'text-emerald-800' }],
        },
      ],
    },
  },
  'rest-6': {
    id: 'rest-6',
    name: 'The Classic Burger Joint',
    cuisine: 'American',
    address: '500 Main Boulevard',
    hours: '11:00 AM - 9:00 PM',
    isOpen: false,
    rating: 4.5,
    categories: {
      Burgers: [
        {
          id: 'm13',
          name: 'Double Smash Cheeseburger',
          desc: 'Two smashed beef patties, crispy bacon, cheddar, and house sauce.',
          price: 14.99,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
          tags: [{ label: '⭐ Bestseller', bg: 'bg-amber-100', text: 'text-amber-800' }],
        },
      ],
    },
  },
};

export default function RestaurantDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { addToCart } = useCart();

  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    RestaurantService.getById(id)
      .then((data: any) => {
        if (data && data.name && data.categories && Object.keys(data.categories).length > 0) {
          setRestaurant(data as RestaurantData);
        } else if (data && data.name) {
          const mockMatch =
            MOCK_RESTAURANTS_MAP[id] ||
            Object.values(MOCK_RESTAURANTS_MAP).find((r) => r.cuisine === data.cuisine) ||
            MOCK_RESTAURANTS_MAP['rest-1'];

          setRestaurant({ ...data, categories: mockMatch.categories } as RestaurantData);
        } else {
          setRestaurant(MOCK_RESTAURANTS_MAP[id] || MOCK_RESTAURANTS_MAP['rest-1']);
        }
      })
      .catch(() => {
        setRestaurant(MOCK_RESTAURANTS_MAP[id] || MOCK_RESTAURANTS_MAP['rest-1']);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart({
      id: item.id || item.name,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.name,
    });

    setAddedItemId(item.id || item.name);
    setTimeout(() => setAddedItemId(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center text-amber-700 font-semibold animate-pulse">
        🍲 Loading restaurant menu...
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] p-8 text-center text-rose-500">
        <p>Failed to load restaurant details.</p>
        <Link href="/restaurants" className="mt-4 inline-block text-amber-600 underline">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const emoji = CUISINE_EMOJIS[restaurant.cuisine] || '🍽️';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 pb-16">
      <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </Link>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-3 bg-amber-50 rounded-2xl border border-amber-200/60 shadow-inner">
                {emoji}
              </span>
              <div>
                <h1 className="text-3xl font-black text-slate-900 font-serif">
                  {restaurant.name}
                </h1>
                <span className="inline-block mt-1 text-xs px-3 py-0.5 rounded-full font-bold bg-amber-100/80 text-amber-900 border border-amber-200">
                  {restaurant.cuisine} Cuisine
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-500" /> {restaurant.address}
              </span>
              {restaurant.hours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" /> {restaurant.hours}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            {restaurant.rating && (
              <div className="flex items-center gap-1 bg-amber-50 px-3.5 py-2 rounded-2xl border border-amber-200 text-amber-700 font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                {restaurant.rating}
              </div>
            )}
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                restaurant.isOpen
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {restaurant.isOpen ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>

        {restaurant.categories && Object.keys(restaurant.categories).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(restaurant.categories).map(([category, items]: [string, MenuItem[]]) => (
              <div key={category} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 border-b border-amber-200/60 pb-2">
                  {category}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item: MenuItem) => {
                    const isJustAdded = addedItemId === (item.id || item.name);
                    const itemImage =
                      item.image ||
                      ITEM_FALLBACK_IMAGES[item.name] ||
                      DEFAULT_FOOD_IMAGE;

                    return (
                      <motion.div
                        key={item.id || item.name}
                        whileHover={{ y: -3 }}
                        className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex gap-4 transition-all hover:shadow-md group"
                      >
                        <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={itemImage}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex flex-col justify-between flex-1">
                          <div>
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-1.5">
                                {item.tags.map((tag: Tag, idx: number) => (
                                  <span
                                    key={idx}
                                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${tag.bg} ${tag.text}`}
                                  >
                                    {tag.label}
                                  </span>
                                ))}
                              </div>
                            )}

                            <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-slate-500 text-xs leading-relaxed mt-0.5 line-clamp-2">
                              {item.desc || item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                            <span className="text-amber-600 font-black text-sm">
                              ${Number(item.price).toFixed(2)}
                            </span>

                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={!restaurant.isOpen}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                isJustAdded
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 active:scale-95 disabled:opacity-50'
                              }`}
                            >
                              {isJustAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No menu items available for this restaurant right now.
          </div>
        )}
      </div>
    </div>
  );
}