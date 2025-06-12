"use client";

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import Sidebar from '@/components/layout/Sidebar';

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const userData = authService.getUser();
    if (userData) {
      setUser(userData);
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

  // Show loading state while user data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}