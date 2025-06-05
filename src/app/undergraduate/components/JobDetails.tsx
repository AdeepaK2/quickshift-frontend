'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaBuilding, FaArrowLeft } from 'react-icons/fa';

interface JobDetailsProps {
  jobId: string;
  onBack: () => void;
}

export default function JobDetails({ jobId, onBack }: JobDetailsProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API call
  const job = {
    id: jobId,
    title: 'Event Staff',
    company: 'EventPro Solutions',
    location: 'Colombo',
    salary: 'LKR 2,000/hour',
    type: 'Part-time',
    postedDate: '2024-03-20',
    description: 'Looking for energetic individuals to assist with event setup and management.',
    requirements: [
      'Excellent communication skills',
      'Ability to work in a fast-paced environment',
      'Flexible schedule',
      'Previous event experience preferred but not required',
    ],
    benefits: [
      'Competitive hourly rate',
      'Flexible hours',
      'On-the-job training',
      'Networking opportunities',
    ],
  };

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, [jobId]);

  const handleApply = async () => {
    setIsApplying(true);
    setApplicationStatus('submitting');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApplicationStatus('success');
    } catch (error) {
      setApplicationStatus('error');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center text-[#0077B6] hover:text-[#00B4D8] mb-6 transition-colors duration-200"
      >
        <FaArrowLeft className="mr-2" />
        Back to Jobs
      </button>

      {/* Job Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#03045E] mb-2">{job.title}</h1>
            <p className="text-xl text-gray-600">{job.company}</p>
          </div>
          <span className="px-5 py-2.5 bg-[#CAF0F8] text-[#0077B6] rounded-full text-sm font-medium">
            {job.type}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-6 text-gray-600">
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-3 text-[#0077B6] text-lg" />
            <span className="text-lg">{job.location}</span>
          </div>
          <div className="flex items-center">
            <FaMoneyBillWave className="mr-3 text-[#0077B6] text-lg" />
            <span className="text-lg">{job.salary}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-3 text-[#0077B6] text-lg" />
            <span className="text-lg">Posted {new Date(job.postedDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-2xl font-semibold text-[#03045E] mb-6">Job Description</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">{job.description}</p>

            <h3 className="text-xl font-semibold text-[#03045E] mb-4">Requirements</h3>
            <ul className="space-y-3 mb-8">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#0077B6] mr-3 mt-1">•</span>
                  <span className="text-gray-600 text-lg">{req}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-xl font-semibold text-[#03045E] mb-4">Benefits</h3>
            <ul className="space-y-3">
              {job.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-[#0077B6] mr-3 mt-1">•</span>
                  <span className="text-gray-600 text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Application Section */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-8 sticky top-6">
            <h2 className="text-2xl font-semibold text-[#03045E] mb-6">Apply Now</h2>
            
            {applicationStatus === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800 mb-2">Application Submitted!</h3>
                <p className="text-green-600">We'll review your application and get back to you soon.</p>
              </div>
            ) : applicationStatus === 'error' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-red-800 mb-2">Application Failed</h3>
                <p className="text-red-600">Please try again or contact support if the problem persists.</p>
                <button
                  onClick={handleApply}
                  className="mt-4 w-full py-3 px-4 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className={`w-full py-4 px-6 rounded-lg text-white font-medium text-lg transition-all duration-200 ${
                  isApplying
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#0077B6] hover:bg-[#00B4D8] hover:shadow-lg'
                }`}
              >
                {isApplying ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Apply Now'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 