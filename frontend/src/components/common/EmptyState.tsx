'use client';

import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = 'No Data Available',
  description = 'There is nothing to display right now.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-dashed border-gray-300 rounded-xl max-w-lg mx-auto text-center my-6">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold mb-3">
        ?
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}