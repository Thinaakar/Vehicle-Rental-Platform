'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Shield, Trash2 } from 'lucide-react';
import {
  PERMISSION_LABELS,
  ROLE_LABELS,
  ROLE_PORTALS,
  type Permission,
} from '@/data/roles-permissions';
import { allAssignablePermissions } from '@/data/platform-roles';
import type { PlatformRoleDefinition } from '@/data/platform-roles';
import type { AuthRole } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api/client';
import { readStoredCustomRoles, writeStoredCustomRoles } from '@/lib/demo-storage';
import SettingsFormPanel, { SettingsField, SettingsInput, SettingsSelect } from '@/components/admin/settings/SettingsFormPanel';
import { cn } from '@/lib/utils';

const PORTAL_OPTIONS = [
  { value: 'admin', label: 'Admin Portal' },
  { value: 'vendor', label: 'Vendor Portal' },
  { value: 'customer', label: 'Customer Portal' },
];

const ROLE_ACCENTS: Record<AuthRole, string> = {
  admin: 'border-violet-200 bg-violet-50/50',
  vendor: 'border-sky-200 bg-sky-50/50',
  customer: 'border-emerald-200 bg-emerald-50/50',
};

function mergeRoles(apiRoles: PlatformRoleDefinition[]) {
  const stored = readStoredCustomRoles();
  const byId = new Map<string, PlatformRoleDefinition>();
  for (const role of apiRoles) byId.set(role.id, role);
  for (const role of stored) byId.set(role.id, role);
  return Array.from(byId.values());
}

export default function RolesSettingsSection() {
  const { can } = usePermissions();
  const [roles, setRoles] = useState<PlatformRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '',
    description: '',
    portal: 'customer' as AuthRole,
    permissions: ['booking:view_own'] as Permission[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    const result = await apiClient.get<PlatformRoleDefinition[]>('/api/roles/platform');
    if (result.ok) {
      setRoles(mergeRoles(result.data));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const togglePermission = (permission: Permission) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  };

  const handleCreate = async () => {
    setFormError(null);
    if (!form.label.trim()) return setFormError('Role name is required');
    if (!form.permissions.length) return setFormError('Select at least one permission');

    setSaving(true);
    const result = await apiClient.post<PlatformRoleDefinition>('/api/roles/platform', form);
    if (!result.ok) {
      setFormError(result.error || 'Failed to create role');
      setSaving(false);
      return;
    }

    const next = mergeRoles([...roles, result.data]);
    setRoles(next);
    writeStoredCustomRoles(next.filter((role) => !role.isSystem));
    setForm({
      label: '',
      description: '',
      portal: 'customer',
      permissions: ['booking:view_own'],
    });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (role: PlatformRoleDefinition) => {
    if (role.isSystem) return;
    if (!window.confirm(`Delete role "${role.label}"?`)) return;

    const result = await apiClient.delete<{ ok: boolean }>(`/api/roles/platform?id=${encodeURIComponent(role.id)}`);
    if (!result.ok) return;

    const next = roles.filter((item) => item.id !== role.id);
    setRoles(next);
    writeStoredCustomRoles(next.filter((item) => !item.isSystem));
  };

  if (!can('roles:manage') && !can('users:view_all')) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        You do not have permission to view roles.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          System roles are built-in. Create custom roles for specialized access templates.
        </p>
        {can('roles:manage') && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        )}
      </div>

      <SettingsFormPanel
        open={showForm}
        title="Create Role"
        subtitle="Define permissions for a new role template"
        submitLabel="Save Role"
        error={formError}
        saving={saving}
        onClose={() => setShowForm(false)}
        onSubmit={() => void handleCreate()}
      >
        <SettingsField label="Role Name" required>
          <SettingsInput
            value={form.label}
            onChange={(label) => setForm((f) => ({ ...f, label }))}
            placeholder="Fleet Coordinator"
          />
        </SettingsField>
        <SettingsField label="Description">
          <SettingsInput
            value={form.description}
            onChange={(description) => setForm((f) => ({ ...f, description }))}
            placeholder="What this role is for"
          />
        </SettingsField>
        <SettingsField label="Portal" required>
          <SettingsSelect
            value={form.portal}
            onChange={(portal) => setForm((f) => ({ ...f, portal: portal as AuthRole }))}
            options={PORTAL_OPTIONS}
          />
        </SettingsField>
        <SettingsField label="Permissions" required>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {allAssignablePermissions().map((permission) => (
              <label key={permission} className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.permissions.includes(permission)}
                  onChange={() => togglePermission(permission)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                {PERMISSION_LABELS[permission]}
              </label>
            ))}
          </div>
        </SettingsField>
      </SettingsFormPanel>

      {loading ? (
        <p className="text-sm text-slate-400">Loading roles...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <div
              key={role.id}
              className={cn(
                'rounded-2xl border p-5 shadow-premium',
                ROLE_ACCENTS[role.portal],
              )}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 shadow-sm">
                    <Shield className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">
                      {role.isSystem ? ROLE_LABELS[role.portal] : role.label}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">
                      {role.isSystem ? ROLE_PORTALS[role.portal] : role.description}
                    </p>
                  </div>
                </div>
                {role.isSystem ? (
                  <span className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    System
                  </span>
                ) : (
                  can('roles:manage') && (
                    <button
                      type="button"
                      onClick={() => void handleDelete(role)}
                      className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                      aria-label={`Delete ${role.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )
                )}
              </div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {role.permissions.length} permissions
              </p>

              <ul className="space-y-1.5">
                {role.permissions.slice(0, 5).map((permission) => (
                  <li
                    key={permission}
                    className="rounded-lg bg-white/80 px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    {PERMISSION_LABELS[permission]}
                  </li>
                ))}
                {role.permissions.length > 5 && (
                  <li className="px-3 py-1 text-xs text-slate-400">
                    +{role.permissions.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
