'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaUser, FaStar, FaCalendarAlt, FaBuilding, FaGraduationCap, FaPhone, FaEnvelope, FaTasks, FaCheckCircle } from 'react-icons/fa';
import { gigRequestService, GigRequest } from '@/services/gigRequestService';
import toast from 'react-hot-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface JobDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, jobId }) => {
  const [job, setJob] = useState<GigRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetails();
    }
  }, [isOpen, jobId]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await gigRequestService.getGigRequestById(jobId);
      
      if (response.success && response.data) {
        setJob(response.data);
      } else {
        setError('Failed to load job details');
        toast.error('Failed to load job details');
      }
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('An error occurred while loading job details');
      toast.error('An error occurred while loading job details');
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (location: any) => {
    if (typeof location === 'string') return location;
    if (location && typeof location === 'object') {
      if (location.address && location.city) {
        return `${location.address}, ${location.city}`;
      }
      return location.city || location.address || 'Location not specified';
    }
    return 'Location not specified';
  };

  const formatPayRate = (payRate: any) => {
    if (!payRate) return 'Pay not specified';
    if (typeof payRate === 'object' && payRate.amount) {
      const rateType = payRate.rateType || 'fixed';
      const typeText = rateType === 'hourly' ? 'per hour' : 
                      rateType === 'daily' ? 'per day' : 'fixed';
      return `LKR ${payRate.amount.toLocaleString()} ${typeText}`;
    }
    return 'Pay not specified';
  };

  const formatEmployer = (employer: any) => {
    if (typeof employer === 'string') return employer;
    if (employer && typeof employer === 'object') {
      return employer.companyName || employer.name || 'Unknown Employer';
    }
    return 'Unknown Employer';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'filled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 h-full" 
          onClick={onClose}
        />
        
        {/* Right Side Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white shadow-xl w-full max-w-2xl md:max-w-xl lg:max-w-2xl h-full overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close job details"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              // Loading skeleton
              <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-gray-200 rounded"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : error ? (
              // Error state
              <div className="text-center py-8">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Job Details</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchJobDetails}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : job ? (
              // Job details content
              <div className="space-y-6">
                {/* Job Header */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                      <div className="flex items-center space-x-4 text-gray-600 mb-4">
                        <div className="flex items-center">
                          <FaBuilding className="mr-2" />
                          {formatEmployer(job.employer)}
                        </div>
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="mr-2" />
                          {formatLocation(job.location)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                        {formatStatus(job.status)}
                      </span>
                      {job.createdAt && (
                        <span className="text-sm text-gray-500">
                          Posted {formatDistanceToNow(parseISO(job.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Info Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaDollarSign className="text-green-600 mr-2" />
                        <div>
                          <div className="font-semibold text-green-800">Payment</div>
                          <div className="text-sm text-green-600">{formatPayRate(job.payRate)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaUser className="text-blue-600 mr-2" />
                        <div>
                          <div className="font-semibold text-blue-800">Positions</div>
                          <div className="text-sm text-blue-600">
                            {job.filledPositions || 0} / {job.totalPositions || 1} filled
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaGraduationCap className="text-purple-600 mr-2" />
                        <div>
                          <div className="font-semibold text-purple-800">Category</div>
                          <div className="text-sm text-purple-600">{job.category}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                    <FaTasks className="mr-2 text-blue-600" />
                    Job Description
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <FaCheckCircle className="mr-2 text-green-600" />
                      Requirements
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <ul className="space-y-2">
                        {job.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Time Slots */}
                {job.timeSlots && job.timeSlots.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <FaClock className="mr-2 text-orange-600" />
                      Schedule
                    </h3>
                    <div className="space-y-3">
                      {job.timeSlots.map((slot, index) => (
                        <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-orange-800">
                                {new Date(slot.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-orange-600">
                                {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="text-sm text-orange-700">
                              {slot.peopleAssigned || 0} / {slot.peopleNeeded} assigned
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employer Information */}
                {typeof job.employer === 'object' && job.employer && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <FaBuilding className="mr-2 text-indigo-600" />
                      Employer Information
                    </h3>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="font-medium text-indigo-800">Company</div>
                          <div className="text-indigo-600">{job.employer.companyName}</div>
                        </div>
                        {/* Note: email and contactNumber not available in basic employer object */}
                        {/* These fields might be available when the employer is fully populated */}
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Deadline */}
                {job.applicationDeadline && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-yellow-600 mr-2" />
                      <div>
                        <div className="font-medium text-yellow-800">Application Deadline</div>
                        <div className="text-yellow-600">
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // No job found
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Job Not Found</h3>
                <p className="text-gray-600">The job details could not be found or may have been removed.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sticky bottom-0">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default JobDetailsModal;
