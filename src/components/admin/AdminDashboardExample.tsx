// Example usage of admin services in a dashboard component
// components/admin/AdminDashboardExample.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { 
  adminDashboardService, 
  adminUserManagementService,
  adminEmployerManagementService,
  adminGigManagementService,
  type DashboardStats,
  type UserStats,
  type EmployerStats,
  type GigStats
} from '@/services/admin';
import toast from 'react-hot-toast';

export default function AdminDashboardExample() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [employerStats, setEmployerStats] = useState<EmployerStats | null>(null);
  const [gigStats, setGigStats] = useState<GigStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load all dashboard data in parallel
        const [
          dashboardResponse,
          userStatsResponse,
          employerStatsResponse,
          gigStatsResponse
        ] = await Promise.all([
          adminDashboardService.getDashboardStats('month'),
          adminUserManagementService.getUserStats(),
          adminEmployerManagementService.getEmployerStats(),
          adminGigManagementService.getGigStats()
        ]);

        if (dashboardResponse.success && dashboardResponse.data) {
          setDashboardStats(dashboardResponse.data);
        }

        if (userStatsResponse.success && userStatsResponse.data) {
          setUserStats(userStatsResponse.data);
        }

        if (employerStatsResponse.success && employerStatsResponse.data) {
          setEmployerStats(employerStatsResponse.data);
        }

        if (gigStatsResponse.success && gigStatsResponse.data) {
          setGigStats(gigStatsResponse.data);
        }

        toast.success('Dashboard data loaded successfully');
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleExportData = async () => {
    try {
      const response = await adminDashboardService.exportDashboardData('excel', 'month');
      if (response.success && response.data?.downloadUrl) {
        // Open download URL in new tab
        window.open(response.data.downloadUrl, '_blank');
        toast.success('Export started. Download will begin shortly.');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export dashboard data');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleExportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Data
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboardStats?.overview.totalUsers || userStats?.totalUsers || 0}
          </p>
          <p className="text-sm text-gray-500">
            +{dashboardStats?.userGrowth.percentage || 0}% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Employers</h3>
          <p className="text-3xl font-bold text-green-600">
            {dashboardStats?.overview.totalEmployers || employerStats?.totalEmployers || 0}
          </p>
          <p className="text-sm text-gray-500">
            +{employerStats?.employerGrowthRate || 0}% this month
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Gigs</h3>
          <p className="text-3xl font-bold text-purple-600">
            {dashboardStats?.overview.activeGigs || gigStats?.activeGigs || 0}
          </p>
          <p className="text-sm text-gray-500">
            {gigStats?.totalGigs || 0} total gigs posted
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
          <p className="text-3xl font-bold text-orange-600">
            ${dashboardStats?.overview.totalEarnings || gigStats?.totalValue || 0}
          </p>
          <p className="text-sm text-gray-500">
            ${gigStats?.averageGigValue || 0} avg per gig
          </p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {dashboardStats?.recentActivities?.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500">
                  {activity.user?.name} • {new Date(activity.timestamp).toLocaleString()}
                </p>
              </div>
              {activity.amount && (
                <span className="text-lg font-semibold text-green-600">
                  ${activity.amount}
                </span>
              )}
            </div>
          )) || (
            <p className="text-gray-500">No recent activities</p>
          )}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performers</h2>
        <div className="space-y-3">
          {dashboardStats?.topPerformers?.map((performer) => (
            <div key={performer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {performer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <p className="text-sm text-gray-500">{performer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{performer.completedGigs} gigs</p>
                <p className="text-sm text-gray-500">${performer.totalEarnings}</p>
              </div>
            </div>
          )) || (
            <p className="text-gray-500">No top performers data</p>
          )}
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              dashboardStats?.platformHealth.systemStatus === 'healthy' ? 'text-green-600' :
              dashboardStats?.platformHealth.systemStatus === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {dashboardStats?.platformHealth.systemStatus === 'healthy' ? '✓' :
               dashboardStats?.platformHealth.systemStatus === 'warning' ? '⚠' : '✗'}
            </div>
            <p className="text-sm text-gray-500">System Status</p>
            <p className="font-semibold capitalize">
              {dashboardStats?.platformHealth.systemStatus || 'Unknown'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dashboardStats?.platformHealth.uptime || 0}%
            </div>
            <p className="text-sm text-gray-500">Uptime</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dashboardStats?.platformHealth.averageResponseTime || 0}ms
            </div>
            <p className="text-sm text-gray-500">Avg Response Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
