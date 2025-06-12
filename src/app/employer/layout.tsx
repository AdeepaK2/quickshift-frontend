"use client";

import { useAuth, withAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';

function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
        // Logout function in context now handles redirect
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} onLogout={handleLogout} />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

// Wrap with auth protection - only allow employers
export default withAuth(EmployerLayout, ['employer']);