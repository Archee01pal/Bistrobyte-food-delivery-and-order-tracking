'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { processPaymentApi } from '@/lib/api-client';
import { useCart } from '@/context/cart-context';
import { motion } from 'framer-motion';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Store,
  Receipt,
} from 'lucide-react';

type PaymentMethod = 'CARD' | 'UPI' | 'COD';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface StoredOrder {
  id: string;
  orderNumber?: string;
  restaurantName?: string;
  customerName?: string;
  deliveryAddress?: string;
  totalAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: string;
  items?: OrderItem[];
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;
  const { clearCart } = useCart();

  const [isHydrated, setIsHydrated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<StoredOrder | null>(null);

  // Safely clear cart upon entering payment screen & hydrate order details
  useEffect(() => {
    setIsHydrated(true);

    if (clearCart) {
      clearCart();
    }

    if (typeof window !== 'undefined' && orderId) {
      const storedOrder = localStorage.getItem(`latest_order_${orderId}`);
      if (storedOrder) {
        try {
          const parsed: StoredOrder = JSON.parse(storedOrder);
          setOrderDetails(parsed);
        } catch (e) {
          console.error('Failed to parse local order details:', e);
        }
      }
    }
  }, [orderId, clearCart]);

  const handleConfirmPayment = async (shouldFail: boolean = false) => {
    setLoading(true);
    setErrorMsg(null);

    // Update local storage order status
    if (typeof window !== 'undefined' && orderId) {
      const storedOrder = localStorage.getItem(`latest_order_${orderId}`);
      if (storedOrder) {
        try {
          const parsed = JSON.parse(storedOrder);
          parsed.paymentMethod = paymentMethod;
          parsed.paymentStatus =
            paymentMethod === 'COD'
              ? 'PENDING'
              : shouldFail
              ? 'FAILED'
              : 'SUCCESSFUL';
          localStorage.setItem(`latest_order_${orderId}`, JSON.stringify(parsed));
          localStorage.setItem(`order_status_${orderId}`, parsed.paymentStatus);
        } catch (e) {
          console.error('Failed to update local storage order details:', e);
        }
      }
    }

    try {
      await processPaymentApi({ orderId, paymentMethod, shouldFail });

      if (!shouldFail && typeof window !== 'undefined') {
        localStorage.removeItem('latest_cart');
      }

      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      if (shouldFail) {
        setErrorMsg(
          err?.response?.data?.message || 'Payment simulation failed. Please try again.'
        );
        setLoading(false);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('latest_cart');
        }
        router.push(`/orders/${orderId}`);
      }
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading payment options...</p>
        </div>
      </div>
    );
  }

  // Processing view during active payment API calls
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-100/80 shadow-sm text-center space-y-4"
        >
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200">
              <CreditCard className="w-7 h-7 text-amber-600 animate-pulse" />
            </div>
            <Loader2 className="w-20 h-20 text-amber-500 animate-spin absolute -top-2 -left-2" />
          </div>

          <h2 className="text-xl font-black text-slate-900 font-serif">
            Directing to Payment Gateway
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Securing transaction for Order ID{' '}
            <span className="font-mono font-bold text-slate-800">{orderId}</span>...
          </p>

          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 py-2 px-4 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted 256-Bit Secure Payment</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-800 flex items-center justify-center p-4 pb-16">
      <div className="max-w-md w-full space-y-4">
        {/* Navigation Back Link */}
        <button
          onClick={() => router.push('/checkout')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-700 transition px-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Checkout
        </button>

        {/* Payment Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-100/80 shadow-sm space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 bg-emerald-100/80 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-serif">
              Complete Payment
            </h1>
            <p className="text-xs font-medium text-slate-500">
              Order ID:{' '}
              <span className="font-mono font-bold text-slate-900">{orderId}</span>
            </p>
          </div>

          {/* Restaurant & Order Summary Box */}
          {orderDetails && (
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  {orderDetails.restaurantName || 'Restaurant'}
                </span>
                <span className="flex items-center gap-1 text-slate-900 font-extrabold text-sm font-sans">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  ${Number(orderDetails.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              {orderDetails.items && orderDetails.items.length > 0 && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 font-medium">
                  {orderDetails.items.map((rawItem: any, index: number) => {
                    const item = rawItem.menuItem ? rawItem.menuItem : rawItem;
                    const itemName = item?.name || 'Item';
                    const itemPrice = item?.price || 0;
                    const quantity = rawItem.quantity || item.quantity || 1;

                    return (
                      <div key={item.id || index} className="flex justify-between py-0.5">
                        <span>
                          {quantity}x {itemName}
                        </span>
                        <span>${(itemPrice * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Payment Options Selection */}
          <div className="space-y-3">
            {/* Card Option */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod('CARD')}
              className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3.5 transition-all duration-200 ${
                paymentMethod === 'CARD'
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-xs">Credit / Debit Card</p>
                <p className="text-[11px] font-medium text-slate-500">
                  Pay using Visa or Mastercard
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  paymentMethod === 'CARD'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {paymentMethod === 'CARD' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </motion.div>

            {/* UPI Option */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod('UPI')}
              className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3.5 transition-all duration-200 ${
                paymentMethod === 'UPI'
                  ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100/70 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-xs">UPI Payment</p>
                <p className="text-[11px] font-medium text-slate-500">
                  Google Pay, PhonePe, Paytm
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  paymentMethod === 'UPI'
                    ? 'border-purple-600 bg-purple-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {paymentMethod === 'UPI' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </motion.div>

            {/* Cash on Delivery Option */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 border rounded-2xl cursor-pointer flex items-center gap-3.5 transition-all duration-200 ${
                paymentMethod === 'COD'
                  ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/60 hover:border-slate-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100/70 flex items-center justify-center shrink-0">
                <Banknote className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-xs">Cash on Delivery (COD)</p>
                <p className="text-[11px] font-medium text-slate-500">
                  Pay cash upon item delivery
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                  paymentMethod === 'COD'
                    ? 'border-amber-600 bg-amber-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {paymentMethod === 'COD' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConfirmPayment(false)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-3.5 px-6 rounded-2xl text-xs transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300/50 disabled:opacity-50 cursor-pointer"
            >
              {paymentMethod === 'COD'
                ? 'Confirm Order (Pay Cash on Delivery)'
                : `Pay Successfully with ${paymentMethod}`}
            </motion.button>

            {paymentMethod !== 'COD' && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleConfirmPayment(true)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-3 px-6 rounded-2xl text-xs transition border border-rose-200/80 disabled:opacity-50 cursor-pointer"
              >
                Simulate Payment Failure
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}