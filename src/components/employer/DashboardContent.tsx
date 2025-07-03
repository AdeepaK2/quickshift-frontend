'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { employerService, EmployerStats } from '@/services/employerService';
import JobPostModal from './JobPostModal';

export default function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await employerService.getStats();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch statistics');
        }
      } catch (error) {
        console.error('Error fetching employer stats:', error);
        
        // Set a user-friendly error message based on error type
        if (error instanceof Error) {
          if (error.message.includes('Authentication token not found') || 
              error.message.includes('session has expired')) {
            setError('Your session has expired. Please log in again.');
            // Redirect to login page after a brief delay
            setTimeout(() => {
              window.location.href = '/auth/login';
            }, 3000);
          } else if (error.message.includes('permission')) {
            setError('You do not have permission to access this dashboard.');
          } else {
            setError(error.message || 'Failed to load dashboard statistics');
          }
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="w-full max-w-5xl mx-auto px-2">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#03045E]">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Welcome back, {user?.firstName || 'User'}! Here&apos;s what&apos;s happening with your job postings.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Quick Actions */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">Quick Actions</h3>
          <div className="space-y-2 md:space-y-3">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm"
            >
              Post New Job
            </button>
            <button className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm">
              Review Applications
            </button>
            <button className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm">
              View Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">Recent Activity</h3>
          {loading ? (
            <div className="space-y-2 md:space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-2 md:space-y-3">
              <div className="text-red-500 text-sm">
                {error}
                <button 
                  onClick={() => window.location.reload()} 
                  className="block mt-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-xs md:text-sm">New applications</span>
                <span className="text-base md:text-lg font-semibold text-[#0077B6]">{stats?.totalApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-xs md:text-sm">Jobs posted</span>
                <span className="text-base md:text-lg font-semibold text-[#0077B6]">{stats?.totalJobsPosted || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-xs md:text-sm">Active jobs</span>
                <span className="text-base md:text-lg font-semibold text-[#0077B6]">{stats?.activeJobs || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Performance */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">Performance</h3>
          {loading ? (
            <div className="space-y-2 md:space-y-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-2 md:space-y-3">
              <div className="text-red-500 text-sm">
                {error}
                <button 
                  onClick={() => window.location.reload()}
                  className="block mt-2 text-blue-500 hover:text-blue-700 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs md:text-sm">Response Rate</span>
                <span className="text-base md:text-lg font-semibold text-[#0077B6]">{stats?.responseRate || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs md:text-sm">Total Hires</span>
                <span className="text-base md:text-lg font-semibold text-[#0077B6]">{stats?.totalHires || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-xs md:text-sm">Active Jobs</span>
                <span className="text-base md:text-lg font-semibold text-[#0077B6]">{stats?.activeJobs || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Post Modal */}
      <JobPostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          // Optionally refresh stats or show success message
        }}
      />
    </div>
  );
}
