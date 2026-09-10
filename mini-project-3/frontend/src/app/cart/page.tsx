'use client';

import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items = [], restaurantName, updateQuantity, removeFromCart, clearCart, subtotal = 0 } = useCart();

  // Helper to safely format prices without runtime crashes
  const formatPrice = (amount: any) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return num.toFixed(2);
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h1>
        <p className="text-slate-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          href="/restaurants"
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-6 py-2.5 rounded transition-colors inline-block"
        >
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Cart</h1>
          {restaurantName && (
            <p className="text-sm text-slate-500">
              Ordering from: <span className="font-semibold text-slate-700">{restaurantName}</span>
            </p>
          )}
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm divide-y mb-6">
        {items.map(({ menuItem, quantity }: { menuItem: any; quantity: number }, index: number) => {
          const itemId = menuItem?.id || menuItem?._id || `item-${index}`;

          return (
            <div key={itemId} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">{menuItem?.name || 'Item'}</h3>
                <p className="text-sm text-amber-600 font-medium">${formatPrice(menuItem?.price)}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => {
                      if (quantity <= 1) {
                        removeFromCart(itemId);
                      } else {
                        updateQuantity(itemId, quantity - 1);
                      }
                    }}
                    className="p-1 hover:bg-slate-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>

                  <span className="px-3 text-sm font-semibold text-slate-800">{quantity}</span>

                  <button
                    onClick={() => updateQuantity(itemId, quantity + 1)}
                    className="p-1 hover:bg-slate-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(itemId)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col gap-4">
        <div className="flex justify-between text-lg font-bold text-slate-800">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 text-center rounded transition-colors inline-block"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}