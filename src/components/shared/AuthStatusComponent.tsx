'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

interface AuthStatusComponentProps {
  showDebugInfo?: boolean;
}

export default function AuthStatusComponent({ showDebugInfo = false }: AuthStatusComponentProps) {
  const { user, userType, isAuthenticated, isLoading } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [dashboardAccess, setDashboardAccess] = useState({
    admin: false,
    employer: false,
    undergraduate: false
  });

  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        // Check if we can make a request to the API
        const token = authService.getAccessToken();
        if (token) {
          const response = await authService.getCurrentUser(token);
          setConnectionStatus(response.success ? 'connected' : 'disconnected');
        } else {
          setConnectionStatus('disconnected');
        }
      } catch {
        setConnectionStatus('disconnected');
      }
    };

    if (!isLoading) {
      checkConnectionStatus();
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    // Update dashboard access based on user type
    if (isAuthenticated && userType) {
      setDashboardAccess({
        admin: userType === 'admin',
        employer: userType === 'employer',
        undergraduate: userType === 'user'
      });
    } else {
      setDashboardAccess({
        admin: false,
        employer: false,
        undergraduate: false
      });
    }
  }, [isAuthenticated, userType]);

  if (!showDebugInfo) {
    return null;
  }

  const getStatusColor = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'checking': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: typeof connectionStatus) => {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '❌';
      case 'checking': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="text-sm space-y-2">
        <div className="font-semibold text-gray-800 border-b pb-2">
          🔐 Auth Status
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Connection:</span>
            <span className={getStatusColor(connectionStatus)}>
              {getStatusIcon(connectionStatus)} {connectionStatus}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Authenticated:</span>
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {isAuthenticated ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>User Type:</span>
            <span className="text-blue-600">
              {userType || 'None'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Loading:</span>
            <span className={isLoading ? 'text-orange-600' : 'text-green-600'}>
              {isLoading ? '⏳ Yes' : '✅ No'}
            </span>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="font-medium text-gray-700 mb-1">Dashboard Access:</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Admin:</span>
              <span className={dashboardAccess.admin ? 'text-green-600' : 'text-gray-400'}>
                {dashboardAccess.admin ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Employer:</span>
              <span className={dashboardAccess.employer ? 'text-green-600' : 'text-gray-400'}>
                {dashboardAccess.employer ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Student:</span>
              <span className={dashboardAccess.undergraduate ? 'text-green-600' : 'text-gray-400'}>
                {dashboardAccess.undergraduate ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>

        {user && (
          <div className="border-t pt-2">
            <div className="font-medium text-gray-700 mb-1">User Info:</div>
            <div className="text-xs space-y-1">
              <div>Name: {user.firstName} {user.lastName}</div>
              <div>Email: {user.email}</div>
              {user.companyName && <div>Company: {user.companyName}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
