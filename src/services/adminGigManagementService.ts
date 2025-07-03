// services/adminGigManagementService.ts
import { ApiResponse } from '@/types/auth';
import { GigRequest } from './gigRequestService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface AdminGigData extends Omit<GigRequest, 'employer'> {
  employer: {
    _id: string;
    companyName: string;
    email: string;
    phone?: string;
    logo?: string;
  };
  applicationsCount: number;
  completedApplicationsCount: number;
  totalAmountPaid: number;
  flagged: boolean;
  flaggedReason?: string;
}

export interface GigActionRequest {
  gigId: string;
  reason?: string;
  notifyEmployer?: boolean;
  notifyApplicants?: boolean;
}

export interface GigFilters {
  search?: string;
  employerId?: string;
  companyName?: string;
  status?: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
  paymentAmountMin?: number;
  paymentAmountMax?: number;
  flagged?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'paymentAmount' | 'applicationsCount' | 'deadline';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GigStats {
  totalGigs: number;
  activeGigs: number;
  completedGigs: number;
  cancelledGigs: number;
  flaggedGigs: number;
  totalValue: number;
  averageGigValue: number;
  averageApplicationsPerGig: number;
  gigCompletionRate: number;
  popularCategories: Array<{
    category: string;
    gigCount: number;
  }>;
  paymentDistribution: Array<{
    range: string;
    gigCount: number;
  }>;
}

class AdminGigManagementService {
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

  // Get all gigs with filtering and pagination
  async getAllGigs(filters?: GigFilters): Promise<ApiResponse<{
    data: AdminGigData[];
    total: number;
    page: number;
    pages: number;
    count: number;
  }>> {
    try {
      let queryParams = '';
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      return await this.makeRequest<{
        data: AdminGigData[];
        total: number;
        page: number;
        pages: number;
        count: number;
      }>(`/gigs${queryParams}`);
    } catch (error) {
      console.error('Error fetching gigs:', error);
      throw error;
    }
  }

  // Get gig by ID
  async getGigById(id: string): Promise<ApiResponse<AdminGigData>> {
    try {
      return await this.makeRequest<AdminGigData>(`/gigs/${id}`);
    } catch (error) {
      console.error('Error fetching gig:', error);
      throw error;
    }
  }

  // Update gig status
  async updateGigStatus(gigId: string, status: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled', reason?: string): Promise<ApiResponse<AdminGigData>> {
    try {
      return await this.makeRequest<AdminGigData>(`/gigs/${gigId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      });
    } catch (error) {
      console.error('Error updating gig status:', error);
      throw error;
    }
  }

  // Flag/unflag gig
  async flagGig(request: GigActionRequest & { flag: boolean; flagReason?: string }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/gigs/${request.gigId}/flag`, {
        method: 'PATCH',
        body: JSON.stringify({
          flag: request.flag,
          flagReason: request.flagReason,
          reason: request.reason,
          notifyEmployer: request.notifyEmployer
        }),
      });
    } catch (error) {
      console.error('Error flagging gig:', error);
      throw error;
    }
  }

  // Delete gig
  async deleteGig(request: GigActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/gigs/${request.gigId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          reason: request.reason,
          notifyEmployer: request.notifyEmployer,
          notifyApplicants: request.notifyApplicants
        }),
      });
    } catch (error) {
      console.error('Error deleting gig:', error);
      throw error;
    }
  }

  // Get gig applications
  async getGigApplications(gigId: string, page = 1, limit = 20): Promise<ApiResponse<{
    applications: Array<{
      id: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        university?: string;
      };
      status: string;
      appliedAt: string;
      completedAt?: string;
      rating?: number;
      paymentAmount?: number;
    }>;
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await this.makeRequest<{
        applications: Array<{
          id: string;
          user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            university?: string;
          };
          status: string;
          appliedAt: string;
          completedAt?: string;
          rating?: number;
          paymentAmount?: number;
        }>;
        total: number;
        page: number;
        pages: number;
      }>(`/gigs/${gigId}/applications?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching gig applications:', error);
      throw error;
    }
  }

  // Get gig statistics
  async getGigStats(): Promise<ApiResponse<GigStats>> {
    try {
      return await this.makeRequest<GigStats>('/gigs/stats');
    } catch (error) {
      console.error('Error fetching gig stats:', error);
      throw error;
    }
  }

  // Send notification about gig
  async sendGigNotification(gigId: string, message: string, recipients: 'employer' | 'applicants' | 'both'): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/gigs/${gigId}/notify`, {
        method: 'POST',
        body: JSON.stringify({ message, recipients }),
      });
    } catch (error) {
      console.error('Error sending gig notification:', error);
      throw error;
    }
  }

  // Export gigs data
  async exportGigs(filters?: GigFilters, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      let queryParams = `format=${format}`;
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        queryParams += `&${params.toString()}`;
      }
      
      return await this.makeRequest<{ downloadUrl: string }>(`/gigs/export?${queryParams}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error exporting gigs:', error);
      throw error;
    }
  }

  // Bulk gig actions
  async bulkGigAction(request: {
    gigIds: string[];
    action: 'activate' | 'close' | 'cancel' | 'delete' | 'flag' | 'unflag';
    reason?: string;
    notifyEmployers?: boolean;
    notifyApplicants?: boolean;
  }): Promise<ApiResponse<{
    success: boolean;
    processed: number;
    failed: number;
    results: Array<{ gigId: string; success: boolean; error?: string }>;
  }>> {
    try {
      return await this.makeRequest<{
        success: boolean;
        processed: number;
        failed: number;
        results: Array<{ gigId: string; success: boolean; error?: string }>;
      }>('/gigs/bulk-action', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Error performing bulk gig action:', error);
      throw error;
    }
  }

  // Get flagged gigs
  async getFlaggedGigs(page = 1, limit = 20): Promise<ApiResponse<{
    data: AdminGigData[];
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await this.makeRequest<{
        data: AdminGigData[];
        total: number;
        page: number;
        pages: number;
      }>(`/gigs/flagged?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching flagged gigs:', error);
      throw error;
    }
  }

  // Get gig analytics
  async getGigAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<{
    totalGigsPosted: number;
    totalGigsCompleted: number;
    totalValueTransacted: number;
    averageCompletionTime: number;
    topPerformingCategories: Array<{
      category: string;
      gigsPosted: number;
      completionRate: number;
      averageValue: number;
    }>;
    monthlyTrends: Array<{
      month: string;
      gigsPosted: number;
      gigsCompleted: number;
      totalValue: number;
    }>;
  }>> {
    try {
      return await this.makeRequest<{
        totalGigsPosted: number;
        totalGigsCompleted: number;
        totalValueTransacted: number;
        averageCompletionTime: number;
        topPerformingCategories: Array<{
          category: string;
          gigsPosted: number;
          completionRate: number;
          averageValue: number;
        }>;
        monthlyTrends: Array<{
          month: string;
          gigsPosted: number;
          gigsCompleted: number;
          totalValue: number;
        }>;
      }>(`/gigs/analytics?period=${period}`);
    } catch (error) {
      console.error('Error fetching gig analytics:', error);
      throw error;
    }
  }
}

export const adminGigManagementService = new AdminGigManagementService();
export default adminGigManagementService;
