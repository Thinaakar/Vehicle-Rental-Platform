'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';
import AppSidebar, { SidebarGroup } from '@/components/shell/AppSidebar';
import { AuthUser } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type DashboardLayoutProps = {
  portalLabel: string;
  title: string;
  subtitle?: string;
  accentClass?: string;
  groups: SidebarGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  user: AuthUser;
  onLogout: () => void;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
};

export default function DashboardLayout({
  portalLabel,
  title,
  subtitle,
  accentClass,
  groups,
  activeId,
  onSelect,
  user,
  onLogout,
  children,
  headerActions,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB] text-slate-900">
      <AppSidebar
        portalLabel={portalLabel}
        accentClass={accentClass}
        groups={groups}
        activeId={activeId}
        onSelect={onSelect}
        user={user}
        onLogout={onLogout}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 shrink-0 border-b border-slate-200/80 bg-white/80 px-8 py-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{portalLabel}</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="button"
                className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:text-slate-900"
              >
                <Bell className="h-4 w-4" />
              </button>
              {headerActions}
            </div>
          </div>
        </header>

        <main className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 py-8')}>{children}</main>
      </div>
    </div>
  );
}
