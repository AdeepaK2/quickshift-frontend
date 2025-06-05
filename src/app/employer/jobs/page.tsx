'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '@/types/employer';
import JobCard from '@/components/employer/JobCard';
import Button from '@/components/ui/Button';
import { 
  BriefcaseIcon, 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Sample jobs for demo - replace this with actual data
  useEffect(() => {
    const sampleJobs: Job[] = [
      {
        id: '1',
        title: 'Frontend Developer',
        description: 'We are looking for an experienced frontend developer proficient in React and TypeScript.',
        location: 'Remote',
        type: 'full-time',
        createdAt: new Date('2023-05-01'),
        updatedAt: new Date('2023-05-01'),
        status: 'active',
        applicantCount: 12,
        salary: {
          min: 80000,
          max: 120000,
          currency: 'USD'
        },
        requirements: [
          'React', 
          'TypeScript', 
          '3+ years experience'
        ]
      },
      {
        id: '2',
        title: 'UX Designer',
        description: 'Looking for a talented UX designer to join our product team.',
        location: 'New York, NY',
        type: 'contract',
        createdAt: new Date('2023-05-03'),
        updatedAt: new Date('2023-05-03'),
        status: 'closed',
        applicantCount: 8,
        salary: {
          min: 90000,
          max: 130000,
          currency: 'USD'
        },
        requirements: [
          'Figma', 
          'User Research', 
          '2+ years experience'
        ]
      },
      {
        id: '3',
        title: 'Project Manager',
        description: 'Seeking an experienced project manager for our engineering team.',
        location: 'San Francisco, CA',
        type: 'full-time',
        createdAt: new Date('2023-05-07'),
        updatedAt: new Date('2023-05-07'),
        status: 'draft',
        applicantCount: 0,
        salary: {
          min: 100000,
          max: 150000,
          currency: 'USD'
        },
        requirements: [
          'Agile methodologies', 
          'Jira', 
          '5+ years experience'
        ]
      }
    ];
    
    setJobs(sampleJobs);
  }, []);

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const handleCloseJob = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'closed' } : job
    ));
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="pb-12">
      {/* Gradient Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-6 mb-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-8 right-12 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <BriefcaseIcon className="w-7 h-7 mr-2" />
              Manage Jobs
            </h1>
            <p className="text-blue-100 mt-1">Create, edit and manage your job postings</p>
          </div>
          
          <Link href="/employer/jobs/post">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300 flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full opacity-25 animate-ping group-hover:opacity-40"></div>
                <PlusIcon className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              </div>
              <span className="font-medium">Post New Job</span>
            </Button>
          </Link>
        </div>
      </motion.div>
      
      {/* Enhanced Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Status Filter Tabs */}
            <div className="flex-grow">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <FunnelIcon className="w-3 h-3 mr-1" />
                Filter by Status
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Jobs', icon: BriefcaseIcon, count: jobs.length },
                  { value: 'active', label: 'Active', icon: CheckBadgeIcon, count: jobs.filter(j => j.status === 'active').length },
                  { value: 'draft', label: 'Drafts', icon: DocumentTextIcon, count: jobs.filter(j => j.status === 'draft').length },
                  { value: 'closed', label: 'Closed', icon: XCircleIcon, count: jobs.filter(j => j.status === 'closed').length }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterStatus(option.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-300 ${
                      filterStatus === option.value 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm font-medium' 
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                    } border`}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      filterStatus === option.value 
                        ? 'bg-blue-200 text-blue-700' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="min-w-[240px]">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <MagnifyingGlassIcon className="w-3 h-3 mr-1" />
                Search Jobs
              </p>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Job title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-gray-50 focus:bg-white transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Active Filters Summary - Shows when filters are applied */}
          {(filterStatus !== 'all' || searchQuery) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filterStatus !== 'all' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                    <button 
                      onClick={() => setFilterStatus('all')}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: {searchQuery}
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {setFilterStatus('all'); setSearchQuery('');}}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <ArrowPathIcon className="w-3 h-3" />
                Reset filters
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Job Cards */}
      {isLoaded && (
        <motion.div 
          className="grid gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredJobs.length === 0 ? (
            <motion.div
              variants={item}
              className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm"
            >
              <div className="bg-gray-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-4">
                <BriefcaseIcon className="h-12 w-12 text-gray-400" />
              </div>
              
              {searchQuery || filterStatus !== 'all' ? (
                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No matching jobs found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                  <Button 
                    onClick={() => {setSearchQuery(''); setFilterStatus('all');}}
                    variant="outline"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-500 mb-6">Create your first job posting to start receiving applications</p>
                  <Link href="/employer/jobs/post">
                    <Button className="bg-blue-600 hover:bg-blue-700 transition-colors">
                      <PlusIcon className="w-4 h-4 mr-1.5" />
                      Post Your First Job
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div key={job.id} variants={item}>
                <JobCard
                  job={job}
                  onDelete={handleDeleteJob}
                  onClose={handleCloseJob}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="animate-pulse flex flex-col">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Job count summary */}
      {filteredJobs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-sm text-gray-500 flex justify-between items-center px-1"
        >
          <span>Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}</span>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Active: {jobs.filter(job => job.status === 'active').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Drafts: {jobs.filter(job => job.status === 'draft').length}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Closed: {jobs.filter(job => job.status === 'closed').length}</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}