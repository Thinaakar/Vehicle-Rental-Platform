'use client';

import React, { useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import {
  CUSTOMER_NAV_PERMISSIONS,
  VENDOR_NAV_PERMISSIONS,
  type PortalRole,
} from '@/data/portal-nav-permissions';
import { usePortalNav } from '@/context/PortalNavContext';
import { usePermissions } from '@/hooks/usePermissions';

type PortalNavPermissionsPanelProps = {
  role: PortalRole;
  title: string;
  description: string;
};

function PortalRolePanel({ role, title, description }: PortalNavPermissionsPanelProps) {
  const { getPermissionsForRole, updateRolePermissions } = usePortalNav();
  const { can } = usePermissions();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const items = role === 'vendor' ? VENDOR_NAV_PERMISSIONS : CUSTOMER_NAV_PERMISSIONS;
  const enabled = useMemo(() => new Set(getPermissionsForRole(role)), [getPermissionsForRole, role]);
  const canEdit = can('roles:manage');

  const grouped = useMemo(() => {
    return items.reduce<Record<string, typeof items>>((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {});
  }, [items]);

  const toggle = async (permission: string) => {
    if (!canEdit || saving) return;

    const current = getPermissionsForRole(role);
    const next = enabled.has(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission];

    if (!next.length) {
      setMessage('At least one sidebar item must stay enabled.');
      return;
    }

    setSaving(true);
    setMessage(null);
    const ok = await updateRolePermissions(role, next);
    setSaving(false);
    setMessage(ok ? 'Sidebar access updated.' : 'Could not save changes. Try again.');
  };

  return (
    <div className="rounded-3xl border border-slate-200/50 bg-white p-6 shadow-premium">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="space-y-5">
        {Object.entries(grouped).map(([group, groupItems]) => (
          <div key={group}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{group}</p>
            <div className="space-y-2">
              {groupItems.map((item) => (
                <label
                  key={item.permission}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={enabled.has(item.permission)}
                    disabled={!canEdit || saving}
                    onChange={() => void toggle(item.permission)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!canEdit && (
        <p className="mt-4 text-xs font-medium text-slate-400">Only administrators can edit portal navigation.</p>
      )}
      {message && <p className="mt-4 text-xs font-semibold text-primary">{message}</p>}
    </div>
  );
}

export default function PortalNavPermissionsPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PortalRolePanel
        role="vendor"
        title="Vendor Sidebar Access"
        description="Control which menu items appear in the vendor portal sidebar."
      />
      <PortalRolePanel
        role="customer"
        title="Customer Sidebar Access"
        description="Control which menu items appear in the customer portal sidebar."
      />
    </div>
  );
}
