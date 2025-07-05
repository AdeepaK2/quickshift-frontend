'use client';

import { useState, useEffect } from 'react';
// import { withAuth } from '@/contexts/AuthContext'; // Temporarily disabled
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import FloatingActionButton from '@/components/shared/FloatingActionButton';
import { FaBriefcase, FaUser, FaHistory, FaSearch, FaMoneyBillWave } from 'react-icons/fa';
import { userService } from '@/services/userService';
import { toast } from 'react-hot-toast';

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
  { id: 'applications', label: 'My Applications', icon: FaHistory },
  { id: 'gigs', label: 'My Gigs', icon: FaBriefcase },
  { id: 'payments', label: 'My Payments', icon: FaMoneyBillWave },
  { id: 'profile', label: 'Profile', icon: FaUser },
];

function UndergraduatePage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    activeGigs: 0,
    completedGigs: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    rating: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Log authentication status when it changes
  useEffect(() => {
    console.log('Auth status in UndergraduatePage:', { 
      isAuthenticated, 
      hasUser: !!user,
      userId: user?.id,
      userMongoId: user?._id,
      userObject: user
    });
  }, [user, isAuthenticated]);

  // Handler for applying to a job
  const handleApply = async (jobId: string) => {
    try {
      if (!isAuthenticated || !user) {
        toast.error('You must be logged in to apply for jobs');
        return;
      }
      
      // The actual submission is now handled by the ApplicationPopup
      // This handler is called after successful application
      // Don't show duplicate success message - it's already shown in JobDetails
      
      // Update stats after successful application
      setStats(prev => ({
        ...prev,
        appliedJobs: prev.appliedJobs + 1
      }));
    } catch (error) {
      toast.error('Failed to apply for the job. Please try again.');
    }
  };

  // Fetch user stats when the page loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await userService.getStats();
        if (response.success && response.data) {
          // Use actual API data instead of hardcoded values
          setStats({
            appliedJobs: response.data.appliedJobs || 0, // Default to 0 instead of 4
            activeGigs: response.data.activeGigs || 0,
            completedGigs: response.data.completedGigs || 0,
            totalEarnings: response.data.totalEarnings || 0,
            monthlyEarnings: response.data.monthlyEarnings || 0,
            rating: response.data.rating || 0,
            pendingPayments: response.data.pendingPayments || 0
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        // Set default stats if API fails - all should start at 0
        setStats({
          appliedJobs: 0, // Default to 0 as requested
          activeGigs: 0, 
          completedGigs: 0,
          totalEarnings: 0,
          monthlyEarnings: 0,
          rating: 0,
          pendingPayments: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  // Generate quick stats from fetched data
  const quickStats = [
    { label: 'Applied Jobs', value: loading ? '...' : stats.appliedJobs.toString(), description: 'Applications sent' },
    { label: 'Active Gigs', value: loading ? '...' : stats.activeGigs.toString(), description: 'In progress' },
    { label: 'Completed', value: loading ? '...' : stats.completedGigs.toString(), description: 'Finished gigs' },
    { label: 'This Month', value: loading ? '...' : `LKR ${stats.monthlyEarnings.toLocaleString()}`, description: 'Earnings' }
  ];

  // Create enhanced user object with stats
  const userWithStats = user ? {
    ...user,
    stats: stats
  } : null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'jobs':
        return selectedJob ? (
          <JobDetails 
            job={selectedJob} 
            onApply={handleApply} 
            onClose={() => setSelectedJob(null)}
            userId={user?._id || user?.id} 
          />
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
        quickStats={quickStats}
        isLoadingStats={loading}
        user={userWithStats || undefined}
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
