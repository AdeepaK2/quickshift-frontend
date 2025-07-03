'use client';

import React, { useState, useEffect } from 'react';
import { FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaMapMarkerAlt } from 'react-icons/fa';
import { gigApplicationService } from '@/services/gigApplicationService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface GigRequest {
  _id: string;
  title: string;
  employer: {
    _id?: string;
    companyName: string;
    logo?: string;
  } | string;
  location: {
    address: string;
    city: string;
  } | string;
  payRate: {
    amount: number;
    rateType: string;
  };
}

interface GigApplication {
  _id: string;
  gigRequest: GigRequest | string;
  appliedAt: string;
  status: string;
  employerFeedback?: string;
  interviewDetails?: {
    date: string;
    time?: string;
    location?: string;
    notes?: string;
  };
}

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  employerName: string;
  appliedDate: string;
  status: string;
  location: string;
  pay?: string;
  message?: string;
  interviewDate?: string;
}

// Convert backend GigApplication to frontend Application format
const convertToApplication = (gigApplication: GigApplication): Application => {
  const gigRequest = gigApplication.gigRequest;
  const status = gigApplication.status.charAt(0).toUpperCase() + gigApplication.status.slice(1);
  let location = 'Location not specified';
  let pay: string | undefined;

  if (typeof gigRequest !== 'string') {
    if (typeof gigRequest.location === 'object') {
      location = `${gigRequest.location.address}, ${gigRequest.location.city}`;
    }
    
    if (gigRequest.payRate) {
      pay = `LKR ${gigRequest.payRate.amount} ${
        gigRequest.payRate.rateType === 'hourly' ? 'per hour' :
        gigRequest.payRate.rateType === 'daily' ? 'per day' : 'fixed'
      }`;
    }
  }
  
  return {
    id: gigApplication._id,
    jobId: typeof gigRequest === 'string' ? gigRequest : gigRequest._id,
    jobTitle: typeof gigRequest === 'string' ? 'Unknown Job' : gigRequest.title,
    employerName: typeof gigRequest === 'string' ? 'Unknown Employer' : 
      typeof gigRequest.employer === 'string' ? 'Unknown Employer' : gigRequest.employer.companyName,
    appliedDate: formatDistanceToNow(new Date(gigApplication.appliedAt), { addSuffix: true }),
    status,
    location,
    pay,
    message: gigApplication.employerFeedback,
    interviewDate: gigApplication.interviewDetails?.date
  };
};

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'interview'>('all');
  
  useEffect(() => {
    // Fetch applications from backend
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Map frontend filter to backend filter
        let statusFilter: 'applied' | 'shortlisted' | 'hired' | 'rejected' | 'all' = 'all';
        switch (filter) {
          case 'pending': statusFilter = 'applied'; break;
          case 'interview': statusFilter = 'shortlisted'; break;
          case 'accepted': statusFilter = 'hired'; break;
          case 'rejected': statusFilter = 'rejected'; break;
          default: statusFilter = 'all'; break;
        }
        
        const response = await gigApplicationService.getMyApplications({
          status: statusFilter === 'all' ? undefined : statusFilter,
          sortBy: 'appliedAt',
          sortOrder: 'desc'
        });
        
        if (response.success && response.data?.applications) {
          // Convert backend format to frontend format
          const convertedApplications = response.data.applications.map(convertToApplication);
          setApplications(convertedApplications);
        } else {
          setApplications([]);
          toast.error('Failed to load applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error loading your applications');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [filter]);

  // Mock data for development
  React.useEffect(() => {
    const mockApplications: Application[] = [
      {
        id: '1',
        jobId: 'job1',
        jobTitle: 'Campus Event Setup Assistant',
        employerName: 'UC Student Union',
        appliedDate: '2024-01-15',
        status: 'accepted' as const,
        location: 'University of Colombo',
        pay: 'LKR 2,000',
        message: 'Great application! Please arrive 30 minutes early.'
      },
      {
        id: '2',
        jobId: 'job2',
        jobTitle: 'Library Book Sorting',
        employerName: 'Colombo Public Library',
        appliedDate: '2024-01-14',
        status: 'pending' as const,
        location: 'Central Library, Colombo',
        pay: 'LKR 3,000'
      },
      {
        id: '3',
        jobId: 'job3',
        jobTitle: 'Research Assistant',
        employerName: 'Computer Science Department',
        appliedDate: '2024-01-13',
        status: 'interview' as const,
        location: 'University of Colombo',
        pay: 'LKR 5,000',
        interviewDate: '2024-01-20'
      },
      {
        id: '4',
        jobId: 'job4',
        jobTitle: 'Food Delivery Helper',
        employerName: 'Campus Eats',
        appliedDate: '2024-01-12',
        status: 'rejected' as const,
        location: 'Nugegoda Area',
        pay: 'LKR 1,800',
        message: 'Thank you for your interest. We found a more suitable candidate.'
      }
    ];

    setTimeout(() => {
      setApplications(mockApplications);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      case 'interview': return <FaEye className="text-blue-500" />;
      default: return <FaClock className="text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'interview': return 'bg-quickshift-light text-quickshift-primary';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      interview: applications.filter(app => app.status === 'interview').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaClipboardList className="text-blue-600 text-2xl mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Applications', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'accepted', label: 'Accepted', count: statusCounts.accepted },
            { key: 'interview', label: 'Interview', count: statusCounts.interview },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-quickshift-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaClipboardList className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Start browsing jobs and apply to begin your gig journey!'
                : `You don't have any ${filter} applications at the moment.`}
            </p>
            {filter === 'all' && (
              <button className="bg-quickshift-primary text-white px-6 py-2 rounded-lg hover:bg-quickshift-secondary transition-colors">
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          filteredApplications.map(application => (
            <div key={application.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {application.jobTitle}
                    </h3>
                    <p className="text-gray-600 mb-2">{application.employerName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {application.location}
                      </div>
                      <div className="font-semibold text-green-600">
                        {application.pay}
                      </div>
                      <div>
                        Applied: {new Date(application.appliedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(application.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Additional Info Based on Status */}
                {application.status === 'interview' && application.interviewDate && (
                  <div className="bg-quickshift-light border border-quickshift-tertiary rounded-lg p-3 mb-4">
                    <div className="flex items-center text-blue-800">
                      <FaEye className="mr-2" />
                      <span className="font-medium">Interview Scheduled</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      Date: {new Date(application.interviewDate).toLocaleDateString()} at 2:00 PM
                    </p>
                  </div>
                )}

                {application.message && (
                  <div className={`rounded-lg p-3 ${
                    application.status === 'accepted' 
                      ? 'bg-green-50 border border-green-200' 
                      : application.status === 'rejected'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <p className={`text-sm ${
                      application.status === 'accepted' 
                        ? 'text-green-800' 
                        : application.status === 'rejected'
                        ? 'text-red-800'
                        : 'text-gray-700'
                    }`}>
                      <strong>Message from employer:</strong> {application.message}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View Job Details
                </button>
                <div className="space-x-2">
                  {application.status === 'accepted' && (
                    <button className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                      Mark as Completed
                    </button>
                  )}
                  {application.status === 'pending' && (
                    <button className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      Withdraw Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyApplications;
