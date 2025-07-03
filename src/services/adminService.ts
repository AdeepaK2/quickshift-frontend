// services/adminService.ts
import { ApiResponse } from '@/types/auth';
import { GigRequest, GigRequestsFilters as GigFilters } from './gigRequestService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Interface for admin user
export interface AdminUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  phone?: string;
  isActive: boolean;
  permissions: {
    canCreateAdmin: boolean;
    canDeleteAdmin: boolean;
    canManageUsers: boolean;
    canManageEmployers: boolean;
    canManageGigs: boolean;
    canAccessFinancials: boolean;
    canManageSettings: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for user (student) data
export interface AdminUserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  university?: string;
  faculty?: string;
  yearOfStudy?: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  bio?: string;
  profilePicture?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  studentIdVerified?: boolean;
  employmentStats?: {
    totalGigsCompleted: number;
    totalEarnings: number;
    averageRating: number;
    gigApplications?: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Interface for employer data
export interface AdminEmployerData {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  companyDescription?: string;
  isVerified: boolean;
  isActive: boolean;
  ratings?: {
    averageRating: number;
    totalReviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Interface for dashboard statistics
export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalEmployers: number;
    totalGigs: number;
    activeGigs: number;
    completedGigs: number;
    totalAdmins: number;
  };
  recentActivity: {
    newUsersLastMonth: number;
    newEmployersLastMonth: number;
    newGigsLastMonth: number;
  };
  topStudents?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    university?: string;
    ratings?: {
      averageRating: number;
      totalReviews: number;
    };
  }>;
  topEmployers?: Array<{
    _id: string;
    companyName: string;
    email: string;
    location?: string;
    ratings?: {
      averageRating: number;
      totalReviews: number;
    };
  }>;
  generatedAt: string;
}

// Interface for creating admin
export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'super_admin';
  phone?: string;
  permissions?: Partial<AdminUser['permissions']>;
}

// Interface for updating admin
export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'admin' | 'super_admin';
  isActive?: boolean;
  permissions?: Partial<AdminUser['permissions']>;
}

// Interface for filters
export interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'admin' | 'super_admin';
  isActive?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}

export interface EmployerFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface GigRequestsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
  isOpen?: boolean;
}

class AdminService {
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
        console.error('Admin API Request Error:', error.message);
        throw error;
      } else {
        console.error('Unknown Admin API Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return await this.makeRequest<DashboardStats>('/dashboard');
  }

  // Admin Management Methods
  async getAllAdmins(filters?: AdminFilters): Promise<ApiResponse<{ 
    data: AdminUser[]; 
    total: number; 
    page: number; 
    pages: number; 
    count: number;
  }>> {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      queryParams = `?${params.toString()}`;
    }
    
    return await this.makeRequest<{ 
      data: AdminUser[]; 
      total: number; 
      page: number; 
      pages: number; 
      count: number;
    }>(`${queryParams}`);
  }

  async getAdminById(id: string): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>(`/${id}`);
  }

  async createAdmin(adminData: CreateAdminRequest): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>('/', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  }

  async updateAdmin(id: string, adminData: UpdateAdminRequest): Promise<ApiResponse<AdminUser>> {
    return await this.makeRequest<AdminUser>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(adminData),
    });
  }

  async deleteAdmin(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // User Management Methods
  async getAllUsers(filters?: UserFilters): Promise<ApiResponse<{ 
    data: AdminUserData[]; 
    total: number; 
    page: number; 
    pages: number; 
    count: number;
  }>> {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
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
  }

  async getUserById(id: string): Promise<ApiResponse<AdminUserData>> {
    return await this.makeRequest<AdminUserData>(`/users/${id}`);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<AdminUserData>> {
    return await this.makeRequest<AdminUserData>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async verifyStudent(id: string): Promise<ApiResponse<AdminUserData>> {
    return await this.makeRequest<AdminUserData>(`/users/${id}/verify`, {
      method: 'PATCH',
    });
  }

  // Employer Management Methods
  async getAllEmployers(filters?: EmployerFilters): Promise<ApiResponse<{ 
    data: AdminEmployerData[]; 
    total: number; 
    page: number; 
    pages: number; 
    count: number;
  }>> {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
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
  }

  async getEmployerById(id: string): Promise<ApiResponse<AdminEmployerData>> {
    return await this.makeRequest<AdminEmployerData>(`/employers/${id}`);
  }

  async updateEmployerStatus(id: string, isActive: boolean): Promise<ApiResponse<AdminEmployerData>> {
    return await this.makeRequest<AdminEmployerData>(`/employers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async verifyEmployer(id: string): Promise<ApiResponse<AdminEmployerData>> {
    return await this.makeRequest<AdminEmployerData>(`/employers/${id}/verify`, {
      method: 'PATCH',
    });
  }

  // Gig Management Methods (using existing gigRequestService)
  async getAllGigs(filters?: GigFilters): Promise<ApiResponse<{ 
    gigRequests: GigRequest[], 
    total: number, 
    page: number, 
    pages: number 
  }>> {
    // Import and use gigRequestService to get all gigs for admin view
    const { gigRequestService } = await import('./gigRequestService');
    return gigRequestService.getAllGigRequests(filters);
  }

  async updateGigStatus(id: string, status: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled'): Promise<ApiResponse<GigRequest>> {
    const { gigRequestService } = await import('./gigRequestService');
    return gigRequestService.changeGigRequestStatus(id, status);
  }

  async deleteGig(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    const { gigRequestService } = await import('./gigRequestService');
    return gigRequestService.deleteGigRequest(id);
  }

  // Reported Entities Methods
  async getReportedEntities(entityType: 'users' | 'employers', filters?: { page?: number, limit?: number }): Promise<ApiResponse<{
    data: (AdminUserData | AdminEmployerData)[],
    total: number,
    page: number, 
    pages: number,
    count: number
  }>> {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
      queryParams = `?${params.toString()}`;
    }
    
    return await this.makeRequest<{
      data: (AdminUserData | AdminEmployerData)[],
      total: number,
      page: number, 
      pages: number,
      count: number
    }>(`/reports/${entityType}${queryParams}`);
  }
}

export const adminService = new AdminService();
export default adminService;
