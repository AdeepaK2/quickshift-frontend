'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardContent() {
  const { user } = useAuth();
  
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
            <button className="w-full text-left px-3 md:px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-lg hover:bg-[#90E0EF] transition-colors font-medium text-xs md:text-sm">
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
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs md:text-sm">New applications</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs md:text-sm">Jobs this week</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-xs md:text-sm">Interviews scheduled</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">5</span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white p-3 md:p-4 rounded-lg shadow-md">
          <h3 className="text-base md:text-lg font-semibold text-[#03045E] mb-3 md:mb-4">Performance</h3>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm">Response Rate</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm">Avg. Hire Time</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">8 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs md:text-sm">Your Rating</span>
              <span className="text-base md:text-lg font-semibold text-[#0077B6]">4.6/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
