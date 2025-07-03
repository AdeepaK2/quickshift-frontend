"use client";

import { useEffect, useState } from 'react';
import {
  Users,
  Briefcase,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { adminDashboardService, DashboardStats } from '@/services/adminDashboardService';
import toast from 'react-hot-toast';
import { LucideIcon } from 'lucide-react';

// Simplified components for clean admin dashboard
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white rounded-xl border shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }: CardProps) => (
  <div className={`p-4 sm:p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }: CardProps) => (
  <div className={`p-4 sm:p-6 pb-2 sm:pb-3 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }: CardProps) => (
  <h3 className={`text-base sm:text-lg lg:text-xl font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm sm:text-base text-slate-600 ${className}`}>{children}</p>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) => {
  const variantClasses = {
    default: "bg-slate-100 text-slate-800 border border-slate-300",
    success: "bg-green-100 text-green-800 border border-green-300 shadow-sm",
    warning: "bg-blue-100 text-blue-800 border border-blue-300 shadow-sm",
    error: "bg-red-100 text-red-800 border border-red-300 shadow-sm",
  };
  
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default}`}>
      {children}
    </span>
  );
};

interface RecentActivityItem {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  status: "completed" | "in_progress" | "pending" | "cancelled" | "active" | "open" | "draft";
  payment: string;
}

interface TopPerformer {
  type: "student" | "employer";
  id: string;
  name: string;
  rating: number;
  gigsCompleted?: number;
  gigsPosted?: number;
  specialization?: string;
  industry?: string;
}

interface StatItem {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendPositive: boolean;
  Icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardService.getDashboardStats('month');
      
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      
      // More detailed error handling
      if (err instanceof Error) {
        if (err.message.includes('Authentication token not found') || 
            err.message.includes('session has expired')) {
          setError('Your session has expired. Please log in again.');
          // Redirect to login page after a brief delay
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 3000);
        } else if (err.message.includes('permission')) {
          setError('You do not have permission to access this dashboard.');
        } else {
          setError(err.message || 'Failed to load dashboard statistics');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border shadow-lg p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-lg font-semibold mb-2">Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Real stats from backend or fallback to mock data
  const stats = dashboardData ? [
    {
      title: "Total Users",
      value: dashboardData.overview.totalUsers.toLocaleString(),
      subtitle: `${dashboardData.overview.newUsersThisMonth} new this month`,
      trend: `+${dashboardData.userGrowth.percentage}% from last month`,
      trendPositive: dashboardData.userGrowth.percentage > 0,
      Icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Gigs Posted",
      value: dashboardData.overview.totalGigs.toLocaleString(),
      subtitle: `Active: ${dashboardData.overview.activeGigs} • Completed: ${dashboardData.overview.completedGigs}`,
      trend: `+${dashboardData.gigStats.percentage}% from last month`,
      trendPositive: dashboardData.gigStats.percentage > 0,
      Icon: Briefcase,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Employers",
      value: dashboardData.overview.totalEmployers.toLocaleString(),
      subtitle: `${Math.round(dashboardData.overview.totalEmployers * 0.1)} new this month`,
      trend: `+${Math.round(dashboardData.userGrowth.percentage * 0.8)}% from last month`,
      trendPositive: dashboardData.userGrowth.percentage > 0,
      Icon: UserPlus,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "Completed Gigs",
      value: dashboardData.overview.completedGigs.toLocaleString(),
      subtitle: `${dashboardData.overview.activeGigs} currently active`,
      trend: "Platform growing",
      trendPositive: true,
      Icon: CheckCircle,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
  ] : [
    // Fallback mock data when backend is not available
    {
      title: "Total Users",
      value: "1,234",
      subtitle: "1,145 Students • 89 Employers",
      trend: "+12% from last month",
      trendPositive: true,
      Icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Gigs Posted",
      value: "567",
      subtitle: "Active: 234 • Completed: 333",
      trend: "+8% from last month",
      trendPositive: true,
      Icon: Briefcase,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Gigs Completed",
      value: "333",
      subtitle: "87% completion rate",
      trend: "+15% from last month",
      trendPositive: true,
      Icon: CheckCircle,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "New Signups This Month",
      value: "89",
      subtitle: "67 Students • 22 Employers",
      trend: "+23% from last month",
      trendPositive: true,
      Icon: UserPlus,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];
  const recentActivity: RecentActivityItem[] = [
    {
      id: "1",
      title: "Full-Stack Developer Intern",
      company: "TechCorp Solutions",
      location: "Colombo",
      date: "2 hours ago",
      status: "active",
      payment: "$500",
    },
    {
      id: "2",
      title: "Digital Marketing Assistant",
      company: "Creative Agency Lanka",
      location: "Kandy",
      date: "5 hours ago",
      status: "completed",
      payment: "$300",
    },
    {
      id: "3",
      title: "Data Analysis Intern",
      company: "Business Solutions Ltd",
      location: "Galle",
      date: "1 day ago",
      status: "in_progress",
      payment: "$200",
    },
    {
      id: "4",
      title: "UI/UX Design Assistant",
      company: "Design Studio Pro",
      location: "Negombo",
      date: "2 days ago",
      status: "pending",
      payment: "$400",
    },
    {
      id: "5",
      title: "Content Writer",
      company: "Media House Inc",
      location: "Matara",
      date: "3 days ago",
      status: "open",
      payment: "$250",
    },
  ];
  const topPerformers: TopPerformer[] = [
    {
      type: "student",
      id: "1",
      name: "Kasun Perera",
      rating: 4.9,
      gigsCompleted: 23,
      specialization: "Web Development",
    },
    {
      type: "employer",
      id: "2",
      name: "Innovative Tech Ltd",
      rating: 4.8,
      gigsPosted: 45,
      industry: "Technology",
    },
    {
      type: "student",
      id: "3",
      name: "Nimali Fernando",
      rating: 4.7,
      gigsCompleted: 18,
      specialization: "Digital Marketing",
    },
    {
      type: "employer",
      id: "4",
      name: "Creative Solutions Inc",
      rating: 4.6,
      gigsPosted: 32,
      industry: "Design & Media",
    },
  ];
  const getStatusBadge = (status: RecentActivityItem["status"]) => {
    const statusMap = {
      completed: "success",
      in_progress: "default", 
      active: "success",
      pending: "default",
      cancelled: "error",
      open: "default",
      draft: "default",
    };
    
    const statusText = {
      completed: "✅ Completed",
      in_progress: "🔄 In Progress",
      active: "🟢 Active",
      pending: "⏳ Pending",
      cancelled: "❌ Cancelled",
      open: "📢 Open",
      draft: "📝 Draft",
    };
    
    return (
      <Badge variant={statusMap[status]}>
        {statusText[status] || status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  // const handleRefresh = () => {
  //   setLastUpdated(new Date().toLocaleString());
  //   // Here you would refetch data from APIs
  // };
  
  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat: StatItem, index: number) => (
          <Card key={index} className={`${stat.bgColor} border shadow-md hover:shadow-lg transition-all duration-300`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <div className={`p-1.5 rounded-full ${stat.bgColor.replace('bg-', 'bg-').replace('50', '100')}`}>
                <stat.Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-4">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <p className="text-xs text-gray-800 font-semibold mb-1">{stat.subtitle}</p>
              {stat.trend && (
                <p className={`text-xs font-bold ${stat.trendPositive ? "text-green-700" : "text-red-700"}`}>
                  📈 {stat.trend}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 shadow-md border-l-4 border-l-blue-500">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Recent Gig Activity
            </CardTitle>
            <CardDescription className="text-sm text-gray-800 font-medium">
              Latest gig postings and status updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-white p-4">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activityItem) => (
                  <div key={activityItem.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-900 mb-1">{activityItem.title}</h4>
                      <p className="text-sm text-gray-800 font-semibold">{activityItem.company}</p>
                      <p className="text-xs text-gray-700 font-medium">📍 {activityItem.location} • 🕒 {activityItem.date}</p>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(activityItem.status)}
                      <p className="text-sm font-bold text-green-600">{activityItem.payment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg text-gray-500 font-medium">
                  No recent gig activity to display.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-sm text-gray-700">
              Outstanding students and employers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 bg-white p-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((performer) => (
                <div
                  key={performer.id}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg border hover:border-green-300 hover:shadow-md transition-all duration-200"
                >
                  <div
                    className={`p-2 rounded-full shadow-sm ${
                      performer.type === "student"
                        ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                        : "bg-gradient-to-r from-green-400 to-green-600 text-white"
                    }`}
                  >
                    {performer.type === "student" ? (
                      <Users className="h-4 w-4" />
                    ) : (
                      <Briefcase className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {performer.name}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-700 font-medium">
                        {performer.type === "student"
                          ? `🎯 ${performer.gigsCompleted} gigs completed`
                          : `📝 ${performer.gigsPosted} gigs posted`}
                      </p>
                      <p className="text-xs text-blue-600 font-semibold">
                        ⭐ {performer.rating.toFixed(1)}/5.0
                      </p>
                      {performer.specialization && (
                        <p className="text-xs text-blue-600 bg-blue-100 rounded-full px-2 py-0.5 inline-block">
                          {performer.specialization}
                        </p>
                      )}
                      {performer.industry && (
                        <p className="text-xs text-green-600 bg-green-100 rounded-full px-2 py-0.5 inline-block">
                          {performer.industry}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg text-gray-500 font-medium">
                  No top performers data available yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}