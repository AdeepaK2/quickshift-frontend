'use client';
import { useState, useEffect } from 'react';
import { Job, Applicant } from '@/types/employer';
import Card from '@/components/ui/Card';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    pendingApplicants: 0,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Active Jobs</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Applicants</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalApplicants}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Reviews</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingApplicants}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Software Developer</span>
              <span className="text-xs text-green-600">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Marketing Manager</span>
              <span className="text-xs text-green-600">Active</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Applicants</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">John Doe</span>
              <span className="text-xs text-orange-600">Pending</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Jane Smith</span>
              <span className="text-xs text-orange-600">Pending</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}