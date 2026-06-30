import type { AuthRole } from '@/context/AuthContext';
import type { PlatformRoleDefinition } from '@/data/platform-roles';
import { CUSTOM_ROLES_STORAGE_KEY } from '@/data/platform-roles';
import { MASTER_DATA_STORAGE_KEY, mergeMasterData, type MasterDataBundle } from '@/data/master-data';
import type { PublicUser } from '@/lib/types/records';

export const DEMO_USERS_STORAGE_KEY = 'vr_demo_extra_users';

export type StoredDemoUser = PublicUser & { password: string };

export function readExtraDemoUsers(): StoredDemoUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEMO_USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredDemoUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendExtraDemoUser(user: StoredDemoUser) {
  const existing = readExtraDemoUsers();
  const next = [...existing.filter((item) => item.email !== user.email), user];
  localStorage.setItem(DEMO_USERS_STORAGE_KEY, JSON.stringify(next));
}

export function readStoredMasterData(): MasterDataBundle | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MASTER_DATA_STORAGE_KEY);
    if (!raw) return null;
    return mergeMasterData(JSON.parse(raw) as Partial<MasterDataBundle>);
  } catch {
    return null;
  }
}

export function writeStoredMasterData(data: MasterDataBundle) {
  localStorage.setItem(MASTER_DATA_STORAGE_KEY, JSON.stringify(data));
}

export function readStoredCustomRoles(): PlatformRoleDefinition[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_ROLES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlatformRoleDefinition[];
    return Array.isArray(parsed) ? parsed.filter((role) => !role.isSystem) : [];
  } catch {
    return [];
  }
}

export function writeStoredCustomRoles(roles: PlatformRoleDefinition[]) {
  localStorage.setItem(CUSTOM_ROLES_STORAGE_KEY, JSON.stringify(roles.filter((role) => !role.isSystem)));
}

export function findStoredDemoUser(email: string, password: string, selectedRole?: AuthRole | null) {
  const match = readExtraDemoUsers().find(
    (user) => user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password,
  );
  if (!match) return null;

  if (match.role === 'vendor' && selectedRole !== 'vendor') return null;
  if (match.role === 'customer' && selectedRole !== 'customer') return null;

  const { password: _password, ...authUser } = match;
  void _password;
  return authUser;
}
