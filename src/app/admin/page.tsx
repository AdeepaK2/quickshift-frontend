'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/shared/DashboardLayout';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { FaChartBar, FaUsers, FaBriefcase, FaCog, FaPlus, FaUserTie } from 'react-icons/fa';
import { adminService } from '@/services/adminService';

// Components
import DashboardContent from '@/components/admin/DashboardContent';
import UndergraduatesContent from '@/components/admin/UndergraduatesContent';
import EmployerContent from '@/components/admin/EmployerContent';
import GigContent from '@/components/admin/GigContent';
import SettingContent from '@/components/admin/SettingContent';

type TabType = 'dashboard' | 'undergraduate' | 'employer' | 'gigs' | 'settings';

interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  activeGigs: number;
  totalRevenue: number;
}

const defaultStats: DashboardStats = {
  totalUsers: 0,
  totalEmployers: 0,
  activeGigs: 0,
  totalRevenue: 0
};

function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      
      if (response.success && response.data) {
        setDashboardStats({
          totalUsers: response.data.overview.totalUsers,
          totalEmployers: response.data.overview.totalEmployers,
          activeGigs: response.data.overview.activeGigs,
          totalRevenue: 125000 // This would come from actual revenue data
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
    { id: 'undergraduate', label: 'Undergraduates', icon: FaUsers, badge: dashboardStats.totalUsers.toString() },
    { id: 'employer', label: 'Employers', icon: FaUserTie, badge: dashboardStats.totalEmployers.toString() },
    { id: 'gigs', label: 'Gig Requests', icon: FaBriefcase, badge: dashboardStats.activeGigs.toString() },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  const quickStats = [
    { label: 'Total Users', value: loading ? '...' : dashboardStats.totalUsers.toString(), description: 'Registered users' },
    { label: 'Active Gigs', value: loading ? '...' : dashboardStats.activeGigs.toString(), description: 'Currently active' },
    { label: 'Employers', value: loading ? '...' : dashboardStats.totalEmployers.toString(), description: 'Active employers' },
    { label: 'This Month', value: loading ? '...' : 'LKR 125,000', description: 'Platform revenue' }
  ];

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
        quickStats={quickStats}
        isLoadingStats={loading}
        stats={dashboardStats}
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
