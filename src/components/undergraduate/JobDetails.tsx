'use client';

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaUser, FaStar, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import ApplicationPopup from './ApplicationPopup';
import { jobApplicationService } from '@/services/jobApplicationService';
import { toast } from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  pay: string;
  postedDate: string;
  category: string;
  urgency: 'low' | 'medium' | 'high';
  employer: {
    name: string;
    rating: number;
    totalJobs?: number;
    description?: string;
  };
  requirements?: string[];
  responsibilities?: string[];
  deadline?: string;
}

interface JobDetailsProps {
  job: Job | null;
  onApply?: (jobId: string) => void;
  onClose?: () => void;
  userId?: string;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, onApply, onClose, userId }) => {
  // Add state for popup visibility
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FaExclamationTriangle className="mx-auto text-gray-400 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a job to view details</h3>
        <p className="text-gray-500">Choose a job from the list to see more information.</p>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      default: return '🟢';
    }
  };

  // Handler for application submission
  const handleApplicationSubmit = async (coverLetter: string, resume: File | null) => {
    if (!userId) {
      toast.error('You must be logged in to apply');
      setIsPopupOpen(false);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting application with user ID:', userId);
      
      // Create application request object (userId is extracted from auth token on backend)
      const applicationData = {
        coverLetter: coverLetter
      };

      // Check if the application service thinks we're logged in
      if (!jobApplicationService.isLoggedIn()) {
        console.warn('JobApplicationService reports user is not logged in');
        toast.error('Authentication issue. Please log out and log back in.');
        return;
      }

      // Call the application service
      const response = await jobApplicationService.applyDirectly(job.id, applicationData);

      if (response.success) {
        toast.success('Application submitted successfully!');
        setIsPopupOpen(false);
        
        // Call the onApply prop if provided to update parent component
        if (onApply) {
          onApply(job.id);
        }
      } else {
        toast.error(response.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Application error:', error);
      toast.error('An error occurred while submitting your application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <FaUser className="mr-1" />
                {job.employer.name}
              </div>
              <div className="flex items-center">
                <FaStar className="mr-1 text-blue-500" />
                {job.employer.rating} ({job.employer.totalJobs || 5} jobs posted)
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
              {getUrgencyIcon(job.urgency)} {job.urgency.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FaDollarSign className="mx-auto text-green-600 mb-1" />
            <div className="font-semibold text-green-600">{job.pay}</div>
            <div className="text-xs text-gray-500">Payment</div>
          </div>
          <div className="text-center">
            <FaClock className="mx-auto text-blue-600 mb-1" />
            <div className="font-semibold">{job.duration}</div>
            <div className="text-xs text-gray-500">Duration</div>
          </div>
          <div className="text-center">
            <FaMapMarkerAlt className="mx-auto text-red-600 mb-1" />
            <div className="font-semibold">{job.location}</div>
            <div className="text-xs text-gray-500">Location</div>
          </div>
          <div className="text-center">
            <FaCalendarAlt className="mx-auto text-purple-600 mb-1" />
            <div className="font-semibold">{job.postedDate}</div>
            <div className="text-xs text-gray-500">Posted</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
          <p className="text-gray-700 leading-relaxed">{job.description}</p>
        </section>

        {/* Responsibilities */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h2>
          <ul className="space-y-2">
            {(job.responsibilities || [
              'Complete assigned tasks within the specified timeframe',
              'Maintain professional communication with the employer',
              'Follow safety guidelines and instructions provided',
              'Report progress and any issues promptly'
            ]).map((responsibility, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2 mt-1">✓</span>
                <span className="text-gray-700">{responsibility}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
          <ul className="space-y-2">
            {(job.requirements || [
              'Currently enrolled as an undergraduate student',
              'Reliable and punctual',
              'Good communication skills',
              'Physical ability to perform required tasks'
            ]).map((requirement, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2 mt-1">•</span>
                <span className="text-gray-700">{requirement}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Employer Info */}
        <section className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">About the Employer</h2>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-quickshift-primary rounded-full flex items-center justify-center text-white font-bold">
              {job.employer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{job.employer.name}</h3>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <FaStar className="text-blue-500 mr-1" />
                {job.employer.rating} rating • {job.employer.totalJobs || 5} jobs posted
              </div>
              <p className="text-gray-700 text-sm">
                {job.employer.description || 'Verified employer with a track record of reliable payments and clear job descriptions.'}
              </p>
            </div>
          </div>
        </section>

        {/* Deadline Warning */}
        {job.deadline && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaCalendarAlt className="text-orange-600 mr-2" />
              <span className="font-medium text-orange-800">Application Deadline: {job.deadline}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to List
        </button>
        <button
          onClick={() => {
            console.log('Apply button clicked. Auth status:', {
              userId: userId,
              hasUserId: !!userId,
              isLoggedInService: jobApplicationService.isLoggedIn(),
              localStorageToken: !!localStorage.getItem('accessToken'),
              cookieToken: !!document.cookie.includes('accessToken')
            });
            
            if (!userId) {
              toast.error('You must be logged in to apply');
              return;
            }
            setIsPopupOpen(true);
          }}
          className="px-6 py-2 bg-quickshift-primary text-white rounded-lg hover:bg-quickshift-secondary transition-colors font-medium"
        >
          Apply for This Job
        </button>
      </div>

      {/* Application Popup */}
      <ApplicationPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSubmit={handleApplicationSubmit}
        jobTitle={job.title}
        companyName={job.employer.name}
      />
    </div>
  );
};

export default JobDetails;
