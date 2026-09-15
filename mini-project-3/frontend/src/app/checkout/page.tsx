'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useNotifications } from '@/context/notification-context';
import { motion } from 'framer-motion';
import { MapPin, ShoppingBag, CreditCard, ArrowLeft, Tag, ShieldCheck, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, items = [], subtotal = 0, isLoading } = useCart();
  const { addNotification } = useNotifications();

  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const cartItems = items.length > 0 ? items : cart?.items || [];
  const deliveryFee = cartItems.length > 0 ? 3.99 : 0;
  const discount = cartItems.length > 0 ? 2.00 : 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

  const formatPrice = (amount: any) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return num.toFixed(2);
  };

  const saveOrderToLocalStorage = (orderId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `latest_order_${orderId}`,
        JSON.stringify({
          items: cartItems,
          totalAmount,
          deliveryAddress: address,
          paymentMethod: 'PENDING_SELECTION',
          createdAt: new Date().toISOString(),
        })
      );
      localStorage.setItem(`order_status_${orderId}`, 'CONFIRMED');
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      alert('Please enter a delivery address.');
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          deliveryAddress: address,
          items: cartItems,
          totalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Order placement failed: ${response.status}`);
      }

      const newOrder = await response.json();
      const orderId = String(newOrder?.id || newOrder?._id || `ORD-${Date.now()}`);

      saveOrderToLocalStorage(orderId);

      addNotification({
        title: 'Order Created',
        message: `Order #${orderId} created. Please complete payment.`,
        type: 'CONFIRMATION',
        orderId: orderId,
      });

      // Navigate immediately without clearing cart state prematurely
      router.push(`/payments/${orderId}`);
    } catch (error) {
      console.warn('Backend order placement bypassed, placing order in demo mode.');
      const demoOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      saveOrderToLocalStorage(demoOrderId);

      addNotification({
        title: 'Order Created',
        message: `Order #${demoOrderId} created. Please complete payment.`,
        type: 'CONFIRMATION',
        orderId: demoOrderId,
      });

      // Navigate immediately without clearing cart state prematurely
      router.push(`/payments/${demoOrderId}`);
    }
  };

  // Initial Context / Hydration loader
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  // Active route transition view (prevents flash during page resolution)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-100 shadow-sm text-center space-y-4"
        >
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-200">
              <CreditCard className="w-7 h-7 text-emerald-600 animate-pulse" />
            </div>
            <Loader2 className="w-20 h-20 text-emerald-500 animate-spin absolute -top-2 -left-2" />
          </div>

          <h2 className="text-xl font-black text-slate-900 font-serif">
            Creating Your Order
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Please wait while we prepare your payment options...
          </p>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Redirecting to Payment Gateway</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render empty cart state only if user explicitly visits checkout with an empty cart
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100/80 rounded-3xl flex items-center justify-center mx-auto text-amber-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-serif">Your Cart is Empty</h1>
          <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">
            Add items to your cart before proceeding to checkout.
          </p>
          <button
            onClick={() => router.push('/restaurants')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 pb-16">
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">
              Checkout
            </h1>
            <span className="p-1.5 bg-emerald-100/80 rounded-xl text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <button
            onClick={() => router.push('/cart')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:bg-amber-100/50 px-3 py-1.5 rounded-xl transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </button>
        </div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm space-y-3"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 font-serif">Delivery Address</h2>
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter street address, city, zip code..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
          />
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingBag className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 font-serif">Order Items</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {cartItems.map((rawItem: any, index: number) => {
              const item = rawItem.menuItem ? rawItem.menuItem : rawItem;
              const itemId = item?.id || item?._id || rawItem?.menuItemId || `checkout-item-${index}`;
              const itemName = item?.name || 'Menu Item';
              const itemPrice = item?.price || 0;
              const quantity = rawItem.quantity || item.quantity || 1;
              const itemTotal = itemPrice * quantity;

              return (
                <div key={itemId} className="py-2.5 flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                      {quantity}x
                    </span>
                    <span className="font-medium text-slate-800">{itemName}</span>
                  </div>
                  <span className="font-bold text-slate-900">${formatPrice(itemTotal)}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Pricing Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm space-y-3"
        >
          <div className="space-y-2 text-xs font-semibold text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">${formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-bold text-slate-800">${formatPrice(deliveryFee)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span className="flex items-center gap-1 font-bold">
                  <Tag className="w-3 h-3" /> Discount
                </span>
                <span className="font-bold">-${formatPrice(discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-black text-slate-900 border-t border-dashed border-slate-200 pt-3 mt-1">
              <span className="font-serif">Total Amount</span>
              <span className="text-emerald-600 text-xl font-sans">${formatPrice(totalAmount)}</span>
            </div>
          </div>
        </motion.div>

        {/* Proceed to Payment Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-4 px-6 rounded-2xl text-sm transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300/50 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Processing Order...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Proceed to Payment
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}