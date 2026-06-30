'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, isApiAvailable } from '@/lib/api/client';
import { findStoredDemoUser } from '@/lib/demo-storage';
import { DEMO_CREDENTIALS } from '@/data/demo-accounts';
import { SEED_USERS } from '@/data/seed-defaults';

export type AuthRole = 'admin' | 'vendor' | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  avatar?: string;
  vendorId?: string;
  vendorName?: string;
}

export type LoginRole = 'customer' | 'vendor';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  usesApi: boolean;
  login: (
    email: string,
    password: string,
    selectedRole?: LoginRole | null,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const MOCK_USERS: Array<AuthUser & { password: string }> = SEED_USERS.map((u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  password: u.password,
  role: u.role,
  avatar: u.avatar,
  vendorId: u.vendorId,
  vendorName: u.vendorName,
}));

export const AUTH_STORAGE_KEY = 'vr_auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

function persistAuthUser(user: AuthUser | null) {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem('vr_current_role', user.role);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.setItem('vr_current_role', 'public');
      localStorage.setItem('vr_current_screen', 'marketing');
    }
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    return getStoredAuthUser();
  });
  const [isLoading, setIsLoading] = useState(true);
  const [usesApi, setUsesApi] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const apiUp = await isApiAvailable();
      if (cancelled) return;
      setUsesApi(apiUp);

      if (apiUp) {
        const session = await apiClient.get<AuthUser | null>('/api/auth/session');
        if (cancelled) return;
        if (session.ok) {
          setUser(session.data);
          persistAuthUser(session.data);
        }
      } else {
        setUser(getStoredAuthUser());
      }

      if (!cancelled) setIsLoading(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      selectedRole?: LoginRole | null,
    ): Promise<{ success: boolean; error?: string }> => {
      const apiResult = await apiClient.post<AuthUser>('/api/auth/login', {
        email,
        password,
        selectedRole: selectedRole ?? null,
      });
      if (apiResult.ok) {
        setUser(apiResult.data);
        persistAuthUser(apiResult.data);
        localStorage.setItem('vr_current_screen', 'dashboard');
        setUsesApi(true);
        return { success: true };
      }

      if (apiResult.status !== 503 && apiResult.status !== 500) {
        return { success: false, error: apiResult.error || 'Login failed.' };
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
      const storedUser = findStoredDemoUser(email, password, selectedRole ?? null);
      if (storedUser) {
        setUser(storedUser);
        persistAuthUser(storedUser);
        localStorage.setItem('vr_current_screen', 'dashboard');
        return { success: true };
      }

      const match = MOCK_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password,
      );

      if (!match) {
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }

      if (match.role === 'vendor' && selectedRole !== 'vendor') {
        return {
          success: false,
          error:
            selectedRole === 'customer'
              ? 'These credentials belong to a Vendor account. Please select Vendor.'
              : 'Please select Vendor before signing in with vendor credentials.',
        };
      }
      if (match.role === 'customer' && selectedRole !== 'customer') {
        return {
          success: false,
          error:
            selectedRole === 'vendor'
              ? 'These credentials belong to a Customer account. Please select Customer.'
              : 'Please select Customer before signing in with customer credentials.',
        };
      }

      const { password: _password, ...authUser } = match;
      void _password;
      setUser(authUser);
      persistAuthUser(authUser);
      localStorage.setItem('vr_current_screen', 'dashboard');
      return { success: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiClient.post('/api/auth/logout').catch(() => undefined);
    setUser(null);
    persistAuthUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        usesApi,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function authRoleToViewRole(role: AuthRole): 'admin' | 'vendor' | 'customer' {
  return role;
}

export { DEMO_CREDENTIALS };
