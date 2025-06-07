"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  CheckCircle,
  UserPlus,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

export default function AnalyticsContent() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      trend: "+5% from last month",
      trendPositive: true,
      Icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Gigs Posted",
      value: "567",
      trend: "+10 gigs this week",
      trendPositive: true,
      Icon: Briefcase,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Gigs Completed",
      value: "480",
      trend: "85% completion rate",
      trendPositive: true,
      Icon: CheckCircle,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      title: "New Signups This Week",
      value: "89",
      trend: "+12% from last week",
      trendPositive: true,
      Icon: UserPlus,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="mt-2 sm:mt-0">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Over Time Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Signups Over Time</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Gigs by Category</h3>
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

      {/* Completion Rates Chart - Full Width */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Completion Rates</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
          <div className="text-center">
            <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Bar Chart Placeholder</p>
            <p className="text-gray-400 text-xs mt-1">
              Gig completion rates by category and time period
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <div className="text-sm text-gray-600">Average Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">72h</div>
            <div className="text-sm text-gray-600">Average Completion Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
