'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job } from '@/types/employer';
import JobCard from '@/components/employer/JobCard';
import Button from "@/components/ui/button";
import { useJobs } from '@/contexts/JobContext';
import { 
  BriefcaseIcon, 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  XCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobsPage() {
  const { jobs, updateJob, deleteJob } = useJobs();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [animateHeader, setAnimateHeader] = useState(false);
  const [newJobIds, setNewJobIds] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    // Trigger header animation after a short delay
    const animationTimer = setTimeout(() => {
      setAnimateHeader(true);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  // Track new jobs for highlight animation
  useEffect(() => {
    const currentJobIds = jobs.map(job => job.id);
    const previousJobIds = JSON.parse(localStorage.getItem('previousJobIds') || '[]');
    
    // Find newly added jobs
    const newIds = currentJobIds.filter(id => !previousJobIds.includes(id));
    
    if (newIds.length > 0) {
      setNewJobIds(newIds);
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setNewJobIds([]);
      }, 3000);
    }
    
    // Store current job IDs for next comparison
    localStorage.setItem('previousJobIds', JSON.stringify(currentJobIds));
  }, [jobs]);

  const handleDeleteJob = (jobId: string) => {
    deleteJob(jobId);
  };

  const handleCloseJob = (jobId: string) => {
    updateJob(jobId, { status: 'closed' });
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
        staggerChildren: 0.12
      }
    }
    };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 12
      } 
    }
  };

  const statusOptions = [
    { 
      value: 'all', 
      label: 'All Jobs', 
      icon: BriefcaseIcon, 
      count: jobs.length,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      activeColor: 'bg-indigo-600 text-white'
    },
    { 
      value: 'active', 
      label: 'Active', 
      icon: CheckBadgeIcon, 
      count: jobs.filter(j => j.status === 'active').length,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      activeColor: 'bg-emerald-600 text-white'
    },
    { 
      value: 'draft', 
      label: 'Drafts', 
      icon: DocumentTextIcon, 
      count: jobs.filter(j => j.status === 'draft').length,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      activeColor: 'bg-amber-600 text-white'
    },
    { 
      value: 'closed', 
      label: 'Closed', 
      icon: XCircleIcon, 
      count: jobs.filter(j => j.status === 'closed').length,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      activeColor: 'bg-rose-600 text-white'
    }
  ];

  return (
    <div className="pb-12">
      {/* Enhanced Gradient Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          background: animateHeader ? 
            "linear-gradient(120deg, #4f46e5, #7c3aed, #2563eb, #8b5cf6)" : 
            "linear-gradient(120deg, #4f46e5, #7c3aed)"
        }}
        transition={{ 
          duration: 0.5,
          background: { duration: 2, repeat: Infinity, repeatType: "reverse" }
        }}
        className="rounded-xl p-8 mb-8 shadow-lg relative overflow-hidden"
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        />

        {/* Animated particles */}
        <motion.div 
          className="absolute -bottom-4 -right-4 w-36 h-36 bg-white opacity-10 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-8 right-12 w-20 h-20 bg-white opacity-10 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.18, 0.1] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5
          }}
        />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 relative z-10">
          <div>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-white flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <BriefcaseIcon className="w-8 h-8 mr-3" />
              Manage Jobs
              <motion.span 
                className="ml-3 text-sm bg-white/20 px-2 py-1 rounded-full text-white"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {jobs.length} Total
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-blue-100 mt-2 font-light text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Create, edit and manage your job postings
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Link href="/employer/jobs/post">
              <Button className="bg-white hover:bg-white/90 text-indigo-700 hover:text-indigo-800 px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:translate-y-[-2px] transition-all duration-300 flex items-center gap-2.5 group">
                <span className="relative flex h-6 w-6 items-center justify-center">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
                  <PlusIcon className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                </span>
                <span className="font-medium">Post New Job</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Enhanced Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8"
      >
        <div className="rounded-xl shadow-md border border-gray-100 p-5 backdrop-blur-sm bg-white/95">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Status Filter Tabs */}
            <div className="flex-grow">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <FunnelIcon className="w-3 h-3 mr-1" />
                Filter by Status
              </p>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    onClick={() => setFilterStatus(option.value)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm transition-all duration-300 ${
                      filterStatus === option.value 
                        ? option.activeColor + ' shadow-md' 
                        : option.color + ' hover:shadow-sm'
                    } border`}
                  >
                    <option.icon className={`w-4 h-4 ${filterStatus === option.value ? 'text-white' : ''}`} />
                    <span>{option.label}</span>
                    <motion.span 
                      className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${
                        filterStatus === option.value 
                          ? 'bg-white/25 text-white' 
                          : 'bg-white/80 ' + option.color.split(' ')[1]
                      }`}
                      initial={{ scale: 1 }}
                      animate={{ scale: option.count > 0 ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.5, repeat: option.count > 0 ? 1 : 0 }}
                    >
                      {option.count}
                    </motion.span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Search Box */}
            <div className="min-w-[280px]">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                <MagnifyingGlassIcon className="w-3 h-3 mr-1" />
                Search Jobs
              </p>
              <motion.div 
                className="relative group"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Job title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-gray-50 focus:bg-white transition-all duration-200"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
          
          {/* Active Filters Summary - Shows when filters are applied */}
          <AnimatePresence>
            {(filterStatus !== 'all' || searchQuery) && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filterStatus !== 'all' && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                      <button 
                        onClick={() => setFilterStatus('all')}
                        className="ml-1 text-indigo-500 hover:text-indigo-700"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </motion.span>
                  )}
                  {searchQuery && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      Search: {searchQuery}
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="ml-1 text-indigo-500 hover:text-indigo-700"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </motion.span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {setFilterStatus('all'); setSearchQuery('');}}
                  className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors hover:bg-gray-50 px-2 py-1 rounded"
                >
                  <ArrowPathIcon className="w-3 h-3" />
                  Reset filters
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Job Cards with Enhanced Animations */}
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
              className="relative bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-12 text-center shadow-sm overflow-hidden"
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" 
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.2'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 20l2.83-2.83 1.41 1.41L1.41 21.41 0 22.83V20zM0 .83l2.83 2.83L0 6.49V.83zM10 40l2.83-2.83 1.41 1.41L11.41 40H10zM20 40l2.83-2.83 1.41 1.41L21.41 40H20zM0 10l2.83 2.83L0 15.66V10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
              
              {/* Empty state content */}
              <motion.div 
                className="bg-indigo-50 rounded-full h-28 w-28 flex items-center justify-center mx-auto mb-6"
                animate={{ 
                  boxShadow: ['0 0 0 rgba(99, 102, 241, 0.2)', '0 0 40px rgba(99, 102, 241, 0.3)', '0 0 0 rgba(99, 102, 241, 0.2)'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                >
                  <SparklesIcon className="h-28 w-28 text-indigo-500" />
                </motion.div>
                <BriefcaseIcon className="h-14 w-14 text-indigo-500" />
              </motion.div>
              
              {searchQuery || filterStatus !== 'all' ? (
                <div>
                  <motion.h3 
                    className="text-2xl font-medium text-gray-800 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No matching jobs found
                  </motion.h3>
                  <motion.p 
                    className="text-gray-500 mb-7"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Try adjusting your search or filter criteria
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      onClick={() => {setSearchQuery(''); setFilterStatus('all');}}
                      variant="outline"
                      className="border-indigo-200 hover:border-indigo-300 text-indigo-600 font-medium px-6"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                      Reset Filters
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div>
                  <motion.h3 
                    className="text-2xl font-medium text-gray-800 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No jobs posted yet
                  </motion.h3>
                  <motion.p 
                    className="text-gray-500 mb-7"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Create your first job posting to start receiving applications
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link href="/employer/jobs/post">
                      <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md hover:shadow-lg px-6 py-2.5">
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Post Your First Job
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          ) : (            filteredJobs.map((job) => (
              <motion.div 
                key={job.id} 
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative"
                initial={newJobIds.includes(job.id) ? { scale: 0.95, opacity: 0.7 } : false}
                animate={newJobIds.includes(job.id) ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                {/* New job shimmer background */}
                {newJobIds.includes(job.id) && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-100 via-green-50 to-green-100 opacity-30 -z-10"
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{
                      backgroundSize: '200% 200%',
                    }}
                  />
                )}
                
                {/* New job ring effect */}
                {newJobIds.includes(job.id) && (
                  <div className="absolute inset-0 rounded-lg ring-2 ring-green-300 ring-opacity-40 shadow-lg shadow-green-100/50 -z-10" />
                )}
                
                {/* New job indicator */}
                {newJobIds.includes(job.id) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute -top-2 -left-2 z-10"
                  >
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      New
                    </div>
                  </motion.div>
                )}
                
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
        {/* Enhanced Loading skeleton */}
      {!isLoaded && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-pulse"></div>
              <div className="animate-pulse flex flex-col">
                <div className="h-7 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="flex space-x-4 mb-6">
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                  <div className="h-4 bg-gray-100 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-8 bg-gray-200 rounded-md w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Job count summary with enhanced visualization */}
      {filteredJobs.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 px-1"
        >
          <span className="text-sm bg-white/80 backdrop-blur-sm text-gray-600 py-1 px-3 rounded-full shadow-sm border border-gray-100">
            Showing <span className="font-semibold text-indigo-600">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'job' : 'jobs'}
          </span>
          
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full shadow-sm border border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-sm text-gray-600">Active: <span className="font-medium">{jobs.filter(job => job.status === 'active').length}</span></span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-sm text-gray-600">Drafts: <span className="font-medium">{jobs.filter(job => job.status === 'draft').length}</span></span>
            </div>
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-sm text-gray-600">Closed: <span className="font-medium">{jobs.filter(job => job.status === 'closed').length}</span></span>
            </div>          </div>
        </motion.div>
      )}
    </div>
  );
}