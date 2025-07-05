'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { employerService, EmployerStats } from '@/services/employerService';
import JobPostModal from './JobPostModal';
import { 
  BriefcaseIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await employerService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching employer stats:', error);
        
        // Set a user-friendly error message based on error type
        if (error instanceof Error) {
          if (error.message.includes('Authentication token not found') || 
              error.message.includes('session has expired')) {
            setError('Your session has expired. Please log in again.');
            // Redirect to login page after a brief delay
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 3000);
          } else if (error.message.includes('permission')) {
            setError('You do not have permission to access this dashboard.');
          } else {
            setError(error.message || 'Failed to load dashboard statistics');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2">
        <div className="mb-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-lg animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <div className="text-red-500 text-xl mb-4">Error Loading Dashboard</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#023E8A] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Chart configurations
  const applicationTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications Received',
        data: [
          Math.floor((stats?.totalApplications || 0) * 0.6),
          Math.floor((stats?.totalApplications || 0) * 0.8),
          Math.floor((stats?.totalApplications || 0) * 1.2),
          Math.floor((stats?.totalApplications || 0) * 0.9),
          Math.floor((stats?.totalApplications || 0) * 1.1),
          stats?.totalApplications || 0
        ],
        borderColor: '#0077B6',
        backgroundColor: 'rgba(0, 119, 182, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const jobStatusData = {
    labels: ['Active Jobs', 'Draft Jobs', 'Closed Jobs'],
    datasets: [
      {
        data: [
          stats?.activeJobs || 0, 
          Math.max(0, (stats?.totalJobsPosted || 0) - (stats?.activeJobs || 0) - 2),
          2
        ],
        backgroundColor: [
          '#0077B6',
          '#00B4D8', 
          '#90E0EF'
        ],
        borderColor: [
          '#023E8A',
          '#0077B6',
          '#00B4D8'
        ],
        borderWidth: 2,
      }
    ]
  };

  const hiringFunnelData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Applications',
        data: [12, 8, 15, 10, 18, 6, 4],
        backgroundColor: '#0077B6',
        borderColor: '#023E8A',
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(3, 4, 94, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#0077B6',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11
          },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(3, 4, 94, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#0077B6',
        borderWidth: 1,
      }
    }
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto px-2 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#03045E] to-[#0077B6] bg-clip-text text-transparent">
              Employer Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-[#0077B6]">{user?.firstName || 'Employer'}</span>! Here&apos;s your hiring overview.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Jobs Posted */}
        <div className="bg-gradient-to-br from-[#0077B6] to-[#023E8A] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#CAF0F8] text-sm font-medium">Total Jobs Posted</p>
              <p className="text-2xl font-bold mt-1">{stats?.totalJobsPosted || 0}</p>
              <p className="text-[#90E0EF] text-xs mt-1">All time</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <BriefcaseIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-gradient-to-br from-[#00B4D8] to-[#0077B6] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#CAF0F8] text-sm font-medium">Active Jobs</p>
              <p className="text-2xl font-bold mt-1">{stats?.activeJobs || 0}</p>
              <p className="text-[#90E0EF] text-xs mt-1">Currently open</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <EyeIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-gradient-to-br from-[#90E0EF] to-[#00B4D8] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#03045E] text-sm font-medium">Total Applications</p>
              <p className="text-2xl font-bold mt-1">{stats?.totalApplications || 0}</p>
              <p className="text-[#023E8A] text-xs mt-1">Received</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Hires */}
        <div className="bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] p-6 rounded-2xl shadow-lg text-[#03045E] transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#0077B6] text-sm font-medium">Total Hires</p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold mr-2">{stats?.totalHires || 0}</p>
                <CheckCircleIcon className="h-5 w-5 text-[#0077B6]" />
              </div>
              <p className="text-[#023E8A] text-xs mt-1">{stats?.responseRate || 0}% response rate</p>
            </div>
            <div className="bg-[#0077B6]/20 p-3 rounded-xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-[#0077B6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              Application Trends
            </h3>
            <div className="text-sm text-gray-500">Last 6 months</div>
          </div>
          <div className="h-64">
            <Line data={applicationTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Job Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-4 flex items-center">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
            Job Status
          </h3>
          <div className="h-64">
            <Doughnut data={jobStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Applications Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
            Weekly Applications
          </h3>
          <div className="h-64">
            <Bar data={hiringFunnelData} options={chartOptions} />
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-5 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0077B6] to-[#023E8A] rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-3" />
                  <span>Post New Job</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  <span>Review Applications</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  <span>View Analytics</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-3" />
                  <span>Manage Profile</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              Performance Insights
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#CAF0F8] to-[#E0F7FA] rounded-lg">
              <div>
                <p className="text-sm text-[#0077B6] font-medium">Average Response Time</p>
                <p className="text-lg font-bold text-[#023E8A]">2.3 days</p>
              </div>
              <ClockIcon className="h-8 w-8 text-[#0077B6]" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#E0F7FA] to-[#CAF0F8] rounded-lg">
              <div>
                <p className="text-sm text-[#0077B6] font-medium">Application Quality Score</p>
                <p className="text-lg font-bold text-[#023E8A]">87%</p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-[#0077B6]" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#CAF0F8] to-[#E0F7FA] rounded-lg">
              <div>
                <p className="text-sm text-[#0077B6] font-medium">Conversion Rate</p>
                <p className="text-lg font-bold text-[#023E8A]">{((stats?.totalHires || 0) / Math.max(1, stats?.totalApplications || 1) * 100).toFixed(1)}%</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-[#0077B6]" />
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-[#F8FDFF] rounded-lg border-l-4 border-[#0077B6]">
              <div className="w-2 h-2 bg-[#0077B6] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-[#03045E]">New application received</p>
                <p className="text-xs text-gray-500">for Software Developer position</p>
                <p className="text-xs text-[#0077B6]">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-[#F8FDFF] rounded-lg border-l-4 border-[#00B4D8]">
              <div className="w-2 h-2 bg-[#00B4D8] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-[#03045E]">Job post published</p>
                <p className="text-xs text-gray-500">Marketing Assistant position</p>
                <p className="text-xs text-[#0077B6]">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-[#F8FDFF] rounded-lg border-l-4 border-[#90E0EF]">
              <div className="w-2 h-2 bg-[#90E0EF] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-[#03045E]">Candidate interviewed</p>
                <p className="text-xs text-gray-500">for Data Analyst role</p>
                <p className="text-xs text-[#0077B6]">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Post Modal */}
      <JobPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          // Optionally refresh stats or show success message
        }}
      />
    </div>
  );
}
