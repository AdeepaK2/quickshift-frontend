'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { gigApplyService, GigApplication, GigApplicationsFilters } from '@/services/gigApplyService';
import { gigRequestService } from '@/services/gigRequestService';

// Loading skeleton component
const ApplicationSkeleton = () => (
  <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-1/2">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/6"></div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-28"></div>
      </div>
    </div>
  </div>
);

export default function ApplicantsManagement() {
  const router = useRouter();
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<{_id: string, title: string}[]>([]);
  const [filters, setFilters] = useState<GigApplicationsFilters>({
    status: undefined,
    gigRequestId: undefined
  });

  useEffect(() => {
    // Fetch jobs for filter dropdown
    const fetchJobs = async () => {
      try {
        const response = await gigRequestService.getGigRequests({
          status: 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (response.success && response.data) {
          setJobs(response.data.gigRequests.map(job => ({ 
            _id: job._id, 
            title: job.title 
          })));
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };

    fetchJobs();
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gigApplyService.getApplications(filters);
      
      if (response.success && response.data) {
        setApplications(response.data.applications);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('An error occurred while fetching applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: 'reviewed' | 'accepted' | 'rejected') => {
    try {
      await gigApplyService.updateApplicationStatus(applicationId, { status: newStatus });
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };

  const formatAppliedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'reviewed':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'withdrawn':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleFilterChange = (type: 'job' | 'status', value: string) => {
    if (type === 'job') {
      setFilters(prev => ({
        ...prev,
        gigRequestId: value === 'all' ? undefined : value
      }));
    } else if (type === 'status') {
      setFilters(prev => ({
        ...prev,
        status: value === 'all' ? undefined : value as GigApplicationsFilters['status']
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#03045E]">Applicants Management</h1>
        <p className="text-gray-600 mt-2">Review and manage job applications</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#03045E]">Recent Applications</h3>
            <div className="flex space-x-3">
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                onChange={(e) => handleFilterChange('job', e.target.value)}
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
              <select 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Hired</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                className="ml-2 text-red-500 hover:text-red-700 underline" 
                onClick={fetchApplications}
              >
                Try again
              </button>
            </div>
          )}

          <div className="space-y-4">
            {loading ? (
              // Show loading skeletons
              Array(4).fill(0).map((_, index) => <ApplicationSkeleton key={index} />)
            ) : applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-lg">No applications found</p>
                {(filters.status || filters.gigRequestId) && (
                  <button 
                    className="mt-2 text-[#0077B6] hover:underline" 
                    onClick={() => setFilters({})}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              // Render applications
              applications.map((application) => (
                <div key={application._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-[#03045E]">
                        {application.user.firstName} {application.user.lastName}
                      </h4>
                      <p className="text-gray-600 mt-1">Applied for: {application.gigRequest.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied {formatAppliedDate(application.createdAt)}
                      </p>
                      {application.user.rating !== undefined && (
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-gray-600">Rating: </span>
                          <span className="text-sm font-semibold text-[#0077B6] ml-1">
                            {application.user.rating.toFixed(1)}
                          </span>
                          <span className="text-blue-400 ml-1">★</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="relative group">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClass(application.status)}`}>
                          {application.status}
                        </span>
                        
                        {/* Status change dropdown */}
                        {application.status === 'pending' && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                            <button 
                              onClick={() => handleStatusChange(application._id, 'reviewed')}
                              className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100"
                            >
                              Mark as Reviewed
                            </button>
                            <button 
                              onClick={() => handleStatusChange(application._id, 'accepted')}
                              className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                            >
                              Accept Application
                            </button>
                            <button 
                              onClick={() => handleStatusChange(application._id, 'rejected')}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                            >
                              Reject Application
                            </button>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => router.push(`/employer/applicants/${application._id}`)}
                        className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors text-sm"
                      >
                        View Profile
                      </button>
                    </div>
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
