'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Central dashboard router that ensures users are always redirected to their correct dashboard
 * This component handles automatic routing based on user type and authentication status
 */
export default function DashboardRouter() {
  const { isAuthenticated, userType, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait for auth to initialize

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
      return;
    }

    // Get current path
    const currentPath = window.location.pathname;

    // Define dashboard paths
    const dashboardPaths = {
      admin: '/admin',
      employer: '/employer',
      user: '/undergraduate'
    };

    // Get the correct dashboard path for user type
    const correctPath = dashboardPaths[userType as keyof typeof dashboardPaths];

    if (!correctPath) {
      // Unknown user type, redirect to login
      router.push('/auth/login');
      return;
    }

    // Check if user is on the correct dashboard section
    const isOnCorrectDashboard = currentPath.startsWith(correctPath);

    if (!isOnCorrectDashboard) {
      // Only redirect if not on a specific sub-route within the correct dashboard
      const isOnHomepage = currentPath === '/';
      const isOnAuthPages = currentPath.startsWith('/auth');
      
      if (isOnHomepage || isOnAuthPages || 
          currentPath.startsWith('/admin') || 
          currentPath.startsWith('/employer') || 
          currentPath.startsWith('/undergraduate')) {
        
        if (!currentPath.startsWith(correctPath)) {
          console.log(`Redirecting to correct dashboard: ${correctPath}`);
          router.push(correctPath);
        }
      }
    }
  }, [isAuthenticated, userType, isLoading, router]);

  return null; // This component doesn't render anything
}