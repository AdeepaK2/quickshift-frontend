"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Briefcase,
  CheckCircle,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Star,
  MapPin,
  Calendar,
  Activity,
  PieChart,
  Building2,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { useApi } from "@/lib/hooks";
import {
  undergraduatesApi,
  employersApi,
  gigsApi,
  analyticsApi,
} from "@/lib/api";
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import Button from "@/components/ui/Button";
import { formatDate, getStatusVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// TypeScript interfaces
interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalEmployers: number;
  totalGigs: number;
  activeGigs: number;
  completedGigs: number;
  newSignupsThisWeek: number;
  newStudentsThisWeek: number;
  newEmployersThisWeek: number;
  averageCompletionRate: number;
  averageRating: number;
  averageCompletionTime: string;
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

interface RecentActivity {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  status: "completed" | "in_progress" | "pending" | "cancelled";
  payment: string;
}

export default function DashboardContent() {
  const [lastUpdated, setLastUpdated] = useState("");

  // API calls for dashboard data
  const {
    data: dashboardStats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi(() => analyticsApi.getDashboardStats());

  const { data: undergraduatesResponse, loading: undergraduatesLoading } =
    useApi(() => undergraduatesApi.getAll());

  const { data: employersResponse, loading: employersLoading } = useApi(() =>
    employersApi.getAll()
  );

  const { data: gigsResponse, loading: gigsLoading } = useApi(() =>
    gigsApi.getAll()
  );

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);
  // Calculate stats from real data or use fallback
  const stats = useMemo(() => {
    const undergraduatesData = undergraduatesResponse || [];
    const employersData = employersResponse || [];
    const gigsData = gigsResponse || [];

    const totalStudents = undergraduatesData.length;
    const totalEmployers = employersData.length;
    const totalUsers = totalStudents + totalEmployers;
    const totalGigs = gigsData.length;
    const activeGigs = gigsData.filter(
      (gig: any) => gig.status === "active"
    ).length;
    const completedGigs = gigsData.filter(
      (gig: any) => gig.status === "completed"
    ).length;

    return [
      {
        title: "Total Users",
        value: totalUsers.toString(),
        subtitle: `${totalStudents} Students • ${totalEmployers} Employers`,
        trend: "+5% from last month",
        trendPositive: true,
        Icon: Users,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Gigs Posted",
        value: totalGigs.toString(),
        subtitle: `Active: ${activeGigs} • Completed: ${completedGigs}`,
        trend: "+10 gigs this week",
        trendPositive: true,
        Icon: Briefcase,
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
      },
      {
        title: "Gigs Completed",
        value: completedGigs.toString(),
        subtitle: `${
          totalGigs > 0 ? Math.round((completedGigs / totalGigs) * 100) : 0
        }% completion rate`,
        trend: "+12% from last week",
        trendPositive: true,
        Icon: CheckCircle,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
      },
      {
        title: "New Signups This Week",
        value: "89", // This would come from analytics API
        subtitle: "62 Students • 27 Employers",
        trend: "+15% increase",
        trendPositive: true,
        Icon: UserPlus,
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
      },
    ];
  }, [undergraduatesResponse, employersResponse, gigsResponse]);
  // Get top performers from real data
  const topPerformers = useMemo(() => {
    const performers: TopPerformer[] = [];
    const undergraduatesData = undergraduatesResponse || [];
    const employersData = employersResponse || [];

    // Add top students (example - you'd calculate this based on ratings/completions)
    if (undergraduatesData.length > 0) {
      const topStudent = undergraduatesData[0]; // For demo, taking first student
      performers.push({
        type: "student",
        id: topStudent.id || "1",
        name: topStudent.name || "Top Student",
        rating: 4.9,
        gigsCompleted: 24,
        specialization: topStudent.specialization || "General",
      });
    }

    // Add top employers
    if (employersData.length > 0) {
      const topEmployer = employersData[0]; // For demo, taking first employer
      performers.push({
        type: "employer",
        id: topEmployer.id || "1",
        name: topEmployer.company_name || topEmployer.name || "Top Employer",
        rating: 4.8,
        gigsPosted: 18,
        industry: topEmployer.industry || "Technology",
      });
    }

    return performers;
  }, [undergraduatesResponse, employersResponse]);
  // Get recent activity from gigs data
  const recentActivity = useMemo(() => {
    const gigsData = gigsResponse || [];

    return gigsData.slice(0, 5).map((gig: any) => ({
      id: gig.id || Math.random().toString(),
      title: gig.title || "Untitled Gig",
      company: gig.company_name || "Unknown Company",
      location: gig.location || "Remote",
      date: formatDate(gig.created_at || new Date().toISOString()),
      status: gig.status || "pending",
      payment: `$${gig.budget || 0}`,
    }));
  }, [gigsResponse]);

  const getStatusBadge = (status: string) => {
    const variant = getStatusVariant(status);
    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </Badge>
    );
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchStats();
    setLastUpdated(new Date().toLocaleString());
  };

  // Loading state
  if (
    statsLoading ||
    undergraduatesLoading ||
    employersLoading ||
    gigsLoading
  ) {
    return <LoadingState message="Loading dashboard data..." />;
  } // Error state
  if (statsError) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message={statsError}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-2 sm:mt-0 flex items-center gap-4">
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mb-2">{stat.subtitle}</p>
                <div className="flex items-center">
                  {stat.trendPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.trendPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Two Column Layout for Top Performers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Performers
          </h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      performer.type === "student"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    {" "}
                    {performer.type === "student" ? (
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {performer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {performer.type === "student"
                        ? performer.specialization
                        : performer.industry}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-gray-900">
                      {performer.rating}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {performer.type === "student"
                      ? `${performer.gigsCompleted} gigs completed`
                      : `${performer.gigsPosted} gigs posted`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Overview
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">85%</div>
              <div className="text-sm text-gray-600">
                Average Completion Rate
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">72h</div>
              <div className="text-sm text-gray-600">
                Average Completion Time
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <Activity className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Gig Title
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Company
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Location
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity: RecentActivity) => (
                <tr key={activity.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">
                      {activity.title}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{activity.company}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{activity.location}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{activity.date}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(activity.status)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">
                      {activity.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Over Time Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Signups Over Time
            </h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Line Chart Placeholder</p>
              <p className="text-gray-400 text-xs mt-1">
                User registration trends over the last 30 days
              </p>
            </div>
          </div>
        </div>

        {/* Gigs by Category Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Gigs by Category
            </h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Pie Chart Placeholder</p>
              <p className="text-gray-400 text-xs mt-1">
                Distribution of gigs across different categories
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
