'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gigRequestService, GigRequest } from '@/services/gigRequestService';
import { gigCompletionService, GigCompletion } from '@/services/gigCompletionService';
import { format } from 'date-fns';
import JobPostModal from './JobPostModal';
import ApplicationsModal from './ApplicationsModal';

// Loading skeleton component
const JobSkeleton = () => (
  <div className="border-b border-gray-200 pb-6 last:border-b-0 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-6 bg-gray-200 rounded w-12"></div>
      </div>
    </div>
    <div className="mt-4 flex items-center space-x-6">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-4 bg-gray-200 rounded w-2"></div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-2"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default function ManageJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState<GigRequest[]>([]);
  const [completedGigs, setCompletedGigs] = useState<GigCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationsModalOpen, setApplicationsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<{ id: string; title: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (statusFilter === 'completed') {
      fetchCompletedJobs();
    } else {
      fetchJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchJobs = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const filters: {
        sortBy: 'createdAt' | 'updatedAt' | 'applicationsCount';
        sortOrder: 'asc' | 'desc';
        status?: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
      } = { 
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (statusFilter !== 'all' && statusFilter !== 'completed') {
        filters.status = statusFilter as 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
      }
      
      const response = await gigRequestService.getGigRequests(filters);
      
      if (response && response.success && response.data) {
        if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else {
          const responseObj = response.data as any;
          if (responseObj.gigRequests && Array.isArray(responseObj.gigRequests)) {
            setJobs(responseObj.gigRequests);
          } else if (responseObj.jobs && Array.isArray(responseObj.jobs)) {
            setJobs(responseObj.jobs);
          } else {
            setError('Received unexpected data format from server');
            setJobs([]);
          }
        }
      } else {
        setError(response?.message || 'Failed to fetch jobs');
        setJobs([]);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('An error occurred while fetching jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCompletedJobs = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await gigCompletionService.getEmployerCompletedGigs({
        sortBy: 'completedAt',
        sortOrder: 'desc'
      });
      
      if (response.success && response.data) {
        setCompletedGigs(response.data);
      } else {
        setError('Failed to fetch completed jobs');
        setCompletedGigs([]);
      }
    } catch (err) {
      console.error('Error fetching completed jobs:', err);
      setError('An error occurred while fetching completed jobs. Please try again.');
      setCompletedGigs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: 'active' | 'closed' | 'draft' | 'cancelled') => {
    try {
      await gigRequestService.changeGigRequestStatus(jobId, newStatus);
      setJobs(prevJobs => (prevJobs || []).map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
    } catch (err) {
      console.error('Error changing job status:', err);
    }
  };

  const handleStartJob = async (jobId: string) => {
    try {
      const response = await gigRequestService.startJob(jobId);

      if (response.success) {
        // Refresh jobs list
        if (statusFilter === 'completed') {
          fetchCompletedJobs(true);
        } else {
          fetchJobs(true);
        }
      } else {
        setError(response.message || 'Failed to start job');
      }
    } catch (err) {
      console.error('Error starting job:', err);
      setError('An error occurred while starting the job');
    }
  };

  const handleCompleteJob = async (jobId: string, completionData?: { notes?: string, proof?: string[] }) => {
    try {
      const response = await gigRequestService.completeJob(jobId, completionData);

      if (response.success) {
        // Refresh jobs list
        if (statusFilter === 'completed') {
          fetchCompletedJobs(true);
        } else {
          fetchJobs(true);
        }
      } else {
        setError(response.message || 'Failed to complete job');
      }
    } catch (err) {
      console.error('Error completing job:', err);
      setError('An error occurred while completing the job');
    }
  };

  const getPostedDate = (createdAt: string) => {
    const date = new Date(createdAt);
    return format(date, 'MMM d, yyyy');
  };

  const formatPayRate = (payRate: { amount: number; rateType: string }) => {
    const { amount, rateType } = payRate;
    switch (rateType) {
      case 'hourly':
        return `LKR ${amount.toLocaleString()}/hour`;
      case 'fixed':
        return `LKR ${amount.toLocaleString()} fixed`;
      case 'daily':
        return `LKR ${amount.toLocaleString()}/day`;
      default:
        return `LKR ${amount.toLocaleString()}`;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'filled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCompletedGig = (completion: GigCompletion) => {
    const gigRequest = completion.gigRequest as any;
    return {
      _id: completion._id,
      title: gigRequest?.title || 'Unknown Job',
      location: gigRequest?.location || { city: 'Unknown', address: '' },
      category: gigRequest?.category || 'Unknown',
      payRate: gigRequest?.payRate || { amount: 0, rateType: 'fixed' },
      status: 'completed',
      completedAt: completion.completedAt,
      totalAmount: completion.paymentSummary?.totalAmount || 0,
      workersCount: completion.workers?.length || 0
    };
  };

  const renderJobs = () => {
    if (statusFilter === 'completed') {
      return completedGigs.map((completion) => {
        const formattedGig = formatCompletedGig(completion);
        return (
          <div key={completion._id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-[#03045E]">{formattedGig.title}</h3>
                <p className="text-gray-600 mt-2">
                  {formattedGig.location.city} • {formattedGig.category} • {formatPayRate(formattedGig.payRate)}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Completed on {formattedGig.completedAt ? format(new Date(formattedGig.completedAt), 'MMM d, yyyy') : 'Unknown date'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border capitalize ${getStatusClass('completed')}`}>
                  Completed
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-6 text-gray-600">
              <span>{formattedGig.workersCount} Workers</span>
              <span>•</span>
              <span>Total Paid: LKR {formattedGig.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        );
      });
    } else {
      return jobs.map((job) => (
        <div key={job._id} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-[#03045E]">{job.title}</h3>
              <p className="text-gray-600 mt-2">
                {job.location.city} • {job.category} • {formatPayRate(job.payRate)}
              </p>
              <p className="text-sm text-gray-500 mt-2">Posted on {getPostedDate(job.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-4 py-2 rounded-full text-sm font-medium border capitalize ${getStatusClass(job.status)}`}>
                {job.status}
              </span>
              
              {/* Primary action buttons - always visible and prominent */}
              {job.status === 'filled' && (
                <button 
                  onClick={() => handleStartJob(job._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 min-h-[44px] shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Start this job"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  Start Job
                </button>
              )}
              
              {job.status === 'in_progress' && (
                <button 
                  onClick={() => handleCompleteJob(job._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 min-h-[44px] shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Complete this job"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Complete Job
                </button>
              )}
              
              {/* Secondary actions dropdown */}
              <div className="relative group">
                <button 
                  className="text-[#0077B6] hover:text-[#00B4D8] font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  onMouseEnter={(e) => {
                    const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                    if (dropdown) dropdown.style.display = 'block';
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                  <div 
                    className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-20 hidden"
                    style={{ display: 'none' }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'block';
                    }}
                  >
                    <button 
                      onClick={() => router.push(`/employer/jobs/${job._id}`)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </span>
                    </button>
                    <button 
                      onClick={() => router.push(`/employer/jobs/${job._id}/edit`)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Job
                      </span>
                    </button>
                    
                    {job.status === 'draft' && (
                      <button 
                        onClick={() => handleStatusChange(job._id, 'active')}
                        className="block w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50 transition-colors duration-150"
                      >
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Publish Job
                        </span>
                      </button>
                    )}
                    
                    {job.status === 'active' && (
                      <button 
                        onClick={() => handleStatusChange(job._id, 'closed')}
                        className="block w-full text-left px-4 py-3 text-sm text-orange-700 hover:bg-orange-50 transition-colors duration-150"
                      >
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Close Applications
                        </span>
                      </button>
                    )}
                    
                    {(job.status === 'draft' || job.status === 'active') && (
                      <button 
                        onClick={() => handleStatusChange(job._id, 'cancelled')}
                        className="block w-full text-left px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100 mt-1"
                      >
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Job
                        </span>
                      </button>
                    )}
                  </div>
                </div>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-6 text-gray-600">
            <span>{job.applicationsCount || 0} Applications</span>
            <span>•</span>
            <span>
              {job.filledPositions || 0} / {job.totalPositions || 0} Positions Filled
            </span>
            <span>•</span>
            <button 
              onClick={() => {
                setSelectedJob({ id: job._id, title: job.title });
                setApplicationsModalOpen(true);
              }}
              className="text-[#0077B6] hover:underline"
            >
              View Applications
            </button>
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#03045E]">Manage Jobs</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage your job postings</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors font-medium"
        >
          Post New Job
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">Filter by status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Mobile-friendly responsive layout */}
          <div className="lg:flex lg:items-center lg:justify-end lg:space-x-2">
            <button 
              onClick={() => statusFilter === 'completed' ? fetchCompletedJobs(true) : fetchJobs(true)} 
              disabled={refreshing}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50 transition-colors duration-200 w-full lg:w-auto justify-center lg:justify-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                className="ml-2 text-red-500 hover:text-red-700 underline" 
                onClick={() => statusFilter === 'completed' ? fetchCompletedJobs() : fetchJobs()}
              >
                Try again
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] ${
                  statusFilter === 'all' 
                    ? 'bg-[#0077B6] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] ${
                  statusFilter === 'active' 
                    ? 'bg-[#0077B6] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatusFilter('draft')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] ${
                  statusFilter === 'draft' 
                    ? 'bg-[#0077B6] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                Drafts
              </button>
              <button 
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] ${
                  statusFilter === 'closed' 
                    ? 'bg-[#0077B6] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                Closed
              </button>
              <button 
                onClick={() => setStatusFilter('filled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] border-2 relative overflow-hidden ${
                  statusFilter === 'filled' 
                    ? 'bg-blue-600 text-white shadow-lg border-blue-600 transform scale-105' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 hover:shadow-md hover:text-blue-800 border-gray-300'
                }`}
              >
                <span className="relative z-10">Filled</span>
                {statusFilter !== 'filled' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
                )}
              </button>
              <button 
                onClick={() => setStatusFilter('in_progress')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[100px] ${
                  statusFilter === 'in_progress' 
                    ? 'bg-[#0077B6] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                In Progress
              </button>
              <button 
                onClick={() => setStatusFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[100px] ${
                  statusFilter === 'completed' 
                    ? 'bg-[#0077B6] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              Array(3).fill(0).map((_, index) => <JobSkeleton key={index} />)
            ) : ((statusFilter === 'completed' ? completedGigs : jobs).length === 0) ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">
                  {statusFilter === 'completed' ? 'No completed jobs found' : 'No jobs found'}
                </p>
                {statusFilter !== 'all' && (
                  <button 
                    className="mt-2 text-[#0077B6] hover:underline" 
                    onClick={() => setStatusFilter('all')}
                  >
                    Show all jobs
                  </button>
                )}
              </div>
            ) : (
              renderJobs()
            )}
          </div>
        </div>
      </div>

      {/* Job Post Modal */}
      <JobPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          setStatusFilter('all');
          setError(null);
          setTimeout(() => {
            fetchJobs(true);
          }, 500);
        }}
      />

      {/* Applications Modal */}
      {selectedJob && (
        <ApplicationsModal
          isOpen={applicationsModalOpen}
          onClose={() => {
            setApplicationsModalOpen(false);
            setSelectedJob(null);
          }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
        />
      )}
    </div>
  );
}
