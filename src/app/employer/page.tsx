'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { FaChartBar, FaBriefcase, FaUsers, FaCog, FaPlus, FaFileAlt, FaWrench } from 'react-icons/fa';
import { employerService } from '@/services/employerService';

// Components
import DashboardContent from '@/components/employer/DashboardContent';
import ManageJobs from '@/components/employer/ManageJobs';
import ApplicantsManagement from '@/components/employer/ApplicantsManagement';
import PaymentManagement from '@/components/employer/PaymentManagement';
import Profile from '@/components/employer/Profile';
import SettingsContainer from '@/components/employer/SettingsContainer';

type TabType = 'dashboard' | 'jobs' | 'applicants' | 'payments' | 'profile' | 'settings';

type QuickStat = {
  label: string;
  value: string;
  description: string;
};

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
  { id: 'jobs', label: 'Manage Jobs', icon: FaBriefcase },
  { id: 'applicants', label: 'Applicants', icon: FaUsers },
  { id: 'payments', label: 'Payments', icon: FaFileAlt },
  { id: 'profile', label: 'Profile', icon: FaCog },
  { id: 'settings', label: 'Settings', icon: FaWrench },
];

function EmployerPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    { label: 'Active Jobs', value: '0', description: 'Currently posted' },
    { label: 'Total Applications', value: '0', description: 'This month' },
    { label: 'Hired', value: '0', description: 'Successfully hired' },
    { label: 'Response Rate', value: '0%', description: 'Average response' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch stats on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await employerService.getStats();
        if (response.success && response.data) {
          const stats = response.data;
          setQuickStats([
            { label: 'Active Jobs', value: String(stats.activeJobs), description: 'Currently posted' },
            { label: 'Total Applications', value: String(stats.totalApplications), description: 'All time' },
            { label: 'Hired', value: String(stats.totalHires), description: 'Successfully hired' },
            { label: 'Response Rate', value: `${stats.responseRate}%`, description: 'Average response' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "jobs":
        return <ManageJobs />;
      case "applicants":
        return <ApplicantsManagement />;
      case "payments":
        return <PaymentManagement />;
      case "profile":
        return <Profile />;
      case "settings":
        return <SettingsContainer />;
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

        quickStats={quickStats}
        isLoadingStats={isLoading}
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
