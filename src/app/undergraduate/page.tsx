'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';
import { FaBriefcase, FaUser, FaHistory, FaSearch, FaMoneyBillWave, FaSignOutAlt, FaBell } from 'react-icons/fa';

// Components
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import MyApplications from './components/MyApplications';
import Profile from './components/Profile';
import MyGigs from './components/MyGigs';
import MyPayments from './components/MyPayments';

type TabType = 'jobs' | 'applications' | 'gigs' | 'payments' | 'profile';

export default function UndergraduatePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    const userData = authService.getUser();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

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
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          await authService.logout(refreshToken);
        }
        // Clear all auth data
        authService.clearTokens();
        // Redirect to login
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        authService.clearTokens();
        window.location.href = '/auth/login';
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

  // Show loading state while user data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F5FF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F5FF]">
      {/* Header */}
      <header className="bg-[#03045E] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">QuickShift</h1>
              <p className="text-sm text-[#90E0EF]">Find your next opportunity</p>
            </div>
            
            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 hover:bg-[#0077B6] rounded-lg transition-colors relative">
                <FaBell className="text-white text-lg" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Info */}
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

              {/* Logout Button */}
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
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#0077B6] to-[#00B4D8] rounded-xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              Ready to find your next opportunity or manage your current gigs?
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-blue-100">Applied Jobs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-blue-100">Active Gigs</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">$580</div>
                <div className="text-xs text-blue-100">This Month</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-xs text-blue-100">Rating</div>
              </div>
            </div>
          </div>
        </div>

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
        <main className="bg-white rounded-lg shadow-md p-6 min-h-[500px]">
          {renderContent()}
        </main>
      </div>

      {/* Quick Action Floating Button */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setActiveTab('jobs')}
          className="bg-[#0077B6] hover:bg-[#005F8A] text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          title="Browse Jobs"
        >
          <FaSearch className="text-xl" />
        </button>
      </div>
    </div>
  );
}