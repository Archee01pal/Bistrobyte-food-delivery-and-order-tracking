'use client';

import { Search } from 'lucide-react';

interface FiltersProps {
  search: string;
  setSearch: (val: string) => void;
  cuisine: string;
  setCuisine: (val: string) => void;
  isOpenOnly: boolean;
  setIsOpenOnly: (val: boolean) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

const CUISINES = ['All', 'Italian', 'Chinese', 'Indian', 'American', 'Mexican', 'Japanese'];

export function RestaurantFilters({
  search,
  setSearch,
  cuisine,
  setCuisine,
  isOpenOnly,
  setIsOpenOnly,
  sortBy,
  setSortBy,
}: FiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search name or location..."
          className="w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white outline-none"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        >
          {CUISINES.map((c) => (
            <option key={c} value={c === 'All' ? '' : c}>
              {c === 'All' ? 'All Cuisines' : c}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md px-3 py-2 text-sm bg-white outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isOpenOnly}
            onChange={(e) => setIsOpenOnly(e.target.checked)}
            className="rounded text-amber-500 focus:ring-amber-500"
          />
          Open Now
        </label>
      </div>
    </div>
  );
}