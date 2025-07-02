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
  quickStats
}: DashboardHeaderProps) {
  const config = getUserTypeConfig(userType);
  const stats = quickStats || getDefaultStats(userType);

  const getUserDisplayName = () => {
    if (userType === 'employer' && user.companyName) {
      return user.companyName;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'User';
  };

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100/50 p-1.5">
      <div className="dashboard-header rounded-lg p-1.5 shadow-md mx-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border border-blue-300/50 max-w-4xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex-1 min-w-0 pr-2">
            <h1 className="text-sm font-semibold mb-0.5 text-white drop-shadow-md truncate leading-tight">
              {config.greeting}, {getUserDisplayName()}! {config.icon}
            </h1>
            <p className="text-xs font-normal text-white/90 drop-shadow-sm truncate leading-tight">
              {config.subtitle}
            </p>
          </div>
          
          {/* Notifications */}
          <button className="p-1.5 hover:bg-white/20 rounded-lg transition-all duration-200 relative group flex-shrink-0 bg-white/10">
            <Bell className="h-4 w-4 text-white group-hover:text-blue-100" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-lg">
              3
            </span>
          </button>
        </div>

        {/* Quick Stats */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-md p-1.5 text-center shadow-md border border-blue-200/30 hover:shadow-lg transition-all duration-200 hover:bg-white hover:scale-105">
                <div className="text-sm md:text-base font-bold text-blue-900 truncate leading-none mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-blue-700 truncate leading-none mb-0.5">{stat.label}</div>
                <div className="text-xs font-normal text-blue-600/80 truncate leading-none">{stat.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
