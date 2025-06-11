'use client';

import { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaClock, FaEye, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  location: string;
  salary: string;
}

export default function MyApplications() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API call
  const applications: Application[] = [
    {
      id: '1',
      jobTitle: 'Event Staff',
      company: 'EventPro Solutions',
      appliedDate: '2024-03-20',
      status: 'pending',
      location: 'Colombo',
      salary: 'LKR 2,000/hour',
    },
    {
      id: '2',
      jobTitle: 'Delivery Assistant',
      company: 'QuickDeliver',
      appliedDate: '2024-03-18',
      status: 'accepted',
      location: 'Kandy',
      salary: 'LKR 1,800/hour',
    },
    {
      id: '3',
      jobTitle: 'Office Assistant',
      company: 'TechCorp',
      appliedDate: '2024-03-15',
      status: 'rejected',
      location: 'Galle',
      salary: 'LKR 2,200/hour',
    },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const filteredApplications = applications.filter(
    (app) => filter === 'all' || app.status === filter
  );

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'accepted':
        return <FaCheck className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
    }
  };

  const getStatusText = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Not Selected';
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="flex space-x-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-[#03045E] mb-6">My Applications</h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              filter === status
                ? 'bg-[#0077B6] text-white shadow-md'
                : 'bg-[#CAF0F8] text-[#0077B6] hover:bg-[#90E0EF]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.map((application) => (
          <div
            key={application.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-[#03045E] mb-1">{application.jobTitle}</h3>
                  <p className="text-lg text-gray-600">{application.company}</p>
                </div>
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${getStatusColor(application.status)}`}>
                  {getStatusIcon(application.status)}
                  <span className="font-medium">
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-600">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">{application.location}</span>
                </div>
                <div className="flex items-center">
                  <FaMoneyBillWave className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">{application.salary}</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-[#0077B6]" />
                  <span className="text-lg">Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>              <div className="mt-6 flex justify-end">
                <button
                  className="flex items-center text-[#0077B6] hover:text-[#00B4D8] transition-colors duration-200"
                >
                  <FaEye className="mr-2" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredApplications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-500">You haven&apos;t applied to any jobs yet or there are no applications matching your current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
} 