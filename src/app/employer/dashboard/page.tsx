'use client';
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { 
  BriefcaseIcon, 
  CheckBadgeIcon, 
  UserGroupIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 12,
    activeJobs: 8,
    totalApplicants: 47,
    pendingApplicants: 23,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Sample data for recent jobs
  const recentJobs = [
    { title: "Software Developer", status: "Active", applicants: 5, days: 2, colorClass: "bg-blue-100", textColor: "text-blue-600" },
    { title: "Marketing Manager", status: "Active", applicants: 3, days: 5, colorClass: "bg-purple-100", textColor: "text-purple-600" },
    { title: "UX Designer", status: "Draft", applicants: null, days: 1, colorClass: "bg-amber-100", textColor: "text-amber-600" }
  ];
  
  // Sample data for recent applicants
  const recentApplicants = [
    { name: "John Doe", role: "Software Developer", status: "Pending", days: 2, initials: "JD", gradientClass: "from-blue-400 to-blue-600" },
    { name: "Jane Smith", role: "Marketing Manager", status: "Pending", days: 3, initials: "JS", gradientClass: "from-purple-400 to-purple-600" },
    { name: "Robert Johnson", role: "Software Developer", status: "Accepted", days: 7, initials: "RJ", gradientClass: "from-green-400 to-green-600" }
  ];
  
  return (
    <div className="pb-10">
      {/* Header with animated gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-6 sm:p-8 mb-8 shadow-xl animate-gradient-x relative overflow-hidden">
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-10 right-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        
        <div className={`transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Employer Dashboard</h1>
          <p className="text-blue-100 max-w-2xl">Welcome back! Here's an overview of your job listings and applications.</p>
        </div>
      </div>
      
      {/* Animated Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {/* Total Jobs Card */}
        <Card className={`p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-100 rounded-full opacity-70 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-3 relative">
            <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <BriefcaseIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{stats.totalJobs}</p>
          <div className="mt-2 text-xs text-blue-600 flex items-center relative">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
            <span>4 new this month</span>
          </div>
        </Card>

        {/* Active Jobs Card */}
        <Card className={`p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-green-100 rounded-full opacity-70 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-3 relative">
            <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
            <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <CheckBadgeIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
          <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
              style={{ width: isVisible ? `${(stats.activeJobs / stats.totalJobs) * 100}%` : '0%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round((stats.activeJobs / stats.totalJobs) * 100)}% of total</p>
        </Card>

        {/* Total Applicants Card */}
        <Card className={`p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-purple-100 rounded-full opacity-70 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-3 relative">
            <h3 className="text-sm font-medium text-gray-500">Total Applicants</h3>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <UserGroupIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600 group-hover:scale-105 transition-transform duration-300">{stats.totalApplicants}</p>
          <div className="mt-2 text-xs text-purple-600 flex items-center relative">
            <ArrowTrendingUpIcon className="w-3 h-3 mr-1 group-hover:translate-y-[-2px] transition-transform duration-300" />
            <span>12 new this week</span>
          </div>
        </Card>

        {/* Pending Reviews Card */}
        <Card className={`p-6 border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-100 rounded-full opacity-70 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="flex justify-between items-center mb-3 relative">
            <h3 className="text-sm font-medium text-gray-500">Pending Reviews</h3>
            <div className="p-2 bg-amber-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
              <ClockIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.pendingApplicants}</p>
          <button className="mt-2 text-xs bg-amber-100 text-amber-700 py-1.5 px-3 rounded-full hover:bg-amber-200 hover:scale-105 transform transition-all duration-300 relative">
            Review Now
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs Card */}
        <Card className={`p-6 overflow-hidden hover:shadow-lg transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <ChartBarIcon className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Jobs</h2>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors duration-300">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentJobs.map((job, index) => (
              <div 
                key={index} 
                className={`p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300 group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} 
                style={{ animationDelay: (600 + (index * 150)) + 'ms' }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`p-2 ${job.colorClass} rounded-md mr-3 group-hover:scale-110 transition-transform duration-300`}>
                      <BriefcaseIcon className={`w-4 h-4 ${job.textColor}`} />
                    </div>
                    <span className="font-medium">{job.title}</span>
                  </div>
                  <span className={`px-2 py-1 ${job.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-xs rounded-full group-hover:scale-105 transition-transform duration-300`}>
                    {job.status}
                  </span>
                </div>
                <div className="mt-2 pl-11 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>{job.applicants ? `${job.applicants} applicants` : 'Not published'}</span>
                    <span>{job.days === 1 ? 'Created yesterday' : `Posted ${job.days} days ago`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Applicants Card */}
        <Card className={`p-6 overflow-hidden hover:shadow-lg transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Applicants</h2>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors duration-300">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentApplicants.map((applicant, index) => (
              <div 
                key={index} 
                className={`p-3 bg-white border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300 group ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${750 + (index * 150)}ms` }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 bg-gradient-to-tr ${applicant.gradientClass} rounded-full flex items-center justify-center mr-3 text-white font-bold text-xs group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                      {applicant.initials}
                    </div>
                    <div>
                      <span className="font-medium block">{applicant.name}</span>
                      <span className="text-xs text-gray-500">{applicant.role}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 ${applicant.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-xs rounded-full group-hover:scale-105 transition-transform duration-300`}>
                    {applicant.status}
                  </span>
                </div>
                <div className="mt-2 ml-11 text-xs text-gray-500">
                  Applied {applicant.days === 7 ? '1 week ago' : `${applicant.days} days ago`}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}