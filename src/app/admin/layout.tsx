"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardContent from "@/components/admin/DashboardContent";
import UndergraduatesContent from "@/components/admin/UndergraduatesContent";
import EmployerContent from "@/components/admin/EmployerContent";
import GigContent from "@/components/admin/GigContent";
import SettingContent from "@/components/admin/SettingContent";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  return (
    <div className="flex min-h-screen">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 ml-0 md:ml-64">
        {children}
        {renderContent()}
      </main>
    </div>
  );
}
