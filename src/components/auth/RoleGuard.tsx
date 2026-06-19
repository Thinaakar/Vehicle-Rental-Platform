'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { AuthRole } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/data/roles-permissions';

type RoleGuardProps = {
  allow: AuthRole | AuthRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function RoleGuard({ allow, children, fallback }: RoleGuardProps) {
  const { user } = useAuth();
  const allowed = Array.isArray(allow) ? allow : [allow];

  if (!user || !allowed.includes(user.role)) {
    return (
      fallback ?? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/50 p-10 text-center">
          <ShieldAlert className="mb-4 h-10 w-10 text-rose-500" />
          <h3 className="text-lg font-black text-slate-900">Access restricted</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            This area requires {allowed.map((r) => ROLE_LABELS[r]).join(' or ')} permissions.
            {user ? ` You are signed in as ${ROLE_LABELS[user.role]}.` : ' Please sign in with the correct account.'}
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
}
