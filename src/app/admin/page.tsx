'use client';

import { useState } from 'react';
import { withAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { FaChartBar, FaUsers, FaBriefcase, FaCog, FaPlus, FaUserTie } from 'react-icons/fa';

// Components
import DashboardContent from '@/components/admin/DashboardContent';
import UndergraduatesContent from '@/components/admin/UndergraduatesContent';
import EmployerContent from '@/components/admin/EmployerContent';
import GigContent from '@/components/admin/GigContent';
import SettingContent from '@/components/admin/SettingContent';

type TabType = 'dashboard' | 'undergraduate' | 'employer' | 'gigs' | 'settings';

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
  { id: 'undergraduate', label: 'Undergraduates', icon: FaUsers, badge: '15' },
  { id: 'employer', label: 'Employers', icon: FaUserTie, badge: '8' },
  { id: 'gigs', label: 'Gig Requests', icon: FaBriefcase, badge: '23' },
  { id: 'settings', label: 'Settings', icon: FaCog },
];

const quickStats = [
  { label: 'Total Users', value: '156', description: 'Registered users' },
  { label: 'Active Gigs', value: '23', description: 'Currently active' },
  { label: 'Employers', value: '8', description: 'Active employers' },
  { label: 'This Month', value: 'LKR 125,000', description: 'Platform revenue' }
];

function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "undergraduate":
        return <UndergraduatesContent />;
      case "employer":
        return <EmployerContent />;
      case "gigs":
        return <GigContent />;
      case "settings":
        return <SettingContent />;
      default:
        return <DashboardContent />;
    }
  };

  const handleQuickAction = () => {
    // Quick action - go to users management
    setActiveTab('undergraduate');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  return (
    <>
      <DashboardLayout
        userType="admin"
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
        title="Manage Users"
      />
    </>
  );
}

// Export directly since middleware and layout handle auth protection
export default AdminPage;
