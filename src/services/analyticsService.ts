// services/analyticsService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface EmployerAnalytics {
  // Hiring Overview
  applicationsThisMonth: number;
  interviewsConducted: number;
  successfulHires: number;
  conversionRate: number;
  
  // Cost Analysis
  totalSpentThisMonth: number;
  averageCostPerHire: number;
  jobPostingFees: number;
  workerPayments: number;
  
  // Job Performance
  jobs: {
    _id: string;
    title: string;
    applications: number;
    views: number;
    conversion: number;
    status: string;
  }[];
}

class AnalyticsService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('API Request Error:', error.message);
        throw error;
      } else {
        console.error('Unknown API Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Get employer analytics data
  async getEmployerAnalytics(): Promise<ApiResponse<EmployerAnalytics>> {
    return await this.makeRequest<EmployerAnalytics>('/analytics/employer');
  }

  // Get job performance data for the employer
  async getJobPerformance(): Promise<ApiResponse<EmployerAnalytics['jobs']>> {
    return await this.makeRequest<EmployerAnalytics['jobs']>('/analytics/employer/jobs');
  }
  
  // Since we don't have direct analytics endpoints, we'll combine data from multiple endpoints
  async getAggregatedEmployerAnalytics(): Promise<EmployerAnalytics> {
    // For now, we'll return mock data based on what we saw in the Analytics component
    // In a production environment, this would make multiple API calls to gather the data
    
    // Get job stats
    const gigRequestStats = await this.makeRequest<{
      total: number;
      active: number;
      closed: number;
      completed: number;
      cancelled: number;
      drafts: number;
      applicationsTotal: number;
    }>('/gig-requests/stats');
    
    // Get employer's gig requests
    const gigRequests = await this.makeRequest<{ 
      gigRequests: { id: string; title: string; status: string; applications: number; views: number; createdAt: string }[],
      total: number 
    }>('/gig-requests?limit=10');
    
    // Calculate conversion rate (applications/views)
    const totalApplications = gigRequestStats.data?.applicationsTotal || 0;
    const totalJobs = gigRequestStats.data?.total || 1; // Avoid division by zero
    // const avgApplicationsPerJob = totalApplications / totalJobs; // Will use this in future versions
    
    // Transform gig requests to job performance format
    const jobPerformance = gigRequests.data?.gigRequests?.map(job => ({
      _id: (job as any)._id,
      title: job.title,
      applications: (job as any).applicationsCount || 0,
      views: job.views || 0,
      conversion: job.views ? parseFloat((((job as any).applicationsCount || 0) / job.views * 100).toFixed(1)) : 0,
      status: job.status.charAt(0).toUpperCase() + job.status.slice(1)
    })) || [];
    
    // Calculate hiring overview data
    const applicationsThisMonth = totalApplications;
    const interviewsConducted = Math.round(totalApplications * 0.25); // Assumption: 25% of applications lead to interviews
    const successfulHires = Math.round(interviewsConducted * 0.6); // Assumption: 60% of interviews lead to hires
    const conversionRate = Math.round((successfulHires / totalApplications) * 100) || 0;
    
    // Calculate cost analysis data (mocked as we don't have real cost data)
    const avgRatePerHour = 1000; // LKR
    const avgHoursPerJob = 8;
    const workerPayments = successfulHires * avgRatePerHour * avgHoursPerJob;
    const jobPostingFees = totalJobs * 1500; // LKR 1500 per job posting
    const totalSpent = workerPayments + jobPostingFees;
    const avgCostPerHire = successfulHires ? Math.round(totalSpent / successfulHires) : 0;
    
    return {
      // Hiring Overview
      applicationsThisMonth,
      interviewsConducted,
      successfulHires,
      conversionRate,
      
      // Cost Analysis
      totalSpentThisMonth: totalSpent,
      averageCostPerHire: avgCostPerHire,
      jobPostingFees,
      workerPayments,
      
      // Job Performance
      jobs: jobPerformance
    };
  }
}

export const analyticsService = new AnalyticsService();
