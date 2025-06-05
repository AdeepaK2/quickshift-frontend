"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import UndergraduateContent from "@/components/admin/UndergraduatesContent";
import EmployerContent from "@/components/admin/EmployerContent";
import JobContent from "@/components/admin/GigContent";
import AnalyticsContent from "@/components/admin/AnalyticsContent";
import SettingContent from "@/components/admin/SettingContent";

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Users Overview</h2>
                <p className="text-gray-600">
                  View and manage all system users
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Jobs Overview</h2>
                <p className="text-gray-600">
                  Monitor all job postings and applications
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-2">Analytics</h2>
                <p className="text-gray-600">
                  Review platform performance metrics
                </p>
              </div>
            </div>
          </div>
        );
      case "undergraduate":
        return <UndergraduateContent />;
      case "employer":
        return <EmployerContent />;
      case "gigs":
        return <JobContent />;
      case "analytics":
        return <AnalyticsContent />;
      case "settings":
        return <SettingContent />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64">{renderContent()}</main>
    </div>
  );
}
