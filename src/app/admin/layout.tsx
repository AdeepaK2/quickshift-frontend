"use client";

import { useState } from "react";
import { useAuth, withAuth } from "@/contexts/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardContent from "@/components/admin/DashboardContent";
import UndergraduatesContent from "@/components/admin/UndergraduatesContent";
import EmployerContent from "@/components/admin/EmployerContent";
import GigContent from "@/components/admin/GigContent";
import SettingContent from "@/components/admin/SettingContent";

function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      try {
        await logout();
        // Logout function in context will handle redirect
      } catch (error) {
        console.error('Logout error:', error);
        // Force redirect even if logout API fails
        window.location.href = '/auth/login';
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-6 ml-0 md:ml-64">
        {children}
        {renderContent()}
      </main>
    </div>
  );
}

// Wrap with auth protection - only allow admin users
export default withAuth(AdminLayout, ['admin']);