"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

export default function DashboardContent() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      subtitle: "890 Students • 344 Employers",
      trend: "+5% from last month",
      trendPositive: true,
      Icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Gigs Posted",
      value: "567",
      subtitle: "Active: 123 • Closed: 444",
      trend: "+10 gigs this week",
      trendPositive: true,
      Icon: Briefcase,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Gigs Completed",
      value: "480",
      subtitle: "85% completion rate",
      trend: "+12% from last week",
      trendPositive: true,
      Icon: CheckCircle,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "New Signups This Week",
      value: "89",
      subtitle: "62 Students • 27 Employers",
      trend: "+15% increase",
      trendPositive: true,
      Icon: UserPlus,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  const topPerformers = [
    {
      type: "student",
      name: "Sarah Johnson",
      rating: 4.9,
      gigsCompleted: 24,
      specialization: "Graphic Design",
    },
    {
      type: "employer",
      name: "TechCorp Solutions",
      rating: 4.8,
      gigsPosted: 18,
      industry: "Technology",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "UI/UX Design for Mobile App",
      company: "StartupXYZ",
      location: "Remote",
      date: "2025-06-06",
      status: "completed",
      payment: "$850",
    },
    {
      id: 2,
      title: "Content Writing for Blog",
      company: "MediaCorp",
      location: "New York",
      date: "2025-06-05",
      status: "in-progress",
      payment: "$400",
    },
    {
      id: 3,
      title: "Social Media Management",
      company: "LocalBiz Inc",
      location: "Los Angeles",
      date: "2025-06-04",
      status: "pending",
      payment: "$600",
    },
    {
      id: 4,
      title: "Web Development Project",
      company: "DevStudio",
      location: "San Francisco",
      date: "2025-06-03",
      status: "completed",
      payment: "$1,200",
    },
    {
      id: 5,
      title: "Data Analysis Report",
      company: "Analytics Pro",
      location: "Remote",
      date: "2025-06-02",
      status: "in-progress",
      payment: "$750",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      completed: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-2 sm:mt-0">
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
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
                    {performer.type === "student" ? (
                      <GraduationCap
                        className={`h-5 w-5 ${
                          performer.type === "student"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
                    ) : (
                      <Building2
                        className={`h-5 w-5 ${
                          performer.type === "student"
                            ? "text-blue-600"
                            : "text-green-600"
                        }`}
                      />
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
              {recentActivity.map((activity) => (
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
