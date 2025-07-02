'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { FaChartBar, FaBriefcase, FaUsers, FaCog, FaPlus, FaFileAlt } from 'react-icons/fa';

// Components
import DashboardContent from '@/components/employer/DashboardContent';
import ManageJobs from '@/components/employer/ManageJobs';
import ApplicantsManagement from '@/components/employer/ApplicantsManagement';
import Analytics from '@/components/employer/Analytics';
import Profile from '@/components/employer/Profile';

type TabType = 'dashboard' | 'jobs' | 'applicants' | 'analytics' | 'profile';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
  { id: 'jobs', label: 'Manage Jobs', icon: FaBriefcase, badge: '5' },
  { id: 'applicants', label: 'Applicants', icon: FaUsers, badge: '12' },
  { id: 'analytics', label: 'Analytics', icon: FaFileAlt },
  { id: 'profile', label: 'Profile', icon: FaCog },
];

const quickStats = [
  { label: 'Active Jobs', value: '5', description: 'Currently posted' },
  { label: 'Total Applications', value: '12', description: 'This month' },
  { label: 'Hired', value: '3', description: 'Successfully hired' },
  { label: 'Response Rate', value: '85%', description: 'Average response' }
];

function EmployerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "jobs":
        return <ManageJobs />;
      case "applicants":
        return <ApplicantsManagement />;
      case "analytics":
        return <Analytics />;
      case "profile":
        return <Profile />;
      default:
        return <DashboardContent />;
    }
  };

  const handleQuickAction = () => {
    // Quick action - go to job management
    setActiveTab('jobs');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  return (
    <>
      <DashboardLayout
        userType="employer"
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        navigationItems={navigationItems}
        quickStats={quickStats}
      >
        {renderContent()}
      </DashboardLayout>
      
      <FloatingActionButton
        onClick={handleQuickAction}
        icon={FaPlus}
        title="Post New Job"
      />
    </>
  );
}

// Export directly since layout handles auth protection
export default EmployerPage;
