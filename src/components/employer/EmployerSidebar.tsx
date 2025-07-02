'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChartPieIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EmployerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    companyName?: string;
    role?: string;
  };
  onLogout: () => void;
}

export default function EmployerSidebar({ activeTab, setActiveTab, user, onLogout }: EmployerSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'jobs', name: 'Manage Jobs', icon: BriefcaseIcon, badge: '5' },
    { id: 'applicants', name: 'Applicants', icon: UserGroupIcon, badge: '12' },
    { id: 'analytics', name: 'Analytics', icon: ChartPieIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-[60] md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        dashboard-sidebar
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col min-h-screen bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-r border-blue-200 shadow-xl rounded-r-xl
      `}>
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/20">
          <div className="flex items-center pt-12 md:pt-0">
            <BuildingOfficeIcon className="h-5 w-5 text-blue-300 mr-2" />
            <div>
              <h1 className="text-base font-bold text-white">QuickShift</h1>
              <p className="text-xs text-blue-200">Employer Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 border-b border-white/20">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <BuildingOfficeIcon className="w-4 h-4 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-white truncate">
                  {user.companyName || user.firstName || user.email}
                </p>
                <p className="text-xs text-blue-200">Employer Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`sidebar-nav-item w-full ${isActive ? 'active' : ''} focus:outline-none focus:ring-0 group px-2 py-1.5 text-left flex items-center justify-between rounded-lg mx-2 transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500/30 text-white border-l-4 border-blue-300' 
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 flex items-center justify-center">
                    <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  </span>
                  <span className="text-xs">{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`
                    px-1.5 py-0.5 text-xs font-medium rounded-full transition-colors
                    ${isActive ? 'bg-blue-400 text-white' : 'bg-blue-600 text-white'}
                  `} style={{ fontSize: '0.6rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer/Logout Section */}
        <div className="mt-auto p-3 border-t border-white/20">
          {/* Quick Stats */}
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-2 mb-2 border border-blue-400/20">
            <h3 className="text-xs font-semibold text-blue-200 mb-1 uppercase tracking-wide">
              Quick Stats
            </h3>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Active Jobs</span>
                <span className="text-xs font-semibold text-white">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Applications</span>
                <span className="text-xs font-semibold text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Hired This Month</span>
                <span className="text-xs font-semibold text-green-300">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-300">Response Rate</span>
                <span className="text-xs font-semibold text-blue-200">87%</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center px-2 py-1.5 text-xs font-medium text-red-300 rounded-md hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 border border-red-400/20 hover:border-red-300/40"
          >
            <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
