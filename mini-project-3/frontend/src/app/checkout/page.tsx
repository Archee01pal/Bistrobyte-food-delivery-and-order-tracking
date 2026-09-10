'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { apiClient } from '@/lib/api-client';

export default function CheckoutPage() {
  const router = useRouter();
  const { items = [], subtotal = 0, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('123 Main St, City');

  // Dynamic fee calculation based on active cart state
  const deliveryFee = items.length > 0 ? 3.99 : 0;
  const discount = items.length > 0 ? 2.00 : 0;
  const totalAmount = subtotal + deliveryFee - discount;

  // Helper function to prevent runtime crashing during string conversion
  const formatPrice = (amount: any) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return num.toFixed(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/orders', {
        deliveryAddress: address,
        paymentMethod: 'CARD',
      });

      const newOrder = res.data;
      if (clearCart) clearCart();

      router.push(`/payment/${newOrder.id || newOrder._id}`);
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          'Failed to place order. Ensure you are logged in and have items in your cart.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-slate-600">
          Add items to your cart before proceeding to checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Checkout</h1>

      {/* Address Block */}
      <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm space-y-3">
        <h2 className="font-semibold text-lg text-slate-800">Delivery Address</h2>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
        />
      </div>

      {/* Dynamic Cart Summary */}
      <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
        <h2 className="font-semibold text-lg mb-3 text-slate-800">Order Items</h2>
        {items.map(
          (
            { menuItem, quantity }: { menuItem: any; quantity: number },
            index: number
          ) => {
            const itemId = menuItem?.id || menuItem?._id || `checkout-item-${index}`;
            const itemPrice = menuItem?.price || 0;

            return (
              <div key={itemId} className="flex justify-between border-b py-2">
                <span className="text-slate-800">
                  {quantity}x {menuItem?.name || 'Item'}
                </span>
                <span className="font-medium text-slate-800">
                  ${formatPrice(itemPrice * quantity)}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Dynamic Payment Summary */}
      <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>${formatPrice(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-${formatPrice(discount)}</span>
        </div>
        <hr />
        <div className="flex justify-between text-xl font-bold text-slate-800">
          <span>Total Amount</span>
          <span>${formatPrice(totalAmount)}</span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
      >
        {loading ? 'Processing Order...' : 'Place Order'}
      </button>
    </div>
  );
}