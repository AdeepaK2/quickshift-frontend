'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaUserTie, FaUserCog } from 'react-icons/fa';

interface DashboardTest {
  name: string;
  path: string;
  userType: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'accessible' | 'restricted' | 'checking';
  description: string;
}

export default function DashboardConnectionTestPage() {
  const { user, userType, isAuthenticated, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<DashboardTest[]>([
    {
      name: 'Admin Dashboard',
      path: '/admin',
      userType: 'admin',
      icon: FaUserCog,
      status: 'checking',
      description: 'Manage users, employers, and platform settings'
    },
    {
      name: 'Employer Dashboard',
      path: '/employer',
      userType: 'employer',
      icon: FaUserTie,
      status: 'checking',
      description: 'Post jobs, manage applicants, and view analytics'
    },
    {
      name: 'Student Dashboard',
      path: '/undergraduate',
      userType: 'user',
      icon: FaUser,
      status: 'checking',
      description: 'Browse jobs, apply for positions, and track applications'
    }
  ]);

  const [apiConnection, setApiConnection] = useState<'connected' | 'disconnected' | 'checking'>('checking');

  useEffect(() => {
    const testDashboardAccess = () => {
      if (isLoading) return;

      setTestResults(prev => prev.map(dashboard => ({
        ...dashboard,
        status: (isAuthenticated && userType === dashboard.userType) 
          ? 'accessible' as const
          : 'restricted' as const
      })));
    };

    testDashboardAccess();
  }, [isAuthenticated, userType, isLoading]);

  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const token = authService.getAccessToken();
        if (token) {
          const response = await authService.getCurrentUser(token);
          setApiConnection(response.success ? 'connected' : 'disconnected');
        } else {
          setApiConnection('disconnected');
        }
      } catch {
        setApiConnection('disconnected');
      }
    };

    if (!isLoading) {
      testApiConnection();
    }
  }, [isLoading]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accessible':
      case 'connected':
        return <FaCheckCircle className="text-green-500" />;
      case 'restricted':
      case 'disconnected':
        return <FaTimesCircle className="text-red-500" />;
      case 'checking':
        return <FaClock className="text-orange-500 animate-pulse" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accessible': return 'Accessible';
      case 'restricted': return 'Restricted';
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accessible':
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'restricted':
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'checking':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔐 QuickShift Dashboard Connection Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page tests the authentication connection to all dashboards in the QuickShift platform.
            Use this to verify that auth integration is working correctly across all user types.
          </p>
        </div>

        {/* Current Auth Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Current Authentication Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Loading</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(isLoading ? 'checking' : 'connected')}
                <span className="text-sm">{isLoading ? 'Loading...' : 'Complete'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Authenticated</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(isAuthenticated ? 'accessible' : 'restricted')}
                <span className="text-sm">{isAuthenticated ? 'Yes' : 'No'}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">User Type</span>
              <span className="text-sm font-semibold text-blue-600">
                {userType || 'None'}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">API Connection</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(apiConnection)}
                <span className="text-sm">{getStatusText(apiConnection)}</span>
              </div>
            </div>
          </div>

          {user && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">👤 User Information</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Name:</strong> {user.firstName} {user.lastName}</div>
                <div><strong>Email:</strong> {user.email}</div>
                {user.companyName && <div><strong>Company:</strong> {user.companyName}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Access Test Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">🎯 Dashboard Access Test Results</h2>
          
          <div className="space-y-4">
            {testResults.map((dashboard, index) => {
              const IconComponent = dashboard.icon;
              return (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 transition-all duration-200 ${getStatusColor(dashboard.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="text-2xl" />
                      <div>
                        <h3 className="font-semibold">{dashboard.name}</h3>
                        <p className="text-sm opacity-75">{dashboard.description}</p>
                        <div className="text-xs mt-1">
                          <span className="font-medium">Path:</span> {dashboard.path} | 
                          <span className="font-medium"> Required Type:</span> {dashboard.userType}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(dashboard.status)}
                      <span className="font-medium">{getStatusText(dashboard.status)}</span>
                    </div>
                  </div>
                  
                  {dashboard.status === 'accessible' && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <a 
                        href={dashboard.path}
                        className="inline-flex items-center px-4 py-2 bg-white text-current border border-current/30 rounded-lg hover:bg-current/10 transition-colors text-sm font-medium"
                      >
                        🚀 Go to {dashboard.name}
                      </a>
                    </div>
                  )}
                  
                  {dashboard.status === 'restricted' && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <p className="text-sm">
                        {isAuthenticated 
                          ? `❌ Access denied. You need '${dashboard.userType}' role (current: '${userType}').`
                          : '🔑 Login required to access this dashboard.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <a 
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔑 Login to Test Access
          </a>
          
          <Link 
            href="/"
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            🏠 Back to Home
          </Link>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            🔄 Refresh Test
          </button>
        </div>
      </div>
    </div>
  );
}
