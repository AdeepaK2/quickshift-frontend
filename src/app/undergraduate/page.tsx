'use client';

import { useState } from 'react';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { FaBriefcase, FaUser, FaHistory, FaSearch, FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';

// Components
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import MyApplications from './components/MyApplications';
import Profile from './components/Profile';
import MyGigs from './components/MyGigs';
import MyPayments from './components/MyPayments';

type TabType = 'jobs' | 'applications' | 'gigs' | 'payments' | 'profile';

function UndergraduatePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const tabs = [
    { id: 'jobs', label: 'Browse Jobs', icon: FaSearch },
    { id: 'applications', label: 'My Applications', icon: FaHistory },
    { id: 'gigs', label: 'My Gigs', icon: FaBriefcase },
    { id: 'payments', label: 'My Payments', icon: FaMoneyBillWave },
    { id: 'profile', label: 'Profile', icon: FaUser },
  ];
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

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return selectedJob ? (
          <JobDetails jobId={selectedJob} onBack={() => setSelectedJob(null)} />
        ) : (
          <JobList onSelectJob={setSelectedJob} />
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
        return <JobList onSelectJob={setSelectedJob} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5FF]">
      {/* Header */}
      <header className="bg-[#03045E] text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">QuickShift</h1>
            <p className="text-sm text-[#90E0EF]">Find your next opportunity</p>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                  </p>
                  <p className="text-xs text-[#90E0EF]">Student</p>
                </div>
                <div className="w-10 h-10 bg-[#0077B6] rounded-full flex items-center justify-center">
                  <FaUser className="text-white text-sm" />
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 bg-[#0077B6] hover:bg-[#005F8A] rounded-lg transition-colors text-sm"
              title="Logout"
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        {user && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName || 'Student'}! 👋
            </h2>
            <p className="text-gray-600">
              Ready to find your next opportunity or manage your current gigs?
            </p>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-[#0077B6] border-b-2 border-[#0077B6] bg-blue-50'
                    : 'text-gray-500 hover:text-[#00B4D8] hover:bg-gray-50'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className="bg-white rounded-lg shadow-md p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Wrap with auth protection - only allow students/users
export default withAuth(UndergraduatePage, ['user']);