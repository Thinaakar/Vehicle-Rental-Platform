import type { AuthRole } from '@/context/AuthContext';
import {
  PERMISSION_LABELS,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  ROLE_PORTALS,
  type Permission,
} from '@/data/roles-permissions';

export type PlatformRoleDefinition = {
  id: string;
  name: string;
  label: string;
  description: string;
  portal: AuthRole;
  permissions: Permission[];
  isSystem: boolean;
  status: 'active' | 'inactive';
};

export const CUSTOM_ROLES_STORAGE_KEY = 'vr_custom_roles';

export function getSystemPlatformRoles(): PlatformRoleDefinition[] {
  return (['admin', 'vendor', 'customer'] as AuthRole[]).map((role) => ({
    id: role,
    name: role,
    label: ROLE_LABELS[role],
    description: ROLE_PORTALS[role],
    portal: role,
    permissions: [...ROLE_PERMISSIONS[role]],
    isSystem: true,
    status: 'active' as const,
  }));
}

export function slugifyRoleName(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function allAssignablePermissions(): Permission[] {
  return Object.keys(PERMISSION_LABELS) as Permission[];
}
