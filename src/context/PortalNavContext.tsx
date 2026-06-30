'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { SidebarGroup } from '@/components/shell/AppSidebar';
import {
  getDefaultPortalNavConfig,
  PORTAL_NAV_STORAGE_KEY,
  type PortalNavConfig,
  type PortalRole,
} from '@/data/portal-nav-permissions';
import { apiClient, isApiAvailable } from '@/lib/api/client';
import {
  canAccessPortalTab,
  filterNavGroups,
  getFirstAllowedTabId,
  getPortalPermissionsForRole,
  mergePortalNavConfig,
} from '@/lib/portal-nav';

type PortalNavContextType = {
  config: PortalNavConfig;
  isLoaded: boolean;
  refreshConfig: () => Promise<void>;
  updateRolePermissions: (role: PortalRole, permissions: string[]) => Promise<boolean>;
  filterNavForRole: (role: PortalRole, groups: SidebarGroup[]) => SidebarGroup[];
  canAccessTab: (role: PortalRole, tabId: string) => boolean;
  getFirstTab: (role: PortalRole) => string;
  getPermissionsForRole: (role: PortalRole) => string[];
};

const PortalNavContext = createContext<PortalNavContextType | undefined>(undefined);

function readStoredConfig(): PortalNavConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PORTAL_NAV_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PortalNavConfig>;
    return mergePortalNavConfig(parsed, getDefaultPortalNavConfig());
  } catch {
    return null;
  }
}

function persistConfig(config: PortalNavConfig) {
  try {
    localStorage.setItem(PORTAL_NAV_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function PortalNavProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<PortalNavConfig>(getDefaultPortalNavConfig());
  const [isLoaded, setIsLoaded] = useState(false);

  const applyConfig = useCallback((next: PortalNavConfig) => {
    setConfig(next);
    persistConfig(next);
  }, []);

  const refreshConfig = useCallback(async () => {
    const stored = readStoredConfig();
    if (stored) setConfig(stored);

    const apiUp = await isApiAvailable();
    if (!apiUp) {
      if (stored) applyConfig(stored);
      setIsLoaded(true);
      return;
    }

    const res = await apiClient.get<PortalNavConfig>('/api/roles/portal-nav');
    if (res.ok) {
      applyConfig(res.data);
    } else if (stored) {
      applyConfig(stored);
    }
    setIsLoaded(true);
  }, [applyConfig]);

  useEffect(() => {
    void refreshConfig();

    const onReset = () => {
      applyConfig(getDefaultPortalNavConfig());
      void refreshConfig();
    };
    window.addEventListener('portal-nav-reset', onReset);
    return () => window.removeEventListener('portal-nav-reset', onReset);
  }, [applyConfig, refreshConfig]);

  const updateRolePermissions = useCallback(
    async (role: PortalRole, permissions: string[]) => {
      const optimistic: PortalNavConfig = { ...config, [role]: permissions };
      applyConfig(optimistic);

      const apiUp = await isApiAvailable();
      if (!apiUp) return true;

      const res = await apiClient.patch<PortalNavConfig>('/api/roles/portal-nav', {
        role,
        permissions,
      });

      if (res.ok) {
        applyConfig(res.data);
        return true;
      }

      await refreshConfig();
      return false;
    },
    [applyConfig, config, refreshConfig],
  );

  const value = useMemo<PortalNavContextType>(
    () => ({
      config,
      isLoaded,
      refreshConfig,
      updateRolePermissions,
      filterNavForRole: (role, groups) =>
        filterNavGroups(role, groups, getPortalPermissionsForRole(role, config)),
      canAccessTab: (role, tabId) =>
        canAccessPortalTab(role, tabId, getPortalPermissionsForRole(role, config)),
      getFirstTab: (role) => getFirstAllowedTabId(role, getPortalPermissionsForRole(role, config)),
      getPermissionsForRole: (role) => getPortalPermissionsForRole(role, config),
    }),
    [config, isLoaded, refreshConfig, updateRolePermissions],
  );

  return <PortalNavContext.Provider value={value}>{children}</PortalNavContext.Provider>;
}

export function usePortalNav() {
  const ctx = useContext(PortalNavContext);
  if (!ctx) throw new Error('usePortalNav must be used within PortalNavProvider');
  return ctx;
}

export function resetPortalNavConfigLocal() {
  const defaults = getDefaultPortalNavConfig();
  persistConfig(defaults);
  return defaults;
}
