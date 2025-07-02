import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { UserType } from '@/types/auth';

export interface DashboardInfo {
  name: string;
  path: string;
  userType: UserType;
  accessible: boolean;
  description: string;
}

export interface ConnectionStatus {
  api: 'connected' | 'disconnected' | 'checking';
  auth: 'authenticated' | 'unauthenticated' | 'checking';
  dashboards: DashboardInfo[];
}

/**
 * Hook that provides comprehensive authentication and dashboard connection status
 * Useful for debugging auth issues and checking dashboard accessibility
 */
export function useAuthConnection() {
  const { user, userType, isAuthenticated, isLoading } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    api: 'checking',
    auth: 'checking',
    dashboards: [
      {
        name: 'Admin Dashboard',
        path: '/admin',
        userType: 'admin' as UserType,
        accessible: false,
        description: 'Manage users, employers, and platform settings'
      },
      {
        name: 'Employer Dashboard',
        path: '/employer',
        userType: 'employer' as UserType,
        accessible: false,
        description: 'Post jobs, manage applicants, and view analytics'
      },
      {
        name: 'Student Dashboard',
        path: '/undergraduate',
        userType: 'user' as UserType,
        accessible: false,
        description: 'Browse jobs, apply for positions, and track applications'
      }
    ]
  });

  // Test API connection
  const testApiConnection = useCallback(async () => {
    try {
      const token = authService.getAccessToken();
      if (token) {
        const response = await authService.getCurrentUser(token);
        return response.success ? 'connected' : 'disconnected';
      } else {
        return 'disconnected';
      }
    } catch {
      return 'disconnected';
    }
  }, []);

  // Update connection status
  useEffect(() => {
    const updateStatus = async () => {
      if (isLoading) return;

      // Test API connection
      const apiStatus = await testApiConnection();

      // Determine auth status
      const authStatus = isAuthenticated ? 'authenticated' : 'unauthenticated';

      // Update dashboard accessibility
      const updatedDashboards = connectionStatus.dashboards.map(dashboard => ({
        ...dashboard,
        accessible: isAuthenticated && userType === dashboard.userType
      }));

      setConnectionStatus({
        api: apiStatus,
        auth: authStatus,
        dashboards: updatedDashboards
      });
    };

    updateStatus();
  }, [isAuthenticated, userType, isLoading, testApiConnection, connectionStatus.dashboards]);

  // Get dashboard for current user
  const getCurrentDashboard = useCallback((): DashboardInfo | null => {
    if (!isAuthenticated || !userType) return null;
    
    return connectionStatus.dashboards.find(dashboard => 
      dashboard.userType === userType && dashboard.accessible
    ) || null;
  }, [isAuthenticated, userType, connectionStatus.dashboards]);

  // Get accessible dashboards
  const getAccessibleDashboards = useCallback((): DashboardInfo[] => {
    return connectionStatus.dashboards.filter(dashboard => dashboard.accessible);
  }, [connectionStatus.dashboards]);

  // Check if user can access specific dashboard
  const canAccessDashboard = useCallback((dashboardUserType: UserType): boolean => {
    return isAuthenticated && userType === dashboardUserType;
  }, [isAuthenticated, userType]);

  // Navigate to user's dashboard
  const navigateToUserDashboard = useCallback(() => {
    const dashboard = getCurrentDashboard();
    if (dashboard) {
      window.location.href = dashboard.path;
    }
  }, [getCurrentDashboard]);

  // Get authentication summary
  const getAuthSummary = useCallback(() => {
    return {
      isLoading,
      isAuthenticated,
      userType,
      user: user ? {
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.companyName || user.email,
        email: user.email,
        type: userType
      } : null,
      apiConnected: connectionStatus.api === 'connected',
      accessibleDashboardCount: getAccessibleDashboards().length,
      currentDashboard: getCurrentDashboard()
    };
  }, [
    isLoading, 
    isAuthenticated, 
    userType, 
    user, 
    connectionStatus.api, 
    getAccessibleDashboards, 
    getCurrentDashboard
  ]);

  return {
    connectionStatus,
    getCurrentDashboard,
    getAccessibleDashboards,
    canAccessDashboard,
    navigateToUserDashboard,
    getAuthSummary,
    refreshConnection: () => testApiConnection()
  };
}
