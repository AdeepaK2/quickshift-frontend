'use client';

import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaSearch } from 'react-icons/fa';

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

const JobList: React.FC<JobListProps> = ({ onJobSelect, selectedJobId }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Mock data for now
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Campus Event Setup Assistant',
        description: 'Help set up chairs, tables, and decorations for the annual university cultural festival.',
        location: 'University of Colombo',
        duration: '4 hours',
        pay: 'LKR 2,000',
        postedDate: '2 hours ago',
        category: 'Event Support',
        urgency: 'high',
        employer: {
          name: 'UC Student Union',
          rating: 4.8
        }
      },
      {
        id: '2',
        title: 'Library Book Sorting',
        description: 'Organize and sort returned books in the main library during exam period.',
        location: 'Central Library, Colombo',
        duration: '6 hours',
        pay: 'LKR 3,000',
        postedDate: '5 hours ago',
        category: 'Administrative',
        urgency: 'medium',
        employer: {
          name: 'Colombo Public Library',
          rating: 4.5
        }
      },
      {
        id: '3',
        title: 'Food Delivery Helper',
        description: 'Assist with food delivery during lunch hours near university campus.',
        location: 'Nugegoda Area',
        duration: '3 hours',
        pay: 'LKR 1,800',
        postedDate: '1 day ago',
        category: 'Delivery',
        urgency: 'low',
        employer: {
          name: 'Campus Eats',
          rating: 4.2
        }
      }
    ];
    
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || job.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quickshift-primary focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-quickshift-primary focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Event Support">Event Support</option>
            <option value="Administrative">Administrative</option>
            <option value="Delivery">Delivery</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Research">Research</option>
          </select>
        </div>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaSearch className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              onClick={() => onJobSelect?.(job)}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6 border-l-4 ${
                selectedJobId === job.id 
                  ? 'border-quickshift-primary bg-quickshift-light' 
                  : 'border-gray-200 hover:border-quickshift-tertiary'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                  <p className="text-sm text-gray-600">{job.employer.name} • ⭐ {job.employer.rating}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                    {job.urgency.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{job.postedDate}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-1" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-1" />
                  {job.duration}
                </div>
                <div className="flex items-center font-semibold text-green-600">
                  <FaDollarSign className="mr-1" />
                  {job.pay}
                </div>
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {job.category}
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
