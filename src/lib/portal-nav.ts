import type { SidebarGroup } from '@/components/shell/AppSidebar';
import type { PortalNavConfig, PortalRole } from '@/data/portal-nav-permissions';
import {
  CUSTOMER_NAV_PERMISSIONS,
  VENDOR_NAV_PERMISSIONS,
} from '@/data/portal-nav-permissions';

export function filterNavGroups(
  role: PortalRole,
  groups: SidebarGroup[],
  allowedPermissions: string[],
): SidebarGroup[] {
  const allowed = new Set(allowedPermissions);

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        return allowed.has(item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export function getFirstAllowedTabId(role: PortalRole, allowedPermissions: string[]): string {
  const meta = role === 'vendor' ? VENDOR_NAV_PERMISSIONS : CUSTOMER_NAV_PERMISSIONS;
  const allowed = new Set(allowedPermissions);
  const match = meta.find((item) => allowed.has(item.permission));
  return match?.tabId ?? meta[0]?.tabId ?? 'dashboard';
}

export function canAccessPortalTab(
  role: PortalRole,
  tabId: string,
  allowedPermissions: string[],
): boolean {
  const meta = role === 'vendor' ? VENDOR_NAV_PERMISSIONS : CUSTOMER_NAV_PERMISSIONS;
  const item = meta.find((entry) => entry.tabId === tabId);
  if (!item) return false;
  return allowedPermissions.includes(item.permission);
}

export function getPortalPermissionsForRole(
  role: PortalRole,
  config: PortalNavConfig,
): string[] {
  return config[role] ?? [];
}

export function mergePortalNavConfig(partial: Partial<PortalNavConfig>, defaults: PortalNavConfig): PortalNavConfig {
  return {
    vendor: partial.vendor?.length ? partial.vendor : defaults.vendor,
    customer: partial.customer?.length ? partial.customer : defaults.customer,
  };
}
