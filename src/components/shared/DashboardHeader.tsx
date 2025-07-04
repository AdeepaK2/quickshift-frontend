"use client";

import { DashboardUser } from "./DashboardLayout";
import { getTheme } from "@/styles/dashboardThemes";
import { Bell } from "lucide-react";

interface QuickStat {
  label: string;
  value: string | number;
  description: string;
}

interface DashboardHeaderProps {
  userType: 'admin' | 'employer' | 'undergraduate';
  user: DashboardUser;
  quickStats?: QuickStat[];
  isLoadingStats?: boolean;
}

const getUserTypeConfig = (userType: string) => {
  const theme = getTheme(userType as 'admin' | 'employer' | 'undergraduate');
  
  switch (userType) {
    case 'admin':
      return {
        greeting: 'Welcome back',
        subtitle: 'Manage your QuickShift platform from this admin dashboard.',
        primaryColor: theme.primary.gradient,
        icon: '👨‍💼'
      };
    case 'employer':
      return {
        greeting: 'Welcome back',
        subtitle: 'Manage your job postings and track applicants.',
        primaryColor: theme.primary.gradient,
        icon: '🏢'
      };
    case 'undergraduate':
      return {
        greeting: 'Welcome back',
        subtitle: 'Ready to find your next opportunity or manage your current gigs?',
        primaryColor: theme.primary.gradient,
        icon: '👨‍🎓'
      };
    default:
      return {
        greeting: 'Welcome back',
        subtitle: 'Dashboard overview',
        primaryColor: 'from-[#0077B6] to-[#00B4D8]',
        icon: '👋'
      };
  }
};

const getDefaultStats = (userType: string): QuickStat[] => {
  switch (userType) {
    case 'admin':
      return [
        { label: 'Total Users', value: '1,234', description: 'Registered users' },
        { label: 'Active Gigs', value: '567', description: 'Currently active' },
        { label: 'Employers', value: '89', description: 'Active employers' },
        { label: 'Revenue', value: '$12.5k', description: 'This month' }
      ];
    case 'employer':
      return [
        { label: 'Job Posts', value: '12', description: 'Active postings' },
        { label: 'Applications', value: '45', description: 'Total received' },
        { label: 'Hired', value: '8', description: 'This month' },
        { label: 'Rating', value: '4.8', description: 'Average rating' }
      ];
    case 'undergraduate':
      return [
        { label: 'Applied Jobs', value: '12', description: 'Applications sent' },
        { label: 'Active Gigs', value: '3', description: 'Current work' },
        { label: 'Earnings', value: '$580', description: 'This month' },
        { label: 'Rating', value: '4.8', description: 'Your rating' }
      ];
    default:
      return [];
  }
};

export default function DashboardHeader({
  userType,
  user,
  quickStats,
  isLoadingStats = false
}: DashboardHeaderProps) {
  const config = getUserTypeConfig(userType);
  // Use provided quickStats if available, otherwise fall back to defaults when not loading
  const stats = quickStats || (!isLoadingStats ? getDefaultStats(userType) : []);
  
  const getUserDisplayName = () => {
    if (userType === 'employer' && user.companyName) {
      return user.companyName;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'User';
  };

  // Get theme-specific background colors
  const getBackgroundClasses = () => {
    switch (userType) {
      case 'admin':
        return {
          outerBg: 'bg-gradient-to-br from-blue-50 to-indigo-100/50',
          innerBg: 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700',
          border: 'border-blue-300/50',
          statBorder: 'border-blue-200/30',
          statText: 'text-blue-900',
          statLabel: 'text-blue-700',
          statDesc: 'text-blue-600/80'
        };
      case 'employer':
        return {
          outerBg: 'bg-gradient-to-br from-purple-50 to-indigo-100/50',
          innerBg: 'bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700',
          border: 'border-purple-300/50',
          statBorder: 'border-purple-200/30',
          statText: 'text-purple-900',
          statLabel: 'text-purple-700',
          statDesc: 'text-purple-600/80'
        };
      case 'undergraduate':
        return {
          outerBg: 'bg-gradient-to-br from-teal-50 to-blue-100/50',
          innerBg: 'bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600',
          border: 'border-teal-300/50',
          statBorder: 'border-teal-200/30',
          statText: 'text-teal-900',
          statLabel: 'text-teal-700',
          statDesc: 'text-teal-600/80'
        };
      default:
        return {
          outerBg: 'bg-gradient-to-br from-blue-50 to-indigo-100/50',
          innerBg: 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700',
          border: 'border-blue-300/50',
          statBorder: 'border-blue-200/30',
          statText: 'text-blue-900',
          statLabel: 'text-blue-700',
          statDesc: 'text-blue-600/80'
        };
    }
  };

  const bgClasses = getBackgroundClasses();

  return (
    <div className={`w-full ${bgClasses.outerBg} p-1 sm:p-2 lg:p-3`}>
      <div className={`dashboard-header rounded-lg p-2 sm:p-3 lg:p-4 shadow-lg mx-auto ${bgClasses.innerBg} border ${bgClasses.border} max-w-7xl relative`}>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-3 pt-3 sm:pt-1">
          <div className="flex-1 min-w-0 mb-1 sm:mb-0 sm:pr-10 text-center sm:text-left md:ml-10 lg:ml-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-bold mb-0.5 text-white drop-shadow-md leading-tight">
              {config.greeting}, {getUserDisplayName()}! {config.icon}
            </h1>
            <p className="text-xs font-normal text-white/90 drop-shadow-sm leading-tight">
              {config.subtitle}
            </p>
          </div>
          
          {/* Notifications - positioned at the top right corner with centered bell icon */}
          <div className="absolute top-3 right-4">
            <div className="relative">
              {/* White background box */}
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Bell className="h-5 w-5 text-gray-800" />
              </div>
              
              {/* Notification badge */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-semibold text-xs">
                3
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - 2x2 grid on mobile, 1x4 on large screens */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            {stats.map((stat, index) => (
              <div key={index} className={`bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 lg:p-3 text-center shadow-lg border ${bgClasses.statBorder} hover:shadow-xl transition-all duration-300 hover:bg-white hover:scale-105`}>
                {isLoadingStats ? (
                  <>
                    <div className={`h-6 bg-gray-200 animate-pulse rounded mb-1 mx-auto w-1/2`}></div>
                    <div className={`h-4 bg-gray-200 animate-pulse rounded mb-1 mx-auto w-3/4`}></div>
                    <div className={`h-3 bg-gray-200 animate-pulse rounded mx-auto w-2/3`}></div>
                  </>
                ) : (
                  <>
                    <div className={`text-sm sm:text-base lg:text-lg xl:text-xl font-bold ${bgClasses.statText} mb-0.5`}>{stat.value}</div>
                    <div className={`text-xs font-semibold ${bgClasses.statLabel} mb-0.5 leading-tight`}>{stat.label}</div>
                    <div className={`text-xs font-normal ${bgClasses.statDesc} leading-tight`}>{stat.description}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
