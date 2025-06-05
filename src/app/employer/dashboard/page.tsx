'use client';
import { useState, useEffect } from 'react';
import { Job, Applicant } from '@/types/employer';
import Card from '@/components/ui/Card';
import { 
  BriefcaseIcon, 
  CheckBadgeIcon, 
  UserGroupIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 12,
    activeJobs: 8,
    totalApplicants: 47,
    pendingApplicants: 23,
  });

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">Employer Dashboard</h1>
        <p className="text-blue-100">Welcome back! Here's an overview of your job listings and applications.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Jobs Card */}
        <Card className="p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BriefcaseIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
          <div className="mt-2 text-xs text-blue-600 flex items-center">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            <span>4 new this month</span>
          </div>
        </Card>

        {/* Active Jobs Card */}
        <Card className="p-6 border-l-4 border-green-500 hover:shadow-lg transition-all duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
          <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" 
              style={{ width: `${(stats.activeJobs / stats.totalJobs) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round((stats.activeJobs / stats.totalJobs) * 100)}% of total</p>
        </Card>

        {/* Total Applicants Card */}
        <Card className="p-6 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-500">Total Applicants</h3>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserGroupIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.totalApplicants}</p>
          <div className="mt-2 text-xs text-purple-600 flex items-center">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            <span>12 new this week</span>
          </div>
        </Card>

        {/* Pending Reviews Card */}
        <Card className="p-6 border-l-4 border-amber-500 hover:shadow-lg transition-all duration-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-500">Pending Reviews</h3>
            <div className="p-2 bg-amber-100 rounded-lg">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.pendingApplicants}</p>
          <button className="mt-2 text-xs bg-amber-100 text-amber-700 py-1 px-2 rounded-full hover:bg-amber-200 transition-colors">
            Review Now
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs Card */}
        <Card className="p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Jobs</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-md mr-3">
                    <BriefcaseIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Software Developer</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
              </div>
              <div className="mt-2 pl-11 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>5 applicants</span>
                  <span>Posted 2 days ago</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-md mr-3">
                    <BriefcaseIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Marketing Manager</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
              </div>
              <div className="mt-2 pl-11 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>3 applicants</span>
                  <span>Posted 5 days ago</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="p-2 bg-amber-100 rounded-md mr-3">
                    <BriefcaseIcon className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="font-medium">UX Designer</span>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Draft</span>
              </div>
              <div className="mt-2 pl-11 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Not published</span>
                  <span>Created yesterday</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Applicants Card */}
        <Card className="p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Applicants</h2>
            <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-tr from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <span className="font-medium block">John Doe</span>
                    <span className="text-xs text-gray-500">Software Developer</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Pending</span>
              </div>
              <div className="mt-2 ml-11 text-xs text-gray-500">
                Applied 2 days ago
              </div>
            </div>
            
            <div className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-tr from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs">
                    JS
                  </div>
                  <div>
                    <span className="font-medium block">Jane Smith</span>
                    <span className="text-xs text-gray-500">Marketing Manager</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">Pending</span>
              </div>
              <div className="mt-2 ml-11 text-xs text-gray-500">
                Applied 3 days ago
              </div>
            </div>
            
            <div className="p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs">
                    RJ
                  </div>
                  <div>
                    <span className="font-medium block">Robert Johnson</span>
                    <span className="text-xs text-gray-500">Software Developer</span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Accepted</span>
              </div>
              <div className="mt-2 ml-11 text-xs text-gray-500">
                Applied 1 week ago
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}