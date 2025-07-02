'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SmartDashboardNavigatorProps {
  children: React.ReactNode;
  redirectOnAuth?: boolean;
  allowedUserTypes?: string[];
  fallbackPath?: string;
}

/**
 * Smart Dashboard Navigator - Automatically handles dashboard routing based on user type
 * Wraps any component and ensures users are always on their correct dashboard
 */
export default function SmartDashboardNavigator({
  children,
  redirectOnAuth = true,
  allowedUserTypes,
  fallbackPath = '/auth/login'
}: SmartDashboardNavigatorProps) {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Handle unauthenticated users
    if (!isAuthenticated) {
      if (redirectOnAuth) {
        router.push(fallbackPath);
      }
      return;
    }

    // Handle authenticated users
    if (isAuthenticated && userType) {
      // Check if user type is allowed for this component
      if (allowedUserTypes && !allowedUserTypes.includes(userType)) {
        // Redirect to appropriate dashboard
        const dashboardPaths = {
          admin: '/admin',
          employer: '/employer', 
          user: '/undergraduate'
        };
        
        const correctPath = dashboardPaths[userType as keyof typeof dashboardPaths];
        if (correctPath) {
          router.push(correctPath);
        } else {
          router.push(fallbackPath);
        }
        return;
      }

      // If redirectOnAuth is enabled and no specific path restrictions,
      // ensure user is on their correct dashboard
      if (redirectOnAuth && !allowedUserTypes) {
        const currentPath = window.location.pathname;
        const dashboardPaths = {
          admin: '/admin',
          employer: '/employer',
          user: '/undergraduate'
        };
        
        const correctPath = dashboardPaths[userType as keyof typeof dashboardPaths];
        
        if (correctPath && !currentPath.startsWith(correctPath)) {
          // Only redirect if not already on the correct dashboard section
          router.push(correctPath);
        }
      }
    }
  }, [isAuthenticated, userType, isLoading, router, redirectOnAuth, allowedUserTypes, fallbackPath]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for unauthorized users
  if (allowedUserTypes && isAuthenticated && userType && !allowedUserTypes.includes(userType)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <p className="text-sm text-gray-500 mb-6">
            Required role: {allowedUserTypes.join(' or ')} | Your role: {userType}
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated && redirectOnAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
}
