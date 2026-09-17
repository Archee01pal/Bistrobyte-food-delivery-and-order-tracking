'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth, type UserRole } from '@/context/auth-context';
import { ChevronDown, User, Store, Truck, ShieldCheck, Check } from 'lucide-react';

const ROLES_CONFIG: Record<
  UserRole,
  { label: string; icon: any; color: string; bg: string; border: string }
> = {
  CUSTOMER: {
    label: 'Customer View',
    icon: User,
    color: 'text-amber-600',
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    border: 'border-amber-200',
  },
  RESTAURANT_MANAGER: {
    label: 'Manager View',
    icon: Store,
    color: 'text-orange-600',
    bg: 'bg-orange-50 hover:bg-orange-100/80',
    border: 'border-orange-200',
  },
  DRIVER: {
    label: 'Driver View',
    icon: Truck,
    color: 'text-blue-600',
    bg: 'bg-blue-50 hover:bg-blue-100/80',
    border: 'border-blue-200',
  },
  SYSTEM_ADMIN: {
    label: 'Admin View',
    icon: ShieldCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50 hover:bg-purple-100/80',
    border: 'border-purple-200',
  },
};

export default function RoleSelector() {
  const { role, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeRole = role && ROLES_CONFIG[role] ? role : 'CUSTOMER';
  const currentConfig = ROLES_CONFIG[activeRole];
  const IconComponent = currentConfig.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs font-black transition-all duration-200 shadow-2xs ${currentConfig.bg} ${currentConfig.border} ${currentConfig.color} cursor-pointer active:scale-95`}
      >
        <IconComponent className="w-4 h-4 stroke-[2.5]" />
        <span className="hidden sm:inline">{currentConfig.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Switch View
          </div>
          <div className="p-1">
            {(Object.keys(ROLES_CONFIG) as UserRole[]).map((r) => {
              const item = ROLES_CONFIG[r];
              const ItemIcon = item.icon;
              const isSelected = role === r;

              return (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? `${item.bg} ${item.color}`
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ItemIcon className={`w-4 h-4 ${item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}