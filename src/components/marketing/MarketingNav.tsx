'use client';

import React from 'react';
import { Car } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { usePlatform } from '@/context/PlatformContext';
import { ROLE_LABELS } from '@/data/roles-permissions';
import { cn } from '@/lib/utils';

type MarketingNavProps = {
  active?: 'home' | 'vehicles' | 'pricing' | 'about' | 'contact';
};

const NAV_LINKS = [
  { id: 'home', label: 'Home', href: '#top' },
  { id: 'vehicles', label: 'Vehicles', href: '#vehicles' },
  { id: 'pricing', label: 'Pricing', href: '#pricing' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

export default function MarketingNav({ active = 'home' }: MarketingNavProps) {
  const { openLogin, openBooking, openDashboard } = usePlatform();
  const { isAuthenticated, user } = useAuth();

  const canBook = !user || user.role === 'customer';

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-primary text-white shadow-lg shadow-primary/20">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <BrandLogo />
            <span className="-mt-0.5 block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Premium Rentals
            </span>
          </div>
        </a>

        <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={cn(
                'transition-colors hover:text-slate-900',
                active === link.id && 'text-slate-900',
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <button
              type="button"
              onClick={openDashboard}
              className="hidden rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-900 sm:inline-flex"
            >
              {ROLE_LABELS[user.role]} Portal
            </button>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="hidden rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-900 sm:inline-flex"
            >
              Sign In
            </button>
          )}
          {canBook && (
            <button
              type="button"
              onClick={openBooking}
              className="rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:brightness-105"
            >
              Rent Now
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
