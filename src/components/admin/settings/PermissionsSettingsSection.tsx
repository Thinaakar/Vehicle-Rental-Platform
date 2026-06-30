'use client';

import React from 'react';
import PortalNavPermissionsPanel from '@/components/admin/PortalNavPermissionsPanel';
import { usePermissions } from '@/hooks/usePermissions';

export default function PermissionsSettingsSection() {
  const { can } = usePermissions();

  if (!can('roles:manage')) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        You do not have permission to manage portal navigation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Control which sidebar items appear in the vendor and customer portals. Changes apply immediately for all users of that role.
      </p>
      <PortalNavPermissionsPanel />
    </div>
  );
}
