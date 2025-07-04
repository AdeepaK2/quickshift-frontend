'use client';

import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaSearch } from 'react-icons/fa';
import { gigRequestService, GigRequest } from '@/services/gigRequestService';
// import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// Interface for frontend Job model
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
  };
}

interface JobListProps {
  onJobSelect?: (job: Job) => void;
  selectedJobId?: string;
}

// Convert backend GigRequest to frontend Job format
const convertToJob = (gigRequest: GigRequest): Job => {
  const employer = typeof gigRequest.employer === 'string' 
    ? { name: 'Unknown Employer', rating: 0 } 
    : { name: gigRequest.employer.companyName, rating: 0 };
  
  // Calculate duration from timeSlots if available
  let duration = 'Flexible';
  if (gigRequest.timeSlots && gigRequest.timeSlots.length > 0) {
    const totalHours = gigRequest.timeSlots.reduce((total, slot) => {
      const start = new Date(slot.startTime).getTime();
      const end = new Date(slot.endTime).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
    duration = `${Math.round(totalHours)} hours total`;
  }
  
  // Format pay rate
  const pay = `LKR ${gigRequest.payRate.amount} ${gigRequest.payRate.rateType === 'hourly' ? 'per hour' : 
    gigRequest.payRate.rateType === 'daily' ? 'per day' : 'fixed'}`;
  
  // Calculate urgency based on application deadline
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  if (gigRequest.applicationDeadline) {
    const deadline = new Date(gigRequest.applicationDeadline);
    const now = new Date();
    const daysLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysLeft <= 1) urgency = 'high';
    else if (daysLeft <= 3) urgency = 'medium';
    else urgency = 'low';
  }
  
  return {
    id: gigRequest._id,
    title: gigRequest.title,
    description: gigRequest.description,
    location: typeof gigRequest.location === 'object' ? 
      `${gigRequest.location.address}, ${gigRequest.location.city}` : 'Location not specified',
    duration,
    pay,
    postedDate: formatDistanceToNow(new Date(gigRequest.createdAt), { addSuffix: true }),
    category: gigRequest.category,
    urgency,
    employer
  };
};

const JobList: React.FC<JobListProps> = ({ onJobSelect, selectedJobId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  
  // Get color based on urgency
  const getUrgencyColor = (urgency: 'low' | 'medium' | 'high') => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Fetch jobs from backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Construct filter params if needed
        const filters = {
          status: 'active' as const,
          sortBy: 'createdAt' as const,
          sortOrder: 'desc' as const,
          page: 1,
          limit: 20,
          ...(searchTerm ? { search: searchTerm } : {}),
          ...(filterCategory !== 'all' ? { category: filterCategory } : {})
        };
        
        const response = await gigRequestService.getAllGigRequests(filters);
        
        if (response.success && response.data) {
          // Check if data is array (new format) or object with gigRequests (legacy format)
          let gigRequests: GigRequest[] = [];
          
          if (Array.isArray(response.data)) {
            // New format: data is directly an array of GigRequest
            gigRequests = response.data;
          } else if (response.data && typeof response.data === 'object' && 'gigRequests' in response.data) {
            // Legacy format: data contains gigRequests array
            gigRequests = (response.data as any).gigRequests || [];
          }
          
          // Convert backend format to frontend format
          const convertedJobs = gigRequests.map(convertToJob);
          setJobs(convertedJobs);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(gigRequests.map((gig: GigRequest) => gig.category))
          ).filter((category): category is string => typeof category === 'string');
          setCategories(['all', ...uniqueCategories]);
        } else {
          setJobs([]);
          setError(response.message || 'Failed to load jobs');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Error loading jobs. Please try again.');
        setJobs([]); // Clear jobs on error
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchTerm, filterCategory]);

  // Filter jobs based on search term and category
  const filteredJobs = jobs;
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Available Jobs</h1>
        <p className="text-gray-600">Find and apply for gig opportunities that match your schedule.</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search jobs by title, description..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <select
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Jobs list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
            <p className="mt-2 text-gray-600">Loading available jobs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No jobs found matching your criteria.</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div 
              key={job.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                selectedJobId === job.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
              onClick={() => onJobSelect && onJobSelect(job)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                    {job.urgency === 'high' ? 'Urgent' : job.urgency === 'medium' ? 'Filling Fast' : 'Open'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">{job.postedDate}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
              
              <div className="flex flex-wrap gap-y-2 mt-3">
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <FaMapMarkerAlt className="mr-1 text-gray-400" />
                  {job.location}
                </div>
                <div className="flex items-center text-sm text-gray-500 mr-4">
                  <FaClock className="mr-1 text-gray-400" />
                  {job.duration}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <FaDollarSign className="mr-1 text-gray-400" />
                  {job.pay}
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                  {job.category}
                </span>
                <span className="text-sm text-gray-600">
                  {job.employer.name} • {job.employer.rating > 0 ? `${job.employer.rating}★` : 'New'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobList;
