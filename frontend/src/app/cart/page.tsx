'use client';

import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles, ArrowLeft, Utensils } from 'lucide-react';

export default function CartPage() {
  const { cart, items = [], restaurantName, updateQuantity, removeFromCart, clearCart, subtotal = 0 } = useCart();

  // Flexible array detection to handle flat state or nested cart structures
  const cartItems = items.length > 0 ? items : cart?.items || [];

  // Helper to safely format prices without runtime crashes
  const formatPrice = (amount: any) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return num.toFixed(2);
  };

  // Empty Cart State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-100 shadow-sm text-center space-y-4"
        >
          <div className="w-16 h-16 bg-amber-100/80 rounded-3xl flex items-center justify-center mx-auto text-amber-600">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-serif">Your Cart is Empty</h1>
          <p className="text-xs font-medium text-slate-500 max-w-xs mx-auto">
            Looks like you haven't added anything to your cart yet. Explore nearby kitchens to get started!
          </p>
          <Link
            href="/restaurants"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold px-6 py-3 rounded-2xl text-xs transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Restaurants
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 pb-16">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-black text-slate-900 font-serif tracking-tight">
                Your Cart
              </h1>
              <span className="p-1.5 bg-amber-100/80 rounded-xl text-amber-600">
                <ShoppingBag className="w-5 h-5" />
              </span>
            </div>
            {restaurantName && (
              <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Ordering from: <span className="font-bold text-amber-700">{restaurantName}</span>
              </p>
            )}
          </div>
          
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-1.5 rounded-xl border border-rose-200/80 transition shadow-xs active:scale-95"
          >
            Clear Cart
          </button>
        </div>

        {/* Cart Items Card */}
        <div className="bg-white rounded-3xl border border-amber-100/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {cartItems.map((rawItem: any, index: number) => {
            // Normalizes data access whether item is flat or wrapped inside menuItem
            const item = rawItem.menuItem ? rawItem.menuItem : rawItem;
            const itemId = item?.id || item?._id || rawItem?.menuItemId || `item-${index}`;
            const itemName = item?.name || 'Menu Item';
            const itemPrice = item?.price || 0;
            const quantity = rawItem.quantity || item.quantity || 1;
            const itemImage = item?.image || item?.img || rawItem?.image || rawItem?.img;

            return (
              <motion.div
                key={itemId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ backgroundColor: 'rgba(254, 243, 199, 0.25)' }}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors"
              >
                {/* Left Section: Cartoonized Animated Thumbnail + Item Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative shrink-0">
                    {itemImage ? (
                      <motion.img
                        src={itemImage}
                        alt={itemName}
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          ease: 'easeInOut',
                          delay: index * 0.2,
                        }}
                        whileHover={{ scale: 1.15, rotate: 4 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-md cursor-pointer filter saturate-[1.65] contrast-[1.25] brightness-[1.05] drop-shadow-md"
                      />
                    ) : (
                      <motion.div 
                        animate={{ y: [0, -3, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          ease: 'easeInOut',
                          delay: index * 0.2,
                        }}
                        whileHover={{ scale: 1.1, rotate: 4 }}
                        className="w-20 h-20 rounded-2xl bg-amber-100/80 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-md cursor-pointer"
                      >
                        <Utensils className="w-8 h-8 stroke-[2]" />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-bold text-slate-900 text-base">{itemName}</h3>
                    <p className="text-sm text-amber-600 font-extrabold flex items-center gap-1.5 flex-wrap">
                      ${formatPrice(itemPrice)}
                      <span className="text-xs font-medium text-slate-400">
                        × {quantity} = ${formatPrice(itemPrice * quantity)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Section: Quantity Badges & Remove Button */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Quantity Adjustment Badge */}
                  <div className="flex items-center bg-slate-100/80 rounded-2xl border border-slate-200/80 p-1">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => {
                        if (quantity <= 1) {
                          removeFromCart(itemId);
                        } else {
                          updateQuantity(itemId, quantity - 1);
                        }
                      }}
                      className="w-7 h-7 rounded-xl bg-white shadow-xs text-slate-600 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center font-bold transition"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    </motion.button>

                    <motion.span 
                      key={quantity}
                      initial={{ scale: 1.3, opacity: 0.7 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="w-8 text-center text-xs font-black text-slate-800"
                    >
                      {quantity}
                    </motion.span>

                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => updateQuantity(itemId, quantity + 1)}
                      className="w-7 h-7 rounded-xl bg-white shadow-xs text-slate-600 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center font-bold transition"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5 text-slate-600" />
                    </motion.button>
                  </div>

                  {/* Delete Item Button */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ scale: 1.15, rotate: -5 }}
                    onClick={() => removeFromCart(itemId)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Order Subtotal & Vibrant Checkout Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-6 rounded-3xl border border-amber-100/80 shadow-sm flex flex-col gap-4"
        >
          <div className="flex justify-between items-center text-lg font-black text-slate-900 font-serif border-b border-slate-100 pb-3">
            <span>Subtotal</span>
            <span className="text-amber-600">${formatPrice(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-amber-300/50"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
            Proceed to Checkout
          </Link>
        </motion.div>
      </div>
    </div>
  );
}