'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { AuthUser } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export type SidebarItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  hint?: string;
};

export type SidebarGroup = {
  id: string;
  label: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
};

type AppSidebarProps = {
  portalLabel: string;
  accentClass?: string;
  groups: SidebarGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  user: AuthUser;
  onLogout: () => void;
};

export default function AppSidebar({
  portalLabel,
  accentClass = 'from-primary to-secondary',
  groups,
  activeId,
  onSelect,
  user,
  onLogout,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, g.defaultOpen !== false])),
  );

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={cn(
        'relative flex h-screen shrink-0 flex-col border-r border-white/10 bg-gradient-to-b from-[#0B1220] via-[#0F172A] to-[#111827] text-slate-300 transition-all duration-300',
        collapsed ? 'w-[84px]' : 'w-[280px]',
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.12),transparent_40%)]" />

      <div
        className={cn(
          'relative z-10 flex shrink-0 items-center border-b border-white/10 px-5 py-5',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <div className="min-w-0">
            <BrandLogo variant="light" size="sm" />
            <span className="mt-0.5 block truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {portalLabel}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="scroll-area relative z-10 min-h-0 flex-1 px-3 py-4">
        {groups.map((group) => {
          const isOpen = openGroups[group.id] ?? true;
          return (
            <div key={group.id} className="mb-5">
              {!collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="mb-2 flex w-full items-center justify-between px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-300"
                >
                  <span>{group.label}</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', isOpen && 'rotate-180')} />
                </button>
              )}

              <div className={cn('space-y-1', !isOpen && !collapsed && 'hidden')}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200',
                        active
                          ? 'bg-white/10 text-white shadow-[inset_3px_0_0_0_#38bdf8]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white',
                        collapsed && 'justify-center px-2',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all',
                          active
                            ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-300'
                            : 'border-white/5 bg-white/5 text-slate-400 group-hover:border-white/10 group-hover:text-white',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      {!collapsed && (
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{item.label}</span>
                          {item.hint && (
                            <span className="block truncate text-[11px] font-medium text-slate-500 group-hover:text-slate-400">
                              {item.hint}
                            </span>
                          )}
                        </span>
                      )}
                      {!collapsed && item.badge !== undefined && (
                        <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 shrink-0 border-t border-white/10 p-4">
        <div className={cn('flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3', collapsed && 'justify-center')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-bold text-white ring-2 ring-white/10">
            {user.avatar ?? user.name.slice(0, 2).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-[11px] capitalize text-slate-500">{user.role} account</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
