'use client';

import React, { useState } from 'react';
import SettingsTabBar, { type SettingsTab } from '@/components/admin/settings/SettingsTabBar';
import UsersSettingsSection from '@/components/admin/settings/UsersSettingsSection';
import RolesSettingsSection from '@/components/admin/settings/RolesSettingsSection';
import PermissionsSettingsSection from '@/components/admin/settings/PermissionsSettingsSection';
import GeneralSettingsSection from '@/components/admin/settings/GeneralSettingsSection';
import MasterDataSection from '@/components/admin/settings/MasterDataSection';

type AdminSettingsHubProps = {
  onResetDemo: () => void;
};

export default function AdminSettingsHub({ onResetDemo }: AdminSettingsHubProps) {
  const [tab, setTab] = useState<SettingsTab>('users');

  return (
    <div className="space-y-6">
      <SettingsTabBar active={tab} onChange={setTab} />

      <div className="rounded-3xl border border-slate-200/50 bg-white p-6 shadow-premium">
        {tab === 'users' && <UsersSettingsSection />}
        {tab === 'roles' && <RolesSettingsSection />}
        {tab === 'permissions' && <PermissionsSettingsSection />}
        {tab === 'general' && <GeneralSettingsSection onResetDemo={onResetDemo} />}
        {tab === 'master' && <MasterDataSection />}
      </div>
    </div>
  );
}
