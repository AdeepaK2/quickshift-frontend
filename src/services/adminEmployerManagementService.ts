// services/adminEmployerManagementService.ts
import { ApiResponse } from '@/types/auth';
import { AdminEmployerData } from './adminService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface EmployerActionRequest {
  employerId: string;
  reason?: string;
  notifyEmployer?: boolean;
}

export interface EmployerFilters {
  search?: string;
  companyName?: string;
  industry?: string;
  isActive?: boolean;
  isVerified?: boolean;
  companySize?: string;
  dateFrom?: string;
  dateTo?: string;
  hasActiveGigs?: boolean;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'totalGigsPosted' | 'companyName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface EmployerStats {
  totalEmployers: number;
  activeEmployers: number;
  verifiedEmployers: number;
  newEmployersThisMonth: number;
  employerGrowthRate: number;
  topIndustries: Array<{
    name: string;
    employerCount: number;
  }>;
  employersByCompanySize: Array<{
    size: string;
    employerCount: number;
  }>;
  totalJobsPosted: number;
  totalPaymentsMade: number;
}

class AdminEmployerManagementService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = `${API_BASE_URL}/api/admin${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Cache-Control': 'no-cache', // Add cache control header
          ...options.headers,
        },
        credentials: 'include', // Add credentials
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          // Clear token and redirect to login (handled by middleware)
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }
        
        throw new Error(data.message || `Request failed with status ${response.status}`);
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

  // Get all employers with filtering and pagination
  async getAllEmployers(filters?: EmployerFilters): Promise<ApiResponse<{
    data: AdminEmployerData[];
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
        data: AdminEmployerData[];
        total: number;
        page: number;
        pages: number;
        count: number;
      }>(`/employers${queryParams}`);
    } catch (error) {
      console.error('Error fetching employers:', error);
      throw error;
    }
  }

  // Get employer by ID
  async getEmployerById(id: string): Promise<ApiResponse<AdminEmployerData>> {
    try {
      return await this.makeRequest<AdminEmployerData>(`/employers/${id}`);
    } catch (error) {
      console.error('Error fetching employer:', error);
      throw error;
    }
  }

  // Activate employer
  async activateEmployer(request: EmployerActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/employers/${request.employerId}/activate`, {
        method: 'PATCH',
        body: JSON.stringify({
          reason: request.reason,
          notifyEmployer: request.notifyEmployer
        }),
      });
    } catch (error) {
      console.error('Error activating employer:', error);
      throw error;
    }
  }

  // Deactivate employer
  async deactivateEmployer(request: EmployerActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/employers/${request.employerId}/deactivate`, {
        method: 'PATCH',
        body: JSON.stringify({
          reason: request.reason,
          notifyEmployer: request.notifyEmployer
        }),
      });
    } catch (error) {
      console.error('Error deactivating employer:', error);
      throw error;
    }
  }

  // Verify employer
  async verifyEmployer(request: EmployerActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/employers/${request.employerId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          reason: request.reason,
          notifyEmployer: request.notifyEmployer
        }),
      });
    } catch (error) {
      console.error('Error verifying employer:', error);
      throw error;
    }
  }

  // Delete employer
  async deleteEmployer(request: EmployerActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/employers/${request.employerId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          reason: request.reason,
          notifyEmployer: request.notifyEmployer
        }),
      });
    } catch (error) {
      console.error('Error deleting employer:', error);
      throw error;
    }
  }

  // Get employer statistics
  async getEmployerStats(): Promise<ApiResponse<EmployerStats>> {
    try {
      return await this.makeRequest<EmployerStats>('/employers/stats');
    } catch (error) {
      console.error('Error fetching employer stats:', error);
      throw error;
    }
  }

  // Send notification to employer
  async sendNotificationToEmployer(employerId: string, message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info'): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/employers/${employerId}/notify`, {
        method: 'POST',
        body: JSON.stringify({ message, type }),
      });
    } catch (error) {
      console.error('Error sending notification to employer:', error);
      throw error;
    }
  }

  // Export employers data
  async exportEmployers(filters?: EmployerFilters, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
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
      
      return await this.makeRequest<{ downloadUrl: string }>(`/employers/export?${queryParams}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error exporting employers:', error);
      throw error;
    }
  }

  // Get employer's gig history
  async getEmployerGigHistory(employerId: string, page = 1, limit = 20): Promise<ApiResponse<{
    gigs: Array<{
      id: string;
      title: string;
      description: string;
      paymentAmount: number;
      status: string;
      applicationsCount: number;
      createdAt: string;
      completedAt?: string;
    }>;
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await this.makeRequest<{
        gigs: Array<{
          id: string;
          title: string;
          description: string;
          paymentAmount: number;
          status: string;
          applicationsCount: number;
          createdAt: string;
          completedAt?: string;
        }>;
        total: number;
        page: number;
        pages: number;
      }>(`/employers/${employerId}/gigs?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching employer gig history:', error);
      throw error;
    }
  }

  // Get employer activity log
  async getEmployerActivityLog(employerId: string, page = 1, limit = 20): Promise<ApiResponse<{
    activities: Array<{
      id: string;
      action: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
      timestamp: string;
    }>;
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await this.makeRequest<{
        activities: Array<{
          id: string;
          action: string;
          description: string;
          ipAddress?: string;
          userAgent?: string;
          timestamp: string;
        }>;
        total: number;
        page: number;
        pages: number;
      }>(`/employers/${employerId}/activity?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching employer activity log:', error);
      throw error;
    }
  }

  // Get employer reviews
  async getEmployerReviews(employerId: string, page = 1, limit = 10): Promise<ApiResponse<{
    reviews: Array<{
      _id: string;
      rating: number;
      comment: string;
      reviewer: {
        _id: string;
        firstName: string;
        lastName: string;
      };
      createdAt: string;
      isHidden: boolean;
    }>;
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await this.makeRequest<{
        reviews: Array<{
          _id: string;
          rating: number;
          comment: string;
          reviewer: {
            _id: string;
            firstName: string;
            lastName: string;
          };
          createdAt: string;
          isHidden: boolean;
        }>;
        total: number;
        page: number;
        pages: number;
      }>(`/employers/${employerId}/reviews?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching employer reviews:', error);
      throw error;
    }
  }

  // Hide/show employer review (moderation)
  async toggleReviewVisibility(employerId: string, reviewId: string, isHidden: boolean): Promise<ApiResponse<{
    success: boolean;
    review: {
      _id: string;
      isHidden: boolean;
    };
  }>> {
    try {
      return await this.makeRequest<{
        success: boolean;
        review: {
          _id: string;
          isHidden: boolean;
        };
      }>(`/employers/${employerId}/reviews/${reviewId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isHidden }),
      });
    } catch (error) {
      console.error('Error toggling review visibility:', error);
      throw error;
    }
  }

  // Bulk employer actions
  async bulkEmployerAction(request: {
    employerIds: string[];
    action: 'activate' | 'deactivate' | 'delete' | 'verify';
    reason?: string;
    notifyEmployers?: boolean;
  }): Promise<ApiResponse<{
    success: boolean;
    processed: number;
    failed: number;
    results: Array<{ employerId: string; success: boolean; error?: string }>;
  }>> {
    try {
      return await this.makeRequest<{
        success: boolean;
        processed: number;
        failed: number;
        results: Array<{ employerId: string; success: boolean; error?: string }>;
      }>('/employers/bulk-action', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Error performing bulk employer action:', error);
      throw error;
    }
  }

  // Get employer payment history
  async getEmployerPaymentHistory(employerId: string, page = 1, limit = 10): Promise<ApiResponse<{
    payments: Array<{
      _id: string;
      amount: number;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
      paymentMethod: string;
      transactionId: string;
      gigTitle: string;
      gigId: string;
      createdAt: string;
      completedAt?: string;
    }>;
    total: number;
    page: number;
    pages: number;
    totalAmount: number;
  }>> {
    try {
      return await this.makeRequest<{
        payments: Array<{
          _id: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          paymentMethod: string;
          transactionId: string;
          gigTitle: string;
          gigId: string;
          createdAt: string;
          completedAt?: string;
        }>;
        total: number;
        page: number;
        pages: number;
        totalAmount: number;
      }>(`/employers/${employerId}/payments?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching employer payment history:', error);
      throw error;
    }
  }

  // Verify employer payment information
  async verifyEmployerPaymentMethod(employerId: string): Promise<ApiResponse<{ 
    success: boolean;
    verified: boolean;
    paymentMethods: Array<{
      id: string;
      type: string;
      lastFour?: string;
      expiryDate?: string;
      isDefault: boolean;
      isVerified: boolean;
    }>;
  }>> {
    try {
      return await this.makeRequest<{ 
        success: boolean;
        verified: boolean;
        paymentMethods: Array<{
          id: string;
          type: string;
          lastFour?: string;
          expiryDate?: string;
          isDefault: boolean;
          isVerified: boolean;
        }>;
      }>(`/employers/${employerId}/verify-payment`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error verifying employer payment method:', error);
      throw error;
    }
  }
}

export const adminEmployerManagementService = new AdminEmployerManagementService();
export default adminEmployerManagementService;
