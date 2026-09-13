'use client';

import React from 'react';

export default function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full min-h-[200px]">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-sm text-gray-600 font-medium">{label}</p>
    </div>
  );
}