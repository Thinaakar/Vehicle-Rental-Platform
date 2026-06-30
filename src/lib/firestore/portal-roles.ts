/** Firestore read/write for vendor & customer portal nav permissions. */

import type { SessionPayload } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import type { PortalNavConfig, PortalRole } from '@/data/portal-nav-permissions';
import { getDefaultPortalNavConfig } from '@/data/portal-nav-permissions';
import { mergePortalNavConfig } from '@/lib/portal-nav';
import { hasPermission } from '@/data/roles-permissions';
import { FieldValue } from 'firebase-admin/firestore';

function col() {
  return appCollection(getAdminFirestore(), 'roles');
}

function toPermissionList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export async function getPortalNavConfig(): Promise<PortalNavConfig> {
  const defaults = getDefaultPortalNavConfig();
  const snap = await col().get();
  if (snap.empty) return defaults;

  const partial: Partial<PortalNavConfig> = {};
  for (const doc of snap.docs) {
    const role = doc.id as PortalRole;
    if (role !== 'vendor' && role !== 'customer') continue;
    const permissions = toPermissionList(doc.data().permissions);
    if (permissions.length) partial[role] = permissions;
  }

  return mergePortalNavConfig(partial, defaults);
}

export async function updatePortalNavConfig(
  session: SessionPayload,
  role: PortalRole,
  permissions: string[],
): Promise<PortalNavConfig> {
  const authUser = {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as 'admin' | 'vendor' | 'customer',
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    avatar: session.avatar,
  };

  if (!hasPermission(authUser, 'roles:manage')) {
    throw new Error('Forbidden');
  }

  if (role !== 'vendor' && role !== 'customer') {
    throw new Error('Invalid portal role');
  }

  if (!permissions.length) {
    throw new Error('At least one navigation item must remain enabled');
  }

  const db = getAdminFirestore();
  await ensureAppTables(db);

  await col()
    .doc(role)
    .set(
      {
        name: role === 'vendor' ? 'Fleet Vendor' : 'Customer',
        permissions,
        status: 'active',
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  return getPortalNavConfig();
}
