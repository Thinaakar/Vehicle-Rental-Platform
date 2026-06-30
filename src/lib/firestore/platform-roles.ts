import type { SessionPayload } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import type { PlatformRoleDefinition } from '@/data/platform-roles';
import {
  allAssignablePermissions,
  getSystemPlatformRoles,
  slugifyRoleName,
} from '@/data/platform-roles';
import { hasPermission, type Permission } from '@/data/roles-permissions';
import type { AuthRole } from '@/context/AuthContext';
import { FieldValue } from 'firebase-admin/firestore';

function col() {
  return appCollection(getAdminFirestore(), 'roles');
}

function isPortalNavDocId(id: string) {
  return id === 'vendor' || id === 'customer';
}

function toPermissionList(value: unknown): Permission[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Permission =>
    typeof item === 'string' && allAssignablePermissions().includes(item as Permission),
  );
}

function mapCustomRole(id: string, data: Record<string, unknown>): PlatformRoleDefinition | null {
  if (data.type !== 'platform' || isPortalNavDocId(id)) return null;

  const label = typeof data.label === 'string' ? data.label : '';
  const name = typeof data.name === 'string' ? data.name : slugifyRoleName(label);
  const portal = data.portal as AuthRole;
  if (portal !== 'admin' && portal !== 'vendor' && portal !== 'customer') return null;

  return {
    id,
    name,
    label: label || name,
    description: typeof data.description === 'string' ? data.description : '',
    portal,
    permissions: toPermissionList(data.permissions),
    isSystem: false,
    status: data.status === 'inactive' ? 'inactive' : 'active',
  };
}

export async function listPlatformRoles(): Promise<PlatformRoleDefinition[]> {
  const system = getSystemPlatformRoles();
  const snap = await col().get();
  const custom = snap.docs
    .map((doc) => mapCustomRole(doc.id, doc.data() as Record<string, unknown>))
    .filter((role): role is PlatformRoleDefinition => role !== null)
    .sort((a, b) => a.label.localeCompare(b.label));

  return [...system, ...custom];
}

export async function createPlatformRole(
  session: SessionPayload,
  input: {
    label: string;
    description?: string;
    portal: AuthRole;
    permissions: Permission[];
  },
): Promise<PlatformRoleDefinition> {
  const authUser = {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as AuthRole,
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    avatar: session.avatar,
  };

  if (!hasPermission(authUser, 'roles:manage')) {
    throw new Error('Forbidden');
  }

  const label = input.label.trim();
  if (!label) throw new Error('Role name is required');

  const name = slugifyRoleName(label);
  if (!name) throw new Error('Role name is invalid');
  if (name === 'admin' || name === 'vendor' || name === 'customer') {
    throw new Error('This name is reserved for a system role');
  }

  const permissions: Permission[] = input.permissions.length ? input.permissions : ['booking:view_own'];
  const db = getAdminFirestore();
  await ensureAppTables(db);

  const id = `custom-${name}`;
  const ref = col().doc(id);
  const existing = await ref.get();
  if (existing.exists && existing.data()?.type === 'platform') {
    throw new Error('A role with this name already exists');
  }

  await ref.set(
    {
      type: 'platform',
      name,
      label,
      description: input.description?.trim() || 'Custom role',
      portal: input.portal,
      permissions,
      status: 'active',
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return {
    id,
    name,
    label,
    description: input.description?.trim() || 'Custom role',
    portal: input.portal,
    permissions,
    isSystem: false,
    status: 'active',
  };
}

export async function deletePlatformRole(session: SessionPayload, id: string): Promise<void> {
  const authUser = {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role as AuthRole,
    vendorId: session.vendorId,
    vendorName: session.vendorName,
    avatar: session.avatar,
  };

  if (!hasPermission(authUser, 'roles:manage')) {
    throw new Error('Forbidden');
  }

  if (!id.startsWith('custom-')) {
    throw new Error('System roles cannot be deleted');
  }

  const ref = col().doc(id);
  const doc = await ref.get();
  if (!doc.exists || doc.data()?.type !== 'platform') {
    throw new Error('Role not found');
  }

  await ref.delete();
}
