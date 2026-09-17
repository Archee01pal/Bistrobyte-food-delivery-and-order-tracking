'use client';

import React from 'react';
import { CheckCircle2, Clock, Truck, Home } from 'lucide-react';
import { DeliveryStatus } from '@/types/order.types';

const steps: { key: DeliveryStatus; label: string; icon: any }[] = [
  { key: 'ASSIGNED', label: 'Assigned', icon: Clock },
  { key: 'PICKED_UP', label: 'Picked Up', icon: CheckCircle2 },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

export default function OrderTimeline({ currentStatus }: { currentStatus: DeliveryStatus }) {
  const getStepIndex = (status: DeliveryStatus) => {
    switch (status) {
      case 'ASSIGNED': return 0;
      case 'PICKED_UP': return 1;
      case 'IN_TRANSIT': return 2;
      case 'DELIVERED': return 3;
      default: return -1;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center font-semibold">
        This order was cancelled or timed out.
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 -z-0" />
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center bg-white z-10 px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                  isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isDone ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}