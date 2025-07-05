'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { 
  ClipboardDocumentCheckIcon, 
  BriefcaseIcon, 
  StarIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { userService, UserStats } from '@/services/userService';
// Importing but not using - might be needed for future implementation
// import { gigApplicationService } from '@/services/gigApplicationService';
import { gigCompletionService, GigCompletion } from '@/services/gigCompletionService';
import { gigRequestService } from '@/services/gigRequestService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Link from 'next/link';
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

// Interface for gig request
interface JobSummary {
  _id: string;
  title: string;
  employer: string | { 
    _id: string;
    companyName: string; 
  };
  payRate: {
    amount: number;
    rateType: string;
  };
  applicationDeadline?: string;
  location?: string;
}

// Component to display active gigs
const ActiveGigs = ({ count }: { count: number }) => {
  const [gigs, setGigs] = useState<GigCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveGigs = async () => {
      try {
        setLoading(true);
        const response = await gigCompletionService.getMyCompletions({
          status: 'confirmed',
          sortBy: 'completionDate',
          sortOrder: 'asc',
          limit: 3
        });
        
        if (response.success && response.data?.completions) {
          setGigs(response.data.completions);
        }
      } catch (error) {
        console.error('Error fetching active gigs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveGigs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div key={item} className="border rounded-lg p-3 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mt-3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (count === 0 || gigs.length === 0) {
    return (
      <div className="text-center py-8">
        <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2 text-gray-500">You don&apos;t have any active gigs right now.</p>
        <Link href="/undergraduate?tab=jobs">
          <button className="mt-3 px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#023E8A] transition-colors text-sm">
            Browse Available Jobs
          </button>
        </Link>
      </div>
    );
  }

  // Calculate progress for a gig
  const calculateProgress = (gig: GigCompletion): number => {
    // If we had start/end dates for the gig, we could calculate real progress
    // For now, just use a placeholder value based on creation date vs completion date
    const startDate = new Date(gig.createdAt);
    const endDate = gig.completedAt ? new Date(gig.completedAt) : new Date();
    const today = new Date();
    
    const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.max(0, (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.min(100, Math.floor((daysPassed / totalDays) * 100));
  };

  return (
    <div className="space-y-3">
      {gigs.map(gig => {
        const progress = calculateProgress(gig);
        const gigRequest = typeof gig.gigRequest === 'string' 
          ? { title: 'Unknown Job', employer: 'Unknown Employer' } 
          : { 
              title: gig.gigRequest.title,
              employer: typeof gig.gigRequest.employer === 'string' 
                ? 'Unknown Employer' 
                : (gig.gigRequest.employer?.companyName || 'Unknown Employer')
            };
            
        return (
          <div key={gig._id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm md:text-base text-[#0077B6]">{gigRequest.title}</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{gigRequest.employer}</p>
              </div>
              <span className="text-xs text-gray-500">
                Due: {gig.completedAt ? format(new Date(gig.completedAt), 'MMM d, yyyy') : 'TBD'}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#0077B6] h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium text-[#0077B6]">
                LKR {(gig.paymentSummary?.finalAmount || gig.paymentSummary?.totalAmount || 0).toLocaleString()}
              </span>
              <Link href="/undergraduate?tab=gigs">
                <button className="text-xs px-3 py-1 bg-[#CAF0F8] text-[#0077B6] rounded hover:bg-[#90E0EF] transition-colors">
                  Update Status
                </button>
              </Link>
            </div>
          </div>
        );
      })}
      <Link href="/undergraduate?tab=gigs">
        <button className="w-full mt-2 text-center px-3 py-2 text-[#0077B6] hover:text-[#023E8A] text-xs md:text-sm font-medium">
          View All My Gigs →
        </button>
      </Link>
    </div>
  );
};

// Recommended Jobs component to fetch and display jobs
const RecommendedJobs = () => {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        setLoading(true);
        const response = await gigRequestService.getAllGigRequests({
          sortBy: 'createdAt',
          sortOrder: 'desc',
          limit: 3,
          status: 'active'
        });
        
        if (response.success && response.data) {
          // Handle both new format (array) and legacy format (object with gigRequests)
          const gigRequests = Array.isArray(response.data) 
            ? response.data 
            : (response.data as any)?.gigRequests || [];
          
          // Transform GigRequest data to JobSummary format
          const transformedJobs: JobSummary[] = gigRequests.map((job: any) => ({
            _id: job._id,
            title: job.title,
            employer: job.employer,
            payRate: job.payRate,
            applicationDeadline: job.applicationDeadline ? 
              (job.applicationDeadline instanceof Date ? 
                job.applicationDeadline.toISOString() : 
                job.applicationDeadline) : 
              undefined,
            location: job.location?.address || job.location?.city
          }));
          setJobs(transformedJobs);
        }
      } catch (error) {
        console.error('Error fetching recommended jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendedJobs();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border rounded-lg p-3 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-2 text-gray-500">No jobs available right now.</p>
        <Link href="/undergraduate?tab=jobs">
          <button className="mt-3 px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#023E8A] transition-colors text-sm">
            Refresh Jobs
          </button>
        </Link>
      </div>
    );
  }

  // Get job urgency based on deadline proximity
  const getUrgency = (deadline?: string): 'high' | 'medium' | 'low' => {
    if (!deadline) return 'low';
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 2) return 'high';
    if (daysLeft <= 7) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const urgency = getUrgency(job.applicationDeadline);
        const employerName = typeof job.employer === 'string' ? 'Company' : (job.employer?.companyName || 'Company');
        const locationText = job.location || 'Remote';
        
        return (
          <div key={job._id} className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm md:text-base text-[#0077B6]">{job.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                urgency === 'high' ? 'bg-[#FFE5E5] text-[#D63031]' : 
                urgency === 'medium' ? 'bg-[#FFF5E5] text-[#F77F00]' : 
                'bg-[#E5F5FF] text-[#0077B6]'
              }`}>
                {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Soon' : 'Open'}
              </span>
            </div>
            <div className="mt-2 text-xs md:text-sm text-gray-600">
              <p>{employerName} • {locationText}</p>
              <p className="mt-1 font-medium text-[#0077B6]">
                LKR {job.payRate.amount.toLocaleString()} per {job.payRate.rateType === 'hourly' ? 'hour' : 'task'}
              </p>
            </div>
          </div>
        );
      })}
      <Link href="/undergraduate?tab=jobs">
        <button className="w-full mt-2 text-center px-3 py-2 text-[#0077B6] hover:text-[#023E8A] text-xs md:text-sm font-medium">
          View All Available Jobs →
        </button>
      </Link>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState<UserStats>({
    appliedJobs: 0,
    activeGigs: 0,
    completedGigs: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    rating: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await userService.getStats();
        
        if (response.success && response.data) {
          setStatistics(response.data);
        } else {
          throw new Error(response.message || 'Failed to load dashboard data');
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        
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
            setError(error.message || 'Failed to load dashboard data');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
        
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-2">
        <div className="mb-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-3 md:p-4 rounded-lg shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 animate-pulse">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto px-2 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
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
  const earningsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Earnings (LKR)',
        data: [
          statistics.monthlyEarnings * 0.8,
          statistics.monthlyEarnings * 0.6,
          statistics.monthlyEarnings * 1.2,
          statistics.monthlyEarnings * 0.9,
          statistics.monthlyEarnings * 1.1,
          statistics.monthlyEarnings
        ],
        borderColor: '#0077B6',
        backgroundColor: 'rgba(0, 119, 182, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const gigStatusData = {
    labels: ['Applied', 'Active', 'Completed'],
    datasets: [
      {
        data: [statistics.appliedJobs, statistics.activeGigs, statistics.completedGigs],
        backgroundColor: [
          '#CAF0F8',
          '#0077B6', 
          '#023E8A'
        ],
        borderColor: [
          '#0077B6',
          '#023E8A',
          '#03045E'
        ],
        borderWidth: 2,
      }
    ]
  };

  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours Worked',
        data: [8, 6, 7, 9, 5, 4, 3],
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
              Student Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Welcome back, <span className="font-semibold text-[#0077B6]">{user?.firstName || 'Student'}</span>! Here&apos;s your performance overview.
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
        {/* Total Earnings Card */}
        <div className="bg-gradient-to-br from-[#0077B6] to-[#023E8A] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#CAF0F8] text-sm font-medium">Total Earnings</p>
              <p className="text-2xl font-bold mt-1">LKR {statistics.totalEarnings.toLocaleString()}</p>
              <p className="text-[#90E0EF] text-xs mt-1">+12% from last month</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Active Gigs Card */}
        <div className="bg-gradient-to-br from-[#00B4D8] to-[#0077B6] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#CAF0F8] text-sm font-medium">Active Gigs</p>
              <p className="text-2xl font-bold mt-1">{statistics.activeGigs}</p>
              <p className="text-[#90E0EF] text-xs mt-1">Currently working</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <BriefcaseIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Completed Gigs Card */}
        <div className="bg-gradient-to-br from-[#90E0EF] to-[#00B4D8] p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#03045E] text-sm font-medium">Completed Gigs</p>
              <p className="text-2xl font-bold mt-1">{statistics.completedGigs}</p>
              <p className="text-[#023E8A] text-xs mt-1">Successfully finished</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <ClipboardDocumentCheckIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Rating Card */}
        <div className="bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] p-6 rounded-2xl shadow-lg text-[#03045E] transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#0077B6] text-sm font-medium">My Rating</p>
              <div className="flex items-center mt-1">
                <p className="text-2xl font-bold mr-2">{statistics.rating.toFixed(1)}</p>
                <StarIcon className="h-5 w-5 text-[#F77F00] fill-current" />
              </div>
              <p className="text-[#023E8A] text-xs mt-1">Excellent performance</p>
            </div>
            <div className="bg-[#0077B6]/20 p-3 rounded-xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-[#0077B6]" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              Earnings Trend
            </h3>
            <div className="text-sm text-gray-500">Last 6 months</div>
          </div>
          <div className="h-64">
            <Line data={earningsChartData} options={chartOptions} />
          </div>
        </div>

        {/* Gig Status Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
            Gig Status
          </h3>
          <div className="h-64">
            <Doughnut data={gigStatusData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Weekly Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#03045E] mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
            Weekly Activity
          </h3>
          <div className="h-64">
            <Bar data={weeklyActivityData} options={chartOptions} />
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
            <Link href="/undergraduate?tab=jobs">
              <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-5 w-5 mr-3" />
                    <span>Browse Jobs</span>
                  </div>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Link>
            
            <Link href="/undergraduate?tab=applications">
              <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ClipboardDocumentCheckIcon className="h-5 w-5 mr-3" />
                    <span>My Applications</span>
                  </div>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Link>
            
            <Link href="/undergraduate?tab=payments">
              <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-3" />
                    <span>View Payments</span>
                  </div>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Link>

            <Link href="/undergraduate?tab=profile">
              <button className="group w-full text-left px-4 py-4 bg-gradient-to-r from-[#CAF0F8] to-[#90E0EF] text-[#0077B6] rounded-xl hover:from-[#90E0EF] hover:to-[#00B4D8] hover:text-white transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Update Profile</span>
                  </div>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Jobs and Current Gigs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Jobs Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              Recommended Jobs
            </h3>
            <Link href="/undergraduate?tab=jobs" className="text-sm text-[#0077B6] hover:text-[#023E8A] font-medium">
              View All →
            </Link>
          </div>
          <RecommendedJobs />
        </div>

        {/* Current Gigs Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#03045E] flex items-center">
              <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2 text-[#0077B6]" />
              My Active Gigs
            </h3>
            <Link href="/undergraduate?tab=gigs" className="text-sm text-[#0077B6] hover:text-[#023E8A] font-medium">
              View All →
            </Link>
          </div>
          <ActiveGigs count={statistics.activeGigs} />
        </div>
      </div>
    </div>
  );
}
