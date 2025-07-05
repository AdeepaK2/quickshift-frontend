'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { gigApplyService, GigApplication, GigApplicationsFilters } from '@/services/gigApplyService';
import { gigRequestService } from '@/services/gigRequestService';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
  const [selectedApplication, setSelectedApplication] = useState<GigApplication | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch jobs for filter dropdown
    const fetchJobs = async () => {
      try {
        const response = await gigRequestService.getGigRequests({
          status: 'active',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        
        if (response.success && Array.isArray(response.data)) {
          setJobs(response.data.map(job => ({ 
            _id: job._id, 
            title: job.title 
          })));
        } else {
          console.error('Failed to fetch jobs or invalid response format:', response);
          // Set empty array to prevent map errors
          setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs for filter:', err);
        // Set empty array to prevent map errors
        setJobs([]);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.status-dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await gigApplyService.getApplications(filters);
      
      if (response.success && response.data) {
        // Filter out applications with null or missing user data
        const validApplications = response.data.applications.filter(app => app.user !== null && app.user !== undefined);
        setApplications(validApplications);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('An error occurred while fetching applications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      
      // Show success toast message
      const application = applications.find(app => app._id === applicationId);
      const applicantName = application?.user ? `${application.user.firstName} ${application.user.lastName}` : 'Applicant';
      
      if (newStatus === 'accepted') {
        toast.success(`✅ Application accepted! ${applicantName} has been successfully accepted for this position.`);
      } else if (newStatus === 'rejected') {
        toast.error(`❌ Application rejected. ${applicantName}'s application has been declined.`);
      } else if (newStatus === 'reviewed') {
        toast.success(`👁️ Application marked as reviewed for ${applicantName}.`);
      }
      
      // Close dropdown
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error('Failed to update application status. Please try again.');
    }
  };

  const openProfileModal = (application: GigApplication) => {
    if (!application.user) {
      console.warn('Cannot open profile modal: user data is missing');
      return;
    }
    setSelectedApplication(application);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setSelectedApplication(null);
    setShowProfileModal(false);
  };

  const toggleDropdown = (applicationId: string) => {
    setOpenDropdownId(openDropdownId === applicationId ? null : applicationId);
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
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
              <button 
                onClick={() => fetchApplications(true)} 
                disabled={refreshing}
                className="flex items-center space-x-1 bg-white text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg border border-gray-300 hover:bg-blue-50 focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
              <button 
                className="ml-2 text-red-500 hover:text-red-700 underline" 
                onClick={() => fetchApplications()}
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
                        {application.user ? 
                          `${application.user.firstName || 'N/A'} ${application.user.lastName || 'N/A'}` : 
                          'User not found'
                        }
                      </h4>
                      <p className="text-gray-600 mt-1">Applied for: {application.gigRequest?.title || 'Unknown Job'}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied {formatAppliedDate(application.createdAt)}
                      </p>
                      {application.user?.rating !== undefined && (
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
                      <div className="relative status-dropdown">
                        <button
                          onClick={() => toggleDropdown(application._id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusClass(application.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          {application.status}
                          {application.status === 'pending' && (
                            <span className="ml-1 text-xs">▼</span>
                          )}
                        </button>
                        
                        {/* Status change dropdown */}
                        {application.status === 'pending' && openDropdownId === application._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
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
                        onClick={() => openProfileModal(application)}
                        className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors text-sm"
                        disabled={!application.user}
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

      {/* Profile Modal */}
      {showProfileModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Applicant Profile
                </h3>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedApplication.user ? (
                <>
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedApplication.user.firstName || 'N/A'} {selectedApplication.user.lastName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.user.email || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">University</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedApplication.user.university || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Faculty</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedApplication.user.faculty || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedApplication.user.yearOfStudy || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Application Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {formatAppliedDate(selectedApplication.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  {selectedApplication.user.rating !== undefined && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Rating</h4>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-[#0077B6]">
                          {selectedApplication.user.rating.toFixed(1)}
                        </span>
                        <span className="text-blue-400 ml-1 text-2xl">★</span>
                        <span className="text-gray-600 ml-2">out of 5</span>
                      </div>
                    </div>
                  )}

                  {/* Bio */}
                  {selectedApplication.user.bio && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Bio</h4>
                      <p className="text-sm text-gray-900">{selectedApplication.user.bio}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">User information is not available</p>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Cover Letter</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                </div>
              )}

              {/* Job Applied For */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Job Applied For</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900">{selectedApplication.gigRequest.title}</h5>
                  <p className="text-sm text-blue-700 mt-1">
                    Status: {selectedApplication.gigRequest.status}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Application Status: {selectedApplication.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedApplication.status === 'pending' && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleStatusChange(selectedApplication._id, 'rejected');
                    closeProfileModal();
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleStatusChange(selectedApplication._id, 'accepted');
                    closeProfileModal();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
