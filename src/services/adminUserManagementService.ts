// services/adminUserManagementService.ts
import { ApiResponse } from '@/types/auth';
import { AdminUserData } from './adminService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Extended user interfaces for admin management
export interface UserActionRequest {
  userId: string;
  reason?: string;
  notifyUser?: boolean;
}

export interface BulkUserActionRequest {
  userIds: string[];
  action: 'activate' | 'deactivate' | 'delete' | 'verify';
  reason?: string;
  notifyUsers?: boolean;
}

export interface UserFilters {
  search?: string;
  university?: string;
  faculty?: string;
  yearOfStudy?: number;
  isActive?: boolean;
  isVerified?: boolean;
  studentIdVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'totalEarnings' | 'totalGigsCompleted';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  topUniversities: Array<{
    name: string;
    userCount: number;
  }>;
  usersByFaculty: Array<{
    faculty: string;
    userCount: number;
  }>;
}

class AdminUserManagementService {
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
          ...options.headers,
        },
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

  // Get all users with filtering and pagination
  async getAllUsers(filters?: UserFilters): Promise<ApiResponse<{
    data: AdminUserData[];
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
        data: AdminUserData[];
        total: number;
        page: number;
        pages: number;
        count: number;
      }>(`/users${queryParams}`);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<AdminUserData>> {
    try {
      return await this.makeRequest<AdminUserData>(`/users/${id}`);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Activate user
  async activateUser(request: UserActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const url = `${API_BASE_URL}/api/users/${request.userId}/activate`;
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: request.reason,
          notifyUser: request.notifyUser
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to activate user');
      }

      return data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(request: UserActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const url = `${API_BASE_URL}/api/users/${request.userId}/deactivate`;
      const accessToken = localStorage.getItem('accessToken');
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: request.reason,
          notifyUser: request.notifyUser
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to deactivate user');
      }

      return data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }

  // Verify user
  async verifyUser(request: UserActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/users/${request.userId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          reason: request.reason,
          notifyUser: request.notifyUser
        }),
      });
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Delete user
  async deleteUser(request: UserActionRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/users/${request.userId}`, {
        method: 'DELETE',
        body: JSON.stringify({
          reason: request.reason,
          notifyUser: request.notifyUser
        }),
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Bulk user actions
  async bulkUserAction(request: BulkUserActionRequest): Promise<ApiResponse<{
    success: boolean;
    processed: number;
    failed: number;
    results: Array<{ userId: string; success: boolean; error?: string }>;
  }>> {
    try {
      return await this.makeRequest<{
        success: boolean;
        processed: number;
        failed: number;
        results: Array<{ userId: string; success: boolean; error?: string }>;
      }>('/users/bulk-action', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Error performing bulk user action:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      return await this.makeRequest<UserStats>('/users/stats');
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Send notification to user
  async sendNotificationToUser(userId: string, message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info'): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/users/${userId}/notify`, {
        method: 'POST',
        body: JSON.stringify({ message, type }),
      });
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Export users data
  async exportUsers(filters?: UserFilters, format: 'csv' | 'excel' = 'csv'): Promise<ApiResponse<{ downloadUrl: string }>> {
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
      
      return await this.makeRequest<{ downloadUrl: string }>(`/users/export?${queryParams}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }

  // Get user activity log
  async getUserActivityLog(userId: string, page = 1, limit = 20): Promise<ApiResponse<{
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
      }>(`/users/${userId}/activity?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching user activity log:', error);
      throw error;
    }
  }
}

export const adminUserManagementService = new AdminUserManagementService();
export default adminUserManagementService;
