'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type SettingsTab = 'users' | 'roles' | 'permissions' | 'general' | 'master';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'general', label: 'General' },
  { id: 'master', label: 'Master Data' },
];

type SettingsTabBarProps = {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
};

export default function SettingsTabBar({ active, onChange }: SettingsTabBarProps) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition',
            active === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
