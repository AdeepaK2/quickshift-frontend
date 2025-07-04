'use client';

import { useState } from 'react';
import { 
  ChartBarIcon,
  BriefcaseIcon,
  ChartPieIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UserSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role?: string;
    stats?: {
      appliedJobs: number;
      activeGigs: number;
      completedGigs: number;
      totalEarnings: number;
      monthlyEarnings: number;
      rating: number;
      pendingPayments: number;
    };
  };
  onLogout: () => void;
}

export default function UserSidebar({ activeTab, setActiveTab, user, onLogout }: UserSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartPieIcon },
    { id: 'jobs', name: 'Browse Jobs', icon: MagnifyingGlassIcon },
    { 
      id: 'applications', 
      name: 'My Applications', 
      icon: ClockIcon, 
      badge: user?.stats?.appliedJobs !== undefined ? user.stats.appliedJobs.toString() : undefined
    },
    { 
      id: 'gigs', 
      name: 'My Gigs', 
      icon: BriefcaseIcon, 
      badge: user?.stats ? "1" : undefined
    },
    { 
      id: 'payments', 
      name: 'My Payments', 
      icon: CurrencyDollarIcon, 
      badge: user?.stats?.pendingPayments !== undefined ? user.stats.pendingPayments.toString() : undefined
    },
    { id: 'profile', name: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-[80] md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 rounded-lg bg-quickshift-primary text-white hover:bg-quickshift-secondary transition-colors shadow-md"
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
        fixed inset-y-0 left-0 z-[60] w-52 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col min-h-screen bg-gradient-to-b from-teal-600 via-blue-600 to-indigo-700
      `}>
        {/* Logo/Header */}
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="flex items-center pt-12 md:pt-0">
            <ChartBarIcon className="h-5 w-5 text-teal-300 mr-2" />
            <div>
              <h1 className="text-base font-bold text-white">QuickShift</h1>
              <p className="text-xs text-teal-200">Student Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-3 border-b border-white/10">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="ml-2">
                <p className="text-xs font-medium text-white truncate">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                </p>
                <p className="text-xs text-white/70">Student Account</p>
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
                    ? 'bg-teal-500/30 text-white border-l-4 border-teal-300' 
                    : 'text-teal-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2 flex items-center justify-center">
                    <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                  </span>
                  {item.name}
                </div>
                {item.badge && (
                  <span className={`
                    px-1.5 py-0.5 text-xs font-medium rounded-full
                    ${isActive ? 'bg-white/20 text-white' : 'bg-teal-500 text-white'}
                  `} style={{ fontSize: '0.6rem' }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer/Logout Section */}
        <div className="mt-auto p-4 border-t border-white/10">
          {/* Quick Stats */}
          <div className="bg-teal-500/20 rounded-lg p-3 mb-3">
            <h3 className="text-xs font-semibold text-teal-200 mb-2 uppercase tracking-wide">
              Quick Stats
            </h3>
            {user.stats ? (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-teal-300">Applied Jobs</span>
                  <span className="text-xs font-semibold text-white">{user.stats.appliedJobs ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-teal-300">Active Gigs</span>
                  <span className="text-xs font-semibold text-white">{user.stats.activeGigs ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-teal-300">Completed</span>
                  <span className="text-xs font-semibold text-green-300">{user.stats.completedGigs ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-teal-300">This Month</span>
                  <span className="text-xs font-semibold text-green-300">LKR {user.stats.monthlyEarnings?.toLocaleString() ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-teal-300">Rating</span>
                  <span className="text-xs font-semibold text-teal-200">{user.stats.rating?.toFixed(1) ?? '0.0'} ⭐</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 animate-pulse">
                <div className="h-3 bg-teal-800/30 rounded mb-2"></div>
                <div className="h-3 bg-teal-800/30 rounded mb-2"></div>
                <div className="h-3 bg-teal-800/30 rounded mb-2"></div>
                <div className="h-3 bg-teal-800/30 rounded"></div>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-xs font-medium text-red-300 rounded-md hover:bg-red-500/20 hover:text-red-200 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[40] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
