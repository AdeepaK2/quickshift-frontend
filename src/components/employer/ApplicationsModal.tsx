'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  UserGroupIcon, 
  EyeIcon,
  CheckIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { gigApplyService, GigApplication } from '@/services/gigApplyService';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export default function ApplicationsModal({ isOpen, onClose, jobId, jobTitle }: ApplicationsModalProps) {
  const [applications, setApplications] = useState<GigApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<GigApplication | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchApplications();
    }
  }, [isOpen, jobId]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gigApplyService.getApplicationsForGigRequest(jobId);
      
      if (response.success && response.data) {
        setApplications(response.data.applications || []);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('An error occurred while fetching applications');
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

  const openProfileModal = (application: GigApplication) => {
    setSelectedApplication(application);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setSelectedApplication(null);
    setShowProfileModal(false);
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
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'accepted':
        return <CheckIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
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

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="applications-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white rounded-l-xl shadow-xl w-full max-w-2xl h-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <UserGroupIcon className="w-6 h-6 text-[#0077B6] mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Applications</h2>
                  <p className="text-sm text-gray-600">{jobTitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-[calc(100vh-200px)]">
              {loading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-100 rounded-lg p-4 h-24"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <XCircleIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Applications</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button 
                    onClick={fetchApplications}
                    className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12">
                  <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-500">This job hasn't received any applications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div
                      key={application._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {application.user?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {application.user?.firstName} {application.user?.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{application.user?.email}</p>
                            <p className="text-xs text-gray-500">
                              Applied {formatAppliedDate(application.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="capitalize">{application.status}</span>
                          </div>
                          <button
                            onClick={() => openProfileModal(application)}
                            className="px-3 py-1 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors text-sm flex items-center space-x-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          {application.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStatusChange(application._id, 'accepted')}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(application._id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {applications.length} {applications.length === 1 ? 'application' : 'applications'} total
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence mode="wait">
        {showProfileModal && selectedApplication && (
          <motion.div
            key="profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
          >
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
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.user.university || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedApplication.user.yearOfStudy || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {selectedApplication.coverLetter && (
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Cover Letter</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* Application Details */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Application Details</h4>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-blue-700 mt-1">
                        Applied: {formatAppliedDate(selectedApplication.createdAt)}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Status: {selectedApplication.status}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">User information not available</p>
                </div>
              )}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
