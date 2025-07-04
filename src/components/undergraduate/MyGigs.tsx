'use client';

import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaClock, FaMapMarkerAlt, FaDollarSign, FaCheckCircle, FaSpinner, FaCalendarAlt, FaStar, FaPlay, FaStop } from 'react-icons/fa';
import { gigCompletionService, GigCompletion } from '@/services/gigCompletionService';
import { gigApplicationService, GigApplication } from '@/services/gigApplicationService';
import { format } from 'date-fns';

interface FormattedGig {
  id: string;
  applicationId?: string; // For tracking the application
  title: string;
  description: string;
  employer: {
    name: string;
    rating: number;
  };
  location: string;
  startDate: string;
  endDate: string;
  duration: string;
  pay: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'cancelled' | 'filled';
  jobStatus?: 'draft' | 'active' | 'filled' | 'in_progress' | 'completed' | 'closed' | 'cancelled'; // Job's actual status
  progress?: number;
  completedTasks?: string[];
  totalTasks?: string[];
  rating?: number;
  feedback?: string;
  totalHours?: number;
  paymentStatus?: string;
  positions?: {
    filled: number;
    total: number;
  };
}

const MyGigs: React.FC = (): React.ReactElement => {
  const [gigs, setGigs] = useState<FormattedGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'filled' | 'in-progress' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAllMyGigs();
  }, []);

  const fetchAllMyGigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both completed gigs and accepted applications in parallel
      const [completedResponse, acceptedResponse] = await Promise.all([
        gigCompletionService.getMyCompletedGigs({
          sortBy: 'completedAt',
          sortOrder: 'desc',
          limit: 50
        }),
        gigApplicationService.getMyAcceptedGigs({
          sortBy: 'appliedAt',
          sortOrder: 'desc',
          limit: 50
        })
      ]);
      
      const allGigs: FormattedGig[] = [];
      
      // Add completed gigs
      if (completedResponse.success && completedResponse.data) {
        const completedGigs = completedResponse.data.completions.map(convertCompletionToGig);
        allGigs.push(...completedGigs);
      }
      
      // Add accepted gigs (filter out those that are already completed)
      if (acceptedResponse.success && acceptedResponse.data) {
        const acceptedGigs = acceptedResponse.data.applications
          .filter(app => typeof app.gigRequest !== 'string' && app.gigRequest.status !== 'completed')
          .map(convertApplicationToGig);
        allGigs.push(...acceptedGigs);
      }
      
      // Sort all gigs by most recent first
      allGigs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      
      setGigs(allGigs);
    } catch (err) {
      console.error('Error fetching gigs:', err);
      setError('Error loading your gigs. Please try again.');
      
      // Fallback to mock data for development
      const mockGigs: FormattedGig[] = [
        {
          id: '1',
          title: 'Research Data Entry',
          description: 'Enter survey data into spreadsheets for psychology research project.',
          employer: {
            name: 'Psychology Department',
            rating: 4.9
          },
          location: 'University of Colombo',
          startDate: '2024-01-10',
          endDate: '2024-01-12',
          duration: '15 hours',
          pay: 'LKR 4,500',
          status: 'completed' as const,
          progress: 100,
          rating: 5,
          feedback: 'Excellent work! Very accurate and completed ahead of schedule.',
          completedTasks: ['Data entry', 'Quality check', 'Final review'],
          totalTasks: ['Data entry', 'Quality check', 'Final review'],
          totalHours: 15,
          paymentStatus: 'paid'
        }
      ];
      setGigs(mockGigs);
    } finally {
      setLoading(false);
    }
  };

  const convertCompletionToGig = (completion: any): FormattedGig => {
    const gigRequest = completion.gigRequest;
    const employer = completion.employer;
    const myWork = completion.myWork;
    
    return {
      id: completion._id,
      title: gigRequest.title,
      description: gigRequest.description || 'No description provided',
      employer: {
        name: employer.companyName,
        rating: 4.5 // Default rating, you can implement a rating system
      },
      location: gigRequest.location ? `${gigRequest.location.city}, ${gigRequest.location.address}` : 'Location not specified',
      startDate: format(new Date(completion.completedAt), 'yyyy-MM-dd'),
      endDate: format(new Date(completion.completedAt), 'yyyy-MM-dd'),
      duration: myWork?.totalHours ? `${myWork.totalHours} hours` : 'N/A',
      pay: gigRequest.payRate ? `LKR ${(myWork?.payment?.amount || 0).toLocaleString()}` : 'N/A',
      status: 'completed',
      progress: 100,
      rating: myWork?.performance?.rating || undefined,
      feedback: myWork?.performance?.feedback || undefined,
      totalHours: myWork?.totalHours || 0,
      paymentStatus: myWork?.payment?.status || 'pending'
    };
  };

  const convertApplicationToGig = (application: GigApplication): FormattedGig => {
    const gigRequest = application.gigRequest;
    
    if (typeof gigRequest === 'string') {
      throw new Error('GigRequest should be populated');
    }
    
    // Map job status to gig status for student view
    let gigStatus: FormattedGig['status'];
    switch (gigRequest.status) {
      case 'filled':
        gigStatus = 'filled';
        break;
      case 'in_progress':
        gigStatus = 'in-progress';
        break;
      case 'completed':
        gigStatus = 'completed';
        break;
      case 'cancelled':
      case 'closed':
        gigStatus = 'cancelled';
        break;
      case 'active':
      default:
        gigStatus = 'upcoming';
        break;
    }
    
    const startDate = gigRequest.startDate ? gigRequest.startDate : application.appliedAt;
    const endDate = gigRequest.endDate ? gigRequest.endDate : application.appliedAt;
    
    return {
      id: gigRequest._id,
      applicationId: application._id,
      title: gigRequest.title,
      description: gigRequest.description || 'No description provided',
      employer: {
        name: gigRequest.employer.companyName,
        rating: 4.5 // Default rating
      },
      location: `${gigRequest.location.city}, ${gigRequest.location.address}`,
      startDate: format(new Date(startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(endDate), 'yyyy-MM-dd'),
      duration: 'TBD', // Can be calculated based on start/end dates
      pay: `LKR ${gigRequest.payRate.amount.toLocaleString()} ${
        gigRequest.payRate.rateType === 'hourly' ? 'per hour' :
        gigRequest.payRate.rateType === 'daily' ? 'per day' : 'fixed'
      }`,
      status: gigStatus,
      jobStatus: gigRequest.status,
      positions: {
        filled: gigRequest.filledPositions,
        total: gigRequest.totalPositions
      },
      progress: gigStatus === 'in-progress' ? 25 : undefined // Default progress for in-progress jobs
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      case 'in-progress': return <FaSpinner className="text-blue-500 animate-spin" />;
      case 'upcoming': return <FaCalendarAlt className="text-purple-500" />;
      case 'filled': return <FaPlay className="text-orange-500" />;
      case 'cancelled': return <FaStop className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-quickshift-light text-quickshift-primary';
      case 'upcoming': return 'bg-purple-100 text-purple-800';
      case 'filled': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGigs = gigs.filter(gig => 
    filter === 'all' || gig.status === filter
  );

  const getStatusCounts = () => {
    return {
      all: gigs.length,
      upcoming: gigs.filter(gig => gig.status === 'upcoming').length,
      filled: gigs.filter(gig => gig.status === 'filled').length,
      'in-progress': gigs.filter(gig => gig.status === 'in-progress').length,
      completed: gigs.filter(gig => gig.status === 'completed').length,
      cancelled: gigs.filter(gig => gig.status === 'cancelled').length
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
            <FaBriefcase className="text-blue-600 text-2xl mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">My Gigs</h1>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Gigs', count: statusCounts.all },
            { key: 'upcoming', label: 'Upcoming', count: statusCounts.upcoming },
            { key: 'filled', label: 'Filled', count: statusCounts.filled },
            { key: 'in-progress', label: 'In Progress', count: statusCounts['in-progress'] },
            { key: 'completed', label: 'Completed', count: statusCounts.completed },
            { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled }
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

      {/* Gigs List */}
      <div className="space-y-4">
        {filteredGigs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaBriefcase className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No gigs yet' : `No ${filter.replace('-', ' ')} gigs`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Apply for jobs to start building your gig portfolio!'
                : `You don't have any ${filter.replace('-', ' ')} gigs at the moment.`}
            </p>
            {filter === 'all' && (
              <button className="bg-quickshift-primary text-white px-6 py-2 rounded-lg hover:bg-quickshift-secondary transition-colors">
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          filteredGigs.map(gig => (
            <div key={gig.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {gig.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{gig.employer.name} • ⭐ {gig.employer.rating}</p>
                    <p className="text-gray-700 text-sm mb-3">{gig.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" />
                        {gig.location}
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-1" />
                        {gig.duration}
                      </div>
                      <div className="font-semibold text-green-600">
                        <FaDollarSign className="inline mr-1" />
                        {gig.pay}
                      </div>
                      <div>
                        {new Date(gig.startDate).toLocaleDateString()} - {new Date(gig.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(gig.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
                      {gig.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar for In-Progress Gigs */}
                {gig.status === 'in-progress' && gig.progress !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{gig.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-quickshift-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${gig.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Filled Status Information */}
                {gig.status === 'filled' && gig.positions && (
                  <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-orange-800">Job Filled - Waiting to Start</span>
                      <span className="text-sm text-orange-600">
                        {gig.positions.filled}/{gig.positions.total} positions filled
                      </span>
                    </div>
                    <p className="text-orange-700 text-sm">
                      All positions have been filled. The employer will start the job soon.
                    </p>
                  </div>
                )}

                {/* Task Progress */}
                {gig.totalTasks && gig.totalTasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tasks ({gig.completedTasks?.length || 0}/{gig.totalTasks.length})</h4>
                    <div className="space-y-1">
                      {gig.totalTasks.map((task, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            gig.completedTasks?.includes(task)
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300'
                          }`}>
                            {gig.completedTasks?.includes(task) && <FaCheckCircle className="w-2 h-2" />}
                          </div>
                          <span className={gig.completedTasks?.includes(task) ? 'line-through text-gray-500' : 'text-gray-700'}>
                            {task}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating and Feedback for Completed Gigs */}
                {gig.status === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800">Gig Completed!</span>
                      {gig.rating && (
                        <div className="flex items-center text-blue-500">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className={i < gig.rating! ? 'text-blue-500' : 'text-gray-300'} />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">({gig.rating}/5)</span>
                        </div>
                      )}
                    </div>
                    {gig.feedback && (
                      <p className="text-green-700 text-sm">
                        <strong>Feedback:</strong> {gig.feedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Cancellation Notice */}
                {gig.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="font-medium text-red-800">This gig was cancelled</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  View Details
                </button>
                <div className="space-x-2">
                  {gig.status === 'upcoming' && (
                    <button className="bg-red-600 text-white px-4 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      Cancel Application
                    </button>
                  )}
                  {gig.status === 'filled' && (
                    <span className="text-orange-600 font-medium text-sm">
                      Waiting for start
                    </span>
                  )}
                  {gig.status === 'in-progress' && (
                    <button className="bg-green-600 text-white px-4 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                      Update Progress
                    </button>
                  )}
                  {gig.status === 'completed' && !gig.rating && (
                    <button className="bg-quickshift-primary text-white px-4 py-1 rounded text-sm hover:bg-quickshift-secondary transition-colors">
                      Rate Employer
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

export default MyGigs;
