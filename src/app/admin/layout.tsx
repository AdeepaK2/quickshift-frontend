"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import DashboardContent from "@/components/admin/DashboardContent";
import UndergraduateContent from "@/components/admin/UndergraduatesContent";
import EmployerContent from "@/components/admin/EmployerContent";
import JobContent from "@/components/admin/GigContent";
import SettingContent from "@/components/admin/SettingContent";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");
  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "undergraduate":
        return <UndergraduateContent />;
      case "employer":
        return <EmployerContent />;
      case "gigs":
        return <JobContent />;
      case "settings":
        return <SettingContent />;
      default:
        return <DashboardContent />;
    }
  };
  return (
    <div className="flex min-h-screen">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 ml-0 md:ml-64">{renderContent()}</main>
    </div>
  );
}
