'use client';

import React, { useEffect } from 'react';
import { PlatformProvider, usePlatform } from '@/context/PlatformContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/modules/LoginPage';
import LandingView from '@/modules/LandingView';
import BookingWizard from '@/modules/BookingWizard';
import AdminView from '@/modules/AdminView';
import VendorView from '@/modules/VendorView';
import CustomerView from '@/modules/CustomerView';

function LoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: '#0F172A' }}
    >
      <div
        className="h-11 w-11 animate-spin rounded-full"
        style={{
          border: '3px solid rgba(37,99,235,0.25)',
          borderTopColor: '#38BDF8',
        }}
      />
    </div>
  );
}

function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return <LoadingScreen />;

  switch (user.role) {
    case 'admin':
      return <AdminView />;
    case 'vendor':
      return <VendorView />;
    case 'customer':
      return <CustomerView />;
    default:
      return <LoadingScreen />;
  }
}

function AppRouter() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentScreen, setCurrentRole, openDashboard, isHydrated } = usePlatform();

  useEffect(() => {
    if (user) {
      setCurrentRole(user.role);
    }
  }, [user, setCurrentRole]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && currentScreen === 'login') {
      openDashboard();
    }
  }, [isLoading, isAuthenticated, currentScreen, openDashboard]);

  if (isLoading || !isHydrated) {
    return <LoadingScreen />;
  }

  if (currentScreen === 'booking') {
    return <BookingWizard />;
  }

  if (currentScreen === 'login') {
    return isAuthenticated ? <DashboardRouter /> : <LoginPage />;
  }

  if (currentScreen === 'dashboard') {
    return isAuthenticated ? <DashboardRouter /> : <LoginPage />;
  }

  if (!isAuthenticated) {
    return <LandingView />;
  }

  return <DashboardRouter />;
}

export default function HomePage() {
  return (
    <AuthProvider>
      <PlatformProvider>
        <AppRouter />
      </PlatformProvider>
    </AuthProvider>
  );
}
