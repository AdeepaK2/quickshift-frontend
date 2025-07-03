'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gigRequestService, GigRequest } from '@/services/gigRequestService';
import { format } from 'date-fns';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const [refreshing, setRefreshing] = useState(false);

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
      
      if (statusFilter !== 'all') {
        filters.status = statusFilter as 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
      }
      
      const response = await gigRequestService.getGigRequests(filters);
      
      if (response.success && response.data) {
        setJobs(response.data.gigRequests);
      } else {
        setError(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('An error occurred while fetching jobs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: 'active' | 'closed' | 'draft' | 'cancelled') => {
    try {
      await gigRequestService.changeGigRequestStatus(jobId, newStatus);
      // Update the job in the local state
      setJobs(prevJobs => prevJobs.map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
    } catch (err) {
      console.error('Error changing job status:', err);
      // Show error notification
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
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'draft':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#03045E]">Manage Jobs</h1>
          <p className="text-gray-600 mt-2">Create, edit, and manage your job postings</p>
        </div>
        <button 
          onClick={() => router.push('/employer/jobs/new')}
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
          
          <button 
            onClick={() => fetchJobs(true)} 
            disabled={refreshing}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                className="ml-2 text-red-500 hover:text-red-700 underline" 
                onClick={() => fetchJobs()}
              >
                Try again
              </button>
            </div>
          )}

          <div className="flex justify-between mb-6">
            <div className="flex space-x-2">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'all' 
                    ? 'bg-[#0077B6] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'active' 
                    ? 'bg-[#0077B6] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setStatusFilter('draft')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'draft' 
                    ? 'bg-[#0077B6] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Drafts
              </button>
              <button 
                onClick={() => setStatusFilter('closed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === 'closed' 
                    ? 'bg-[#0077B6] text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Closed
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              // Show loading skeletons
              Array(3).fill(0).map((_, index) => <JobSkeleton key={index} />)
            ) : jobs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No jobs found</p>
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
              // Render jobs
              jobs.map((job) => (
                <div key={job._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-[#03045E]">{job.title}</h3>
                      <p className="text-gray-600 mt-2">
                        {job.location.city} • {job.category} • {formatPayRate(job.payRate)}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Posted on {getPostedDate(job.createdAt)}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border capitalize ${getStatusClass(job.status)}`}>
                        {job.status}
                      </span>
                      <div className="relative group">
                        <button className="text-[#0077B6] hover:text-[#00B4D8] font-medium">Actions</button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                          <button 
                            onClick={() => router.push(`/employer/jobs/${job._id}`)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => router.push(`/employer/jobs/${job._id}/edit`)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          {job.status === 'draft' && (
                            <button 
                              onClick={() => handleStatusChange(job._id, 'active')}
                              className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                            >
                              Publish
                            </button>
                          )}
                          {job.status === 'active' && (
                            <button 
                              onClick={() => handleStatusChange(job._id, 'closed')}
                              className="block w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-gray-100"
                            >
                              Close Applications
                            </button>
                          )}
                          {(job.status === 'draft' || job.status === 'active') && (
                            <button 
                              onClick={() => handleStatusChange(job._id, 'cancelled')}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                            >
                              Cancel Job
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center space-x-6 text-gray-600">
                    <span>{job.applicationsCount || 0} Applications</span>
                    <span>•</span>
                    <button 
                      onClick={() => router.push(`/employer/jobs/${job._id}/applications`)}
                      className="text-[#0077B6] hover:underline"
                    >
                      View Applications
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
