'use client';

import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  postedDate: string;
  description: string;
}

interface JobListProps {
  onSelectJob: (jobId: string) => void;
}

export default function JobList({ onSelectJob }: JobListProps) {
  const [filters, setFilters] = useState({
    location: '',
    type: '',
    salary: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API call
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Event Staff',
      company: 'EventPro Solutions',
      location: 'Colombo',
      salary: 'LKR 2,000/hour',
      type: 'Part-time',
      postedDate: '2024-03-20',
      description: 'Looking for energetic individuals to assist with event setup and management.',
    },
    // Add more mock jobs here
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch &&
      (!filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.type || job.type.toLowerCase().includes(filters.type.toLowerCase())) &&
      (!filters.salary || job.salary.includes(filters.salary));
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search jobs by title, company, or description..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-3 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Location"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          />
          <FaMapMarkerAlt className="absolute right-3 top-3 text-gray-400" />
        </div>
        <div className="relative">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm appearance-none"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Job Types</option>
            <option value="Part-time">Part-time</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
          </select>
          <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Salary"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
            value={filters.salary}
            onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
          />
          <FaMoneyBillWave className="absolute right-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-gray-600">
        {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
              onClick={() => onSelectJob(job.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-[#03045E] mb-1">{job.title}</h3>
                  <p className="text-gray-600 text-lg">{job.company}</p>
                </div>
                <span className="px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-full text-sm font-medium">
                  {job.type}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center text-sm text-gray-500 gap-4">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-[#0077B6]" />
                  {job.location}
                </div>
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-2 text-[#0077B6]" />
                  {job.salary}
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-[#0077B6]" />
                  Posted {new Date(job.postedDate).toLocaleDateString()}
                </div>
              </div>
              <p className="mt-4 text-gray-600 line-clamp-2">{job.description}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 