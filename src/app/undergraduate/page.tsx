'use client';

import { useState } from 'react';
import { FaBriefcase, FaUser, FaHistory, FaStar, FaSearch } from 'react-icons/fa';

// Components
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import MyApplications from './components/MyApplications';
import Profile from './components/Profile';
import EmployerRatings from './components/EmployerRatings';

type TabType = 'jobs' | 'applications' | 'profile' | 'ratings';

export default function UndergraduatePage() {
  const [activeTab, setActiveTab] = useState<TabType>('jobs');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  const tabs = [
    { id: 'jobs', label: 'Browse Jobs', icon: FaSearch },
    { id: 'applications', label: 'My Applications', icon: FaHistory },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'ratings', label: 'Employer Ratings', icon: FaStar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'jobs':
        return selectedJob ? (
          <JobDetails jobId={selectedJob} onBack={() => setSelectedJob(null)} />
        ) : (
          <JobList onSelectJob={setSelectedJob} />
        );
      case 'applications':
        return <MyApplications />;
      case 'profile':
        return <Profile />;
      case 'ratings':
        return <EmployerRatings />;
      default:
        return <JobList onSelectJob={setSelectedJob} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5FF]">
      {/* Header */}
      <header className="bg-[#03045E] text-white p-4">
        <h1 className="text-2xl font-bold">QuickShift</h1>
        <p className="text-sm text-[#90E0EF]">Find your next opportunity</p>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <nav className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#0077B6] border-b-2 border-[#0077B6]'
                    : 'text-gray-500 hover:text-[#00B4D8]'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <main className="bg-white rounded-lg shadow-md p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
} 