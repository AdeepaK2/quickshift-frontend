'use client';

import { useState } from 'react';
// import { withAuth } from '@/contexts/AuthContext'; // Temporarily disabled
import DashboardLayout from '@/components/shared/DashboardLayout';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { FaBriefcase, FaUser, FaHistory, FaSearch, FaMoneyBillWave } from 'react-icons/fa';

// Components
import JobList from '@/components/undergraduate/JobList';
import JobDetails from '@/components/undergraduate/JobDetails';
import MyApplications from '@/components/undergraduate/MyApplications';
import Profile from '@/components/undergraduate/Profile';
import MyGigs from '@/components/undergraduate/MyGigs';
import MyPayments from '@/components/undergraduate/MyPayments';
import Dashboard from '@/components/undergraduate/Dashboard';

type TabType = 'dashboard' | 'jobs' | 'applications' | 'gigs' | 'payments' | 'profile';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  pay: string;
  postedDate: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  employer: {
    name: string;
    rating: number;
  };
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaUser },
  { id: 'jobs', label: 'Browse Jobs', icon: FaSearch },
  { id: 'applications', label: 'My Applications', icon: FaHistory, badge: '2' },
  { id: 'gigs', label: 'My Gigs', icon: FaBriefcase, badge: '2' },
  { id: 'payments', label: 'My Payments', icon: FaMoneyBillWave },
  { id: 'profile', label: 'Profile', icon: FaUser },
];

const quickStats = [
  { label: 'Applied Jobs', value: '8', description: 'Applications sent' },
  { label: 'Active Gigs', value: '2', description: 'Current work' },
  { label: 'This Month', value: 'LKR 18,500', description: 'Earnings' },
  { label: 'Rating', value: '4.8', description: 'Your rating' }
];

function UndergraduatePage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'jobs':
        return selectedJob ? (
          <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />
        ) : (
          <JobList onJobSelect={setSelectedJob} />
        );
      case 'applications':
        return <MyApplications />;
      case 'gigs':
        return <MyGigs />;
      case 'payments':
        return <MyPayments />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  const handleQuickAction = () => {
    // Quick action - go to browse jobs
    setActiveTab('jobs');
    setSelectedJob(null); // Reset any selected job
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
  };

  return (
    <>
      <DashboardLayout
        userType="user"
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        navigationItems={navigationItems}
        quickStats={quickStats}
      >
        {renderContent()}
      </DashboardLayout>
      
      <FloatingActionButton
        onClick={handleQuickAction}
        icon={FaSearch}
        title="Browse Jobs"
      />
    </>
  );
}

// Protect with auth for users only - TEMPORARILY DISABLED to fix redirect loop
// const AuthenticatedUndergraduatePage = withAuth(UndergraduatePage, ['user']);
// export default AuthenticatedUndergraduatePage;

// Temporarily export without client-side auth check - middleware handles protection
export default UndergraduatePage;
