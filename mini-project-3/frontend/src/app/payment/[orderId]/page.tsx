'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { processPaymentApi } from '@/lib/api-client';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimulatePayment = async (shouldFail: boolean) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await processPaymentApi({ orderId, paymentMethod: 'CARD', shouldFail });
      router.push(`/orders/${orderId}`);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-xl bg-white shadow-md text-center">
      <h1 className="text-2xl font-bold mb-2">Simulate Payment</h1>
      <p className="text-gray-500 mb-6">Order ID: <span className="font-mono text-black">{orderId}</span></p>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => handleSimulatePayment(false)}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          {loading ? 'Processing...' : 'Pay Successfully'}
        </button>

        <button
          onClick={() => handleSimulatePayment(true)}
          disabled={loading}
          className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200 transition"
        >
          Simulate Payment Failure
        </button>
      </div>
    </div>
  );
}