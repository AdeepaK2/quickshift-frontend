"use client";

import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  CheckCircle,
  UserPlus,
  ArrowTrendingUpIcon,
  RefreshCw,
} from "lucide-react";

// Simplified components for clean admin dashboard
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6">{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-3">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default}`}>
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

export default function DashboardContent() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  // Mock data for dashboard - replace with real API calls when ready
  const stats = [
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
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  const recentActivity: RecentActivityItem[] = [
    {
      id: "1",
      title: "Software Developer Intern",
      company: "TechCorp",
      location: "Colombo",
      date: "2 hours ago",
      status: "active",
      payment: "$500",
    },
    {
      id: "2",
      title: "Marketing Assistant",
      company: "Creative Agency",
      location: "Kandy",
      date: "5 hours ago",
      status: "completed",
      payment: "$300",
    },
    {
      id: "3",
      title: "Data Entry Clerk",
      company: "Business Solutions",
      location: "Galle",
      date: "1 day ago",
      status: "in_progress",
      payment: "$200",
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
  ];

  const getStatusBadge = (status: RecentActivityItem["status"]) => {
    const statusMap = {
      completed: "success",
      in_progress: "warning",
      active: "success",
      pending: "warning",
      cancelled: "error",
      open: "default",
      draft: "default",
    };
    
    return (
      <Badge variant={statusMap[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  const handleRefresh = () => {
    setLastUpdated(new Date().toLocaleString());
    // Here you would refetch data from APIs
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="mt-2 sm:mt-0 flex items-center gap-4">
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border-none`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <stat.Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="text-xs text-gray-600">{stat.subtitle}</p>
              {stat.trend && (
                <p className={`text-xs mt-1 ${stat.trendPositive ? "text-green-600" : "text-red-600"}`}>
                  {stat.trend}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Gig Activity</CardTitle>
            <CardDescription>
              Overview of the latest gig postings and statuses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activityItem) => (
                  <div key={activityItem.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activityItem.title}</h4>
                      <p className="text-sm text-gray-600">{activityItem.company}</p>
                      <p className="text-xs text-gray-500">{activityItem.date}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(activityItem.status)}
                      <p className="text-sm font-medium text-gray-900 mt-1">{activityItem.payment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No recent gig activity to display.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Students and employers with notable contributions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((performer) => (
                <div
                  key={performer.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
                >
                  <div
                    className={`p-2 rounded-full ${
                      performer.type === "student"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {performer.type === "student" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <Briefcase className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {performer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.type === "student"
                        ? `${performer.gigsCompleted} gigs completed`
                        : `${performer.gigsPosted} gigs posted`}
                      {" • "}Rating: {performer.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No top performers data available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}