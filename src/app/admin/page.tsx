'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardContent from '@/components/admin/DashboardContent';
import UndergraduatesContent from '@/components/admin/UndergraduatesContent';
import EmployerContent from '@/components/admin/EmployerContent';
import GigContent from '@/components/admin/GigContent';
import SettingContent from '@/components/admin/SettingContent';
import { User } from '@/types/auth';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const userData = authService.getUser();
    const userType = authService.getUserType();
    
    // Verify user is admin
    if (userData && userType === 'admin') {
      setUser(userData as User);
    } else {
      // If not admin, redirect to login
      window.location.href = '/auth/login';
      return;
    }
    
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
        // Clear all auth data
        authService.clearTokens();
        // Redirect to login
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        authService.clearTokens();
        window.location.href = '/auth/login';
      }
    }
  };

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "undergraduate":
        return (
          <div className="p-4 md:p-8">
            <UndergraduatesContent />
          </div>
        );
      case "employer":
        return (
          <div className="p-4 md:p-8">
            <EmployerContent />
          </div>
        );
      case "gigs":
        return (
          <div className="p-4 md:p-8">
            <GigContent />
          </div>
        );
      case "settings":
        return (
          <div className="p-4 md:p-8">
            <SettingContent />
          </div>
        );
      default:
        return <DashboardContent />;
    }
  };

  // Show loading state while user data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user data, show error
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin access required.</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-6 ml-0 md:ml-64">
        {/* Welcome Header for Admin */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[#023E8A] to-[#0077B6] rounded-xl p-6 text-white shadow-lg">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Admin'}! 👨‍💼
            </h1>
            <p className="text-blue-100">
              Manage your QuickShift platform from this admin dashboard.
            </p>
            
            {/* Quick Admin Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">1,234</div>
                <div className="text-xs text-blue-100">Total Users</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">567</div>
                <div className="text-xs text-blue-100">Active Gigs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">89</div>
                <div className="text-xs text-blue-100">Employers</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">$12.5k</div>
                <div className="text-xs text-blue-100">Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm min-h-[600px]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}