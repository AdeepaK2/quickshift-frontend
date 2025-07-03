'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { 
  ClipboardDocumentCheckIcon, 
  BriefcaseIcon, 
  StarIcon
} from '@heroicons/react/24/outline';
import { userService, UserStats } from '@/services/userService';
// Importing but not using - might be needed for future implementation
// import { gigApplicationService } from '@/services/gigApplicationService';
import { gigCompletionService, GigCompletion } from '@/services/gigCompletionService';
import { gigRequestService } from '@/services/gigRequestService';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { format } from 'date-fns';

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
    const endDate = new Date(gig.completionDate);
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
                : gig.gigRequest.employer.companyName
            };
            
        return (
          <div key={gig._id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm md:text-base text-[#0077B6]">{gigRequest.title}</h4>
                <p className="text-xs md:text-sm text-gray-600 mt-1">{gigRequest.employer}</p>
              </div>
              <span className="text-xs text-gray-500">
                Due: {format(new Date(gig.completionDate), 'MMM d, yyyy')}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs md:text-sm font-medium text-emerald-600">
                LKR {gig.paymentAmount.toLocaleString()}
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
        
        if (response.success && response.data?.gigRequests) {
          // Transform GigRequest data to JobSummary format
          const transformedJobs: JobSummary[] = response.data.gigRequests.map(job => ({
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
        const employerName = typeof job.employer === 'string' ? 'Company' : job.employer.companyName;
        const locationText = job.location || 'Remote';
        
        return (
          <div key={job._id} className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm md:text-base text-[#0077B6]">{job.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                urgency === 'high' ? 'bg-red-100 text-red-800' : 
                urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-green-100 text-green-800'
              }`}>
                {urgency === 'high' ? 'Urgent' : urgency === 'medium' ? 'Soon' : 'Open'}
              </span>
            </div>
            <div className="mt-2 text-xs md:text-sm text-gray-600">
              <p>{employerName} • {locationText}</p>
              <p className="mt-1 font-medium text-emerald-600">
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
  // Using setLoading in the code but not using loading variable directly
  const [, setLoading] = useState(true);
  
  // Fetch user statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await userService.getStats();
        if (response.success && response.data) {
          setStatistics(response.data);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="w-full max-w-5xl mx-auto px-2">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#03045E]">Student Dashboard</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Welcome back, {user?.firstName || 'Student'}! Here&apos;s your current gig activity overview.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Quick Actions */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">Quick Actions</h3>
          <div className="space-y-2 md:space-y-3">
            <Link href="/undergraduate?tab=jobs">
              <button className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm">
                Browse Available Jobs
              </button>
            </Link>
            <Link href="/undergraduate?tab=applications">
              <button className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm">
                Check Pending Applications
              </button>
            </Link>
            <Link href="/undergraduate?tab=profile">
              <button className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm">
                Update Profile
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">My Activity</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs md:text-sm">Applied Jobs</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">{statistics.appliedJobs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs md:text-sm">Active Gigs</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">{statistics.activeGigs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs md:text-sm">Completed Gigs</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">{statistics.completedGigs}</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">My Performance</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm">Total Earnings</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">LKR {statistics.totalEarnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm">This Month</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">LKR {statistics.monthlyEarnings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm">My Rating</span>
              <div className="flex items-center">
                <span className="text-base md:text-lg font-semibold text-[#0077B6] mr-1">{statistics.rating.toFixed(1)}</span>
                <StarIcon className="h-4 w-4 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs Section */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">Recommended Jobs</h3>
          <RecommendedJobs />
        </div>
      </div>

      {/* Current Gigs Section */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">My Current Gigs</h3>
          <ActiveGigs count={statistics.activeGigs} />
        </div>
      </div>
    </div>
  );
}
