'use client';

import React from 'react';

export default function ErrorState({
  message = 'Failed to load data. Please try again.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 border border-red-200 bg-red-50 rounded-xl max-w-md mx-auto my-6 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold mb-3">
        !
      </div>
      <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
      <p className="text-sm text-red-600 mt-1 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}