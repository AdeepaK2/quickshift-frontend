'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthConnection } from '@/hooks/useAuthConnection';
import { FaWifi, FaUser, FaTachometerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

interface DashboardConnectionWidgetProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  defaultVisible?: boolean;
  showInProduction?: boolean;
}

export default function DashboardConnectionWidget({
  position = 'bottom-right',
  defaultVisible = false,
  showInProduction = false
}: DashboardConnectionWidgetProps) {
  const { isAuthenticated, userType } = useAuth();
  const { connectionStatus, getAuthSummary } = useAuthConnection();
  const [isVisible, setIsVisible] = useState(defaultVisible);
  const [isMinimized, setIsMinimized] = useState(true);

  // Hide in production unless explicitly allowed
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && !showInProduction) {
      setIsVisible(false);
    }
  }, [showInProduction]);

  if (!isVisible && process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const authSummary = getAuthSummary();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-500' : 'text-red-500';
    }
    switch (status) {
      case 'connected':
      case 'authenticated':
        return 'text-green-500';
      case 'disconnected':
      case 'unauthenticated':
        return 'text-red-500';
      case 'checking':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Toggle Button */}
      {!isVisible && (
        <button
          onClick={toggleVisibility}
          className={`fixed ${positionClasses[position]} z-50 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors`}
          title="Show Dashboard Connection Status"
        >
          <FaTachometerAlt className="w-4 h-4" />
        </button>
      )}

      {/* Widget */}
      {isVisible && (
        <div className={`fixed ${positionClasses[position]} z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
            <div className="flex items-center space-x-2">
              <FaTachometerAlt className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-gray-800">Dashboard Status</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMinimized}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <FaEye className="w-3 h-3" /> : <FaEyeSlash className="w-3 h-3" />}
              </button>
              <button
                onClick={toggleVisibility}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Hide"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="p-3 space-y-3">
              {/* Connection Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <FaWifi className="w-3 h-3" />
                    <span>API Connection</span>
                  </span>
                  <span className={`font-medium ${getStatusColor(connectionStatus.api)}`}>
                    {connectionStatus.api}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <FaUser className="w-3 h-3" />
                    <span>Authentication</span>
                  </span>
                  <span className={`font-medium ${getStatusColor(isAuthenticated)}`}>
                    {isAuthenticated ? 'Logged In' : 'Logged Out'}
                  </span>
                </div>

                {isAuthenticated && (
                  <div className="flex items-center justify-between text-sm">
                    <span>User Type</span>
                    <span className="font-medium text-blue-600">
                      {userType || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>

              {/* Dashboard Access */}
              <div className="border-t pt-2">
                <div className="text-sm font-medium text-gray-700 mb-2">Dashboard Access</div>
                <div className="space-y-1">
                  {connectionStatus.dashboards.map((dashboard, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="truncate">{dashboard.name}</span>
                      <span className={`font-medium ${getStatusColor(dashboard.accessible)}`}>
                        {dashboard.accessible ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current User Info */}
              {authSummary.user && (
                <div className="border-t pt-2">
                  <div className="text-sm font-medium text-gray-700 mb-1">Current User</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="truncate">{authSummary.user.name}</div>
                    <div className="truncate">{authSummary.user.email}</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="border-t pt-2">
                <div className="flex space-x-2">
                  {authSummary.currentDashboard && (
                    <button
                      onClick={() => window.location.href = authSummary.currentDashboard!.path}
                      className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => window.location.reload()}
                    className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
