// services/gigApplicationService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Interface for gig application
export interface GigApplication {
  _id: string;
  user: string | {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  gigRequest: string | {
    _id: string;
    title: string;
    employer: {
      _id: string;
      companyName: string;
      logo?: string;
    };
    payRate: {
      amount: number;
      rateType: string;
    };
    location: {
      address: string;
      city: string;
    };
  };
  status: 'applied' | 'shortlisted' | 'hired' | 'rejected';
  coverLetter?: string;
  appliedAt: string;
  updatedAt: string;
  timeSlots?: Array<{
    date: string;
    startTime: string;
    endTime: string;
  }>;
  employerFeedback?: string;
  interviewDetails?: {
    date: string;
    location: string;
    notes: string;
  };
  isArchived: boolean;
}

// Interface for creating a new application
export interface CreateApplicationRequest {
  gigRequestId: string;
  coverLetter?: string;
  timeSlots?: Array<{
    timeSlotId: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

// Interface for filtering applications
export interface ApplicationFilters {
  status?: 'applied' | 'shortlisted' | 'hired' | 'rejected' | 'all';
  sortBy?: 'appliedAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  isArchived?: boolean;
}

class GigApplicationService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/gig-applications${endpoint}`;
      
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

  // Get all applications for current user
  async getMyApplications(filters?: ApplicationFilters): Promise<ApiResponse<{ applications: GigApplication[], total: number }>> {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.isArchived !== undefined) params.append('isArchived', filters.isArchived.toString());
      
      queryParams = `?${params.toString()}`;
    }
    
    return await this.makeRequest<{ applications: GigApplication[], total: number }>(`/my-applications${queryParams}`);
  }

  // Get a specific application by ID
  async getApplicationById(id: string): Promise<ApiResponse<GigApplication>> {
    return await this.makeRequest<GigApplication>(`/${id}`);
  }

  // Create a new application
  async createApplication(applicationData: CreateApplicationRequest): Promise<ApiResponse<GigApplication>> {
    return await this.makeRequest<GigApplication>('/', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  // Alternative way to apply directly through a gig request
  async applyToGig(gigRequestId: string, applicationData: Omit<CreateApplicationRequest, 'gigRequestId'>): Promise<ApiResponse<GigApplication>> {
    return await this.makeRequest<GigApplication>(`/gig-requests/${gigRequestId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  // Withdraw an application
  async withdrawApplication(applicationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/${applicationId}/withdraw`, {
      method: 'PATCH',
    });
  }

  // Update application (e.g., update cover letter)
  async updateApplication(applicationId: string, updates: { coverLetter?: string }): Promise<ApiResponse<GigApplication>> {
    return await this.makeRequest<GigApplication>(`/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Archive application
  async archiveApplication(applicationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/${applicationId}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived: true }),
    });
  }

  // Unarchive application
  async unarchiveApplication(applicationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/${applicationId}/archive`, {
      method: 'PATCH',
      body: JSON.stringify({ isArchived: false }),
    });
  }
}

export const gigApplicationService = new GigApplicationService();
