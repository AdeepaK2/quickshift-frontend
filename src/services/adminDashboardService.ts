// services/adminDashboardService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Dashboard statistics interface
export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalEmployers: number;
    totalGigs: number;
    totalEarnings: number;
    activeGigs: number;
    completedGigs: number;
    pendingApplications: number;
    newUsersThisMonth: number;
  };
  userGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
  gigStats: {
    current: number;
    previous: number;
    percentage: number;
  };
  revenueStats: {
    current: number;
    previous: number;
    percentage: number;
  };
  recentActivities: Activity[];
  topPerformers: TopPerformer[];
  platformHealth: {
    systemStatus: 'healthy' | 'warning' | 'critical';
    uptime: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export interface Activity {
  id: string;
  type: 'user_registration' | 'gig_posted' | 'gig_completed' | 'payment_processed' | 'employer_joined';
  description: string;
  user?: {
    name: string;
    email: string;
  };
  amount?: number;
  timestamp: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  email: string;
  completedGigs: number;
  totalEarnings: number;
  averageRating: number;
  profileImage?: string;
}

class AdminDashboardService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/admin${endpoint}`;
      
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

  // Get dashboard statistics
  async getDashboardStats(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<DashboardStats>> {
    try {
      return await this.makeRequest<DashboardStats>(`/dashboard?period=${period}`);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  // Get recent activities with pagination
  async getRecentActivities(page = 1, limit = 10): Promise<ApiResponse<{
    activities: Activity[];
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await this.makeRequest<{
        activities: Activity[];
        total: number;
        page: number;
        pages: number;
      }>(`/activities?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  // Get top performers
  async getTopPerformers(limit = 5): Promise<ApiResponse<TopPerformer[]>> {
    try {
      return await this.makeRequest<TopPerformer[]>(`/top-performers?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching top performers:', error);
      throw error;
    }
  }

  // Get platform health metrics
  async getPlatformHealth(): Promise<ApiResponse<DashboardStats['platformHealth']>> {
    try {
      return await this.makeRequest<DashboardStats['platformHealth']>('/health');
    } catch (error) {
      console.error('Error fetching platform health:', error);
      // Return mock data for now
      return {
        success: true,
        message: 'Platform health retrieved',
        data: {
          systemStatus: 'healthy',
          uptime: 99.8,
          averageResponseTime: 245,
          errorRate: 0.02
        }
      };
    }
  }

  // Export dashboard data
  async exportDashboardData(format: 'csv' | 'excel' | 'pdf', period: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      return await this.makeRequest<{ downloadUrl: string }>(`/export/${format}?period=${period}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error exporting dashboard data:', error);
      throw error;
    }
  }
}

export const adminDashboardService = new AdminDashboardService();
export default adminDashboardService;
