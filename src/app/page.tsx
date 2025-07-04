'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import QuickShiftLandingPage from '@/components/QuickShiftLandingPage';

export default function HomePage() {
  const { isAuthenticated, userType, isLoading } = useAuth();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (!isLoading && isAuthenticated && userType) {
      const dashboardPaths = {
        admin: '/admin',
        employer: '/employer',
        user: '/undergraduate'
      };
      
      const dashboardPath = dashboardPaths[userType as keyof typeof dashboardPaths];
      if (dashboardPath) {
        console.log(`Authenticated user detected, redirecting to ${dashboardPath}`);
        // Use window.location.replace for immediate redirect without adding to history
        window.location.replace(dashboardPath);
      }
    }
  }, [isAuthenticated, userType, isLoading]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mb-4"></div>
          <p className="text-gray-600 text-sm">Loading QuickShift...</p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading message while redirecting
  if (isAuthenticated && userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return (
    <QuickShiftLandingPage />
  );
}