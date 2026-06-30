'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ROLE_LABELS } from '@/data/roles-permissions';
import type { PlatformRoleDefinition } from '@/data/platform-roles';
import type { PublicUser } from '@/lib/types/records';
import type { AuthRole } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { appendExtraDemoUser, readExtraDemoUsers } from '@/lib/demo-storage';
import SettingsFormPanel, { SettingsField, SettingsInput, SettingsSelect } from '@/components/admin/settings/SettingsFormPanel';
import { cn } from '@/lib/utils';

const ROLE_STYLES: Record<AuthRole, string> = {
  admin: 'bg-violet-100 text-violet-700',
  vendor: 'bg-sky-100 text-sky-700',
  customer: 'bg-emerald-100 text-emerald-700',
};

function mergeUsers(apiUsers: PublicUser[]) {
  const extras = readExtraDemoUsers().map(({ password: _password, ...user }) => user);
  const byEmail = new Map<string, PublicUser>();
  for (const user of [...apiUsers, ...extras]) {
    byEmail.set(user.email.toLowerCase(), user);
  }
  return Array.from(byEmail.values());
}

export default function UsersSettingsSection() {
  const { can } = usePermissions();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [roles, setRoles] = useState<PlatformRoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    roleKey: 'customer',
    vendorName: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [usersResult, rolesResult] = await Promise.all([
      apiClient.get<PublicUser[]>('/api/users'),
      apiClient.get<PlatformRoleDefinition[]>('/api/roles/platform'),
    ]);

    if (usersResult.ok) {
      setUsers(mergeUsers(usersResult.data));
    }
    if (rolesResult.ok) {
      setRoles(rolesResult.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.isSystem ? ROLE_LABELS[role.portal] : role.label,
        portal: role.portal,
      })),
    [roles],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.includes(q),
    );
  }, [users, search]);

  const handleCreate = async () => {
    setFormError(null);
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.email.trim()) return setFormError('Email is required');
    if (form.password.length < 6) return setFormError('Password must be at least 6 characters');

    const selectedRole = roleOptions.find((role) => role.value === form.roleKey);
    if (!selectedRole) return setFormError('Select a valid role');

    setSaving(true);
    const result = await apiClient.post<PublicUser>('/api/users', {
      name: form.name,
      email: form.email,
      password: form.password,
      role: selectedRole.portal,
      vendorName: selectedRole.portal === 'vendor' ? form.vendorName || undefined : undefined,
    });

    if (!result.ok) {
      setFormError(result.error || 'Failed to create user');
      setSaving(false);
      return;
    }

    appendExtraDemoUser({
      ...result.data,
      password: form.password,
    });

    setUsers((current) => mergeUsers([...current, result.data]));
    setForm({ name: '', email: '', password: '', roleKey: 'customer', vendorName: '' });
    setShowForm(false);
    setSaving(false);
  };

  if (!can('users:view_all')) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
        You do not have permission to view user accounts.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {can('users:manage') && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      <SettingsFormPanel
        open={showForm}
        title="Create User"
        subtitle="Add a new platform account"
        submitLabel="Create User"
        error={formError}
        saving={saving}
        onClose={() => setShowForm(false)}
        onSubmit={() => void handleCreate()}
      >
        <SettingsField label="Full Name" required>
          <SettingsInput value={form.name} onChange={(name) => setForm((f) => ({ ...f, name }))} placeholder="Jane Smith" />
        </SettingsField>
        <SettingsField label="Email" required>
          <SettingsInput
            value={form.email}
            onChange={(email) => setForm((f) => ({ ...f, email }))}
            placeholder="jane@example.com"
            type="email"
          />
        </SettingsField>
        <SettingsField label="Password" required>
          <SettingsInput
            value={form.password}
            onChange={(password) => setForm((f) => ({ ...f, password }))}
            placeholder="Minimum 6 characters"
            type="password"
          />
        </SettingsField>
        <SettingsField label="Role" required>
          <SettingsSelect
            value={form.roleKey}
            onChange={(roleKey) => setForm((f) => ({ ...f, roleKey }))}
            options={roleOptions.map((role) => ({ value: role.value, label: role.label }))}
          />
        </SettingsField>
        {roleOptions.find((role) => role.value === form.roleKey)?.portal === 'vendor' && (
          <SettingsField label="Vendor Name">
            <SettingsInput
              value={form.vendorName}
              onChange={(vendorName) => setForm((f) => ({ ...f, vendorName }))}
              placeholder="Fleet company name"
            />
          </SettingsField>
        )}
      </SettingsFormPanel>

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-premium">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="hidden px-4 py-3 md:table-cell">Vendor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No users match your search.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {user.avatar ?? user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                        ROLE_STYLES[user.role],
                      )}
                    >
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-xs font-semibold capitalize',
                        user.status === 'active' ? 'text-emerald-600' : 'text-slate-400',
                      )}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                    {user.vendorName ?? '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
