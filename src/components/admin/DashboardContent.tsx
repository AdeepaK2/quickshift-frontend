'use client';

import { useEffect, useState } from 'react';
import { adminDashboardService, DashboardStats } from '@/services/adminDashboardService';
import toast from 'react-hot-toast';
import { 
  UserGroupIcon, 
  BriefcaseIcon, 
  ChartBarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CogIcon,
  EyeIcon
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
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardService.getDashboardStats('month');
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      
      if (err instanceof Error) {
        if (err.message.includes('Authentication token not found') || 
            err.message.includes('session has expired')) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000);
        } else if (err.message.includes('permission')) {
          setError('You do not have permission to access this dashboard.');
        } else {
          setError(err.message || 'Failed to load dashboard statistics');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

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
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#023E8A] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Chart configurations
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Users',
        data: [
          Math.floor((dashboardData?.overview.totalUsers || 1000) * 0.6),
          Math.floor((dashboardData?.overview.totalUsers || 1000) * 0.7),
          Math.floor((dashboardData?.overview.totalUsers || 1000) * 0.8),
          Math.floor((dashboardData?.overview.totalUsers || 1000) * 0.85),
          Math.floor((dashboardData?.overview.totalUsers || 1000) * 0.95),
          dashboardData?.overview.totalUsers || 1000
        ],
        borderColor: '#0077B6',
        backgroundColor: 'rgba(0, 119, 182, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const platformStatsData = {
    labels: ['Students', 'Employers', 'Active Gigs', 'Completed Gigs'],
    datasets: [
      {
        data: [
          (dashboardData?.overview.totalUsers || 1000) - (dashboardData?.overview.totalEmployers || 200),
          dashboardData?.overview.totalEmployers || 200,
          dashboardData?.overview.activeGigs || 150,
          dashboardData?.overview.completedGigs || 300
        ],
        backgroundColor: [
          '#0077B6',
          '#00B4D8', 
          '#90E0EF',
          '#CAF0F8'
        ],
        borderColor: [
          '#023E8A',
          '#0077B6',
          '#00B4D8',
          '#90E0EF'
        ],
        borderWidth: 2,
      }
    ]
  };

  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Signups',
        data: [25, 18, 32, 28, 35, 12, 8],
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
              Admin Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Platform overview and system management control center.
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
        {/* Total Users */}
        <div className="bg-gradient-to-br from-[#0077B6] to-[#023E8A] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#CAF0F8] text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold mt-1">{dashboardData?.overview.totalUsers.toLocaleString() || '1,234'}</p>
              <p className="text-[#90E0EF] text-xs mt-1">{dashboardData?.overview.newUsersThisMonth || 45} new this month</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Employers */}
        <div className="bg-gradient-to-br from-[#00B4D8] to-[#0077B6] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#CAF0F8] text-sm font-medium">Total Employers</p>
              <p className="text-2xl font-bold mt-1">{dashboardData?.overview.totalEmployers.toLocaleString() || '189'}</p>
              <p className="text-[#90E0EF] text-xs mt-1">Verified companies</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <BuildingOfficeIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Gigs */}
        <div className="bg-gradient-to-br from-[#90E0EF] to-[#00B4D8] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#03045E] text-sm font-medium">Total Gigs</p>
              <p className="text-2xl font-bold mt-1">{dashboardData?.overview.totalGigs.toLocaleString() || '567'}</p>
              <p className="text-[#023E8A] text-xs mt-1">{dashboardData?.overview.activeGigs || 234} active</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <BriefcaseIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Platform Revenue */}
        <div className="bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] p-6 rounded-2xl shadow-lg text-[#03045E] transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#0077B6] text-sm font-medium">Platform Revenue</p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold mr-2">LKR 2.4M</p>
                <ArrowTrendingUpIcon className="h-5 w-5 text-[#0077B6]" />
              </div>
              <p className="text-[#023E8A] text-xs mt-1">+15% this month</p>
            </div>
            <div className="bg-[#0077B6]/20 p-3 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6 text-[#0077B6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              User Growth Trends
            </h3>
            <div className="text-sm text-gray-500">Last 6 months</div>
          </div>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>

        {/* Platform Stats Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
            Platform Overview
          </h3>
          <div className="h-64">
            <Doughnut data={platformStatsData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Signups Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
            Weekly New Signups
          </h3>
          <div className="h-64">
            <Bar data={weeklyActivityData} options={chartOptions} />
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-lg border border-blue-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-5 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-[#0077B6] to-[#023E8A] rounded-lg flex items-center justify-center mr-2">
              <ShieldCheckIcon className="w-4 h-4 text-white" />
            </div>
            Admin Actions
          </h3>
          <div className="space-y-3">
            <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-3" />
                  <span>Manage Users</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BriefcaseIcon className="h-5 w-5 mr-3" />
                  <span>Monitor Gigs</span>
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
                  <span>View Reports</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CogIcon className="h-5 w-5 mr-3" />
                  <span>System Settings</span>
                </div>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health Metrics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              System Health
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#CAF0F8] to-[#E0F7FA] rounded-lg">
              <div>
                <p className="text-sm text-[#0077B6] font-medium">Server Uptime</p>
                <p className="text-lg font-bold text-[#023E8A]">99.9%</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-[#0077B6]" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#E0F7FA] to-[#CAF0F8] rounded-lg">
              <div>
                <p className="text-sm text-[#0077B6] font-medium">Active Sessions</p>
                <p className="text-lg font-bold text-[#023E8A]">847</p>
              </div>
              <EyeIcon className="h-8 w-8 text-[#0077B6]" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#CAF0F8] to-[#E0F7FA] rounded-lg">
              <div>
                <p className="text-sm text-[#0077B6] font-medium">Response Time</p>
                <p className="text-lg font-bold text-[#023E8A]">127ms</p>
              </div>
              <ClockIcon className="h-8 w-8 text-[#0077B6]" />
            </div>
          </div>
        </div>

        {/* Recent Admin Activity */}
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
                <p className="text-sm font-medium text-[#03045E]">New employer verified</p>
                <p className="text-xs text-gray-500">TechCorp Solutions Ltd</p>
                <p className="text-xs text-[#0077B6]">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-[#F8FDFF] rounded-lg border-l-4 border-[#00B4D8]">
              <div className="w-2 h-2 bg-[#00B4D8] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-[#03045E]">Gig reported by user</p>
                <p className="text-xs text-gray-500">Investigation initiated</p>
                <p className="text-xs text-[#0077B6]">4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-[#F8FDFF] rounded-lg border-l-4 border-[#90E0EF]">
              <div className="w-2 h-2 bg-[#90E0EF] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-[#03045E]">System backup completed</p>
                <p className="text-xs text-gray-500">All data secured</p>
                <p className="text-xs text-[#0077B6]">6 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-[#F8FDFF] rounded-lg border-l-4 border-[#CAF0F8]">
              <div className="w-2 h-2 bg-[#CAF0F8] rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-[#03045E]">Platform maintenance</p>
                <p className="text-xs text-gray-500">Scheduled for next week</p>
                <p className="text-xs text-[#0077B6]">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}