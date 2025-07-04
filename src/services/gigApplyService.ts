// services/gigApplyService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Interfaces for gig applications
export interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  rating?: number;
  bio?: string;
  university?: string;
  faculty?: string;
  yearOfStudy?: number;
}

export interface GigApplication {
  _id: string;
  gigRequest: {
    _id: string;
    title: string;
    status: string;
  };
  user: Applicant | null; // Can be null if user was deleted
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';
  coverLetter?: string;
  availableTimeSlots: string[]; // IDs of time slots
  attachments?: string[];
  feedback?: string;
  feedbackRating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GigApplicationsFilters {
  gigRequestId?: string;
  status?: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApplicationStatusUpdate {
  status: 'reviewed' | 'accepted' | 'rejected';
  feedback?: string;
  feedbackRating?: number;
}

class GigApplyService {
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
        credentials: 'include',
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

  // Get all applications as an employer
  async getApplications(filters?: GigApplicationsFilters): Promise<ApiResponse<{ applications: GigApplication[], total: number, page: number, pages: number }>> {
    let queryParams = '';
    
    try {
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      return await this.makeRequest<{ applications: GigApplication[], total: number, page: number, pages: number }>(`/employer${queryParams}`);
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Return a safe default response
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch applications',
        data: { applications: [], total: 0, page: 1, pages: 0 }
      };
    }
  }

  // Get applications for a specific gig request
  async getApplicationsForGigRequest(gigRequestId: string, filters?: Omit<GigApplicationsFilters, 'gigRequestId'>): Promise<ApiResponse<{ applications: GigApplication[], total: number, page: number, pages: number }>> {
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
    
    return await this.makeRequest<{ applications: GigApplication[], total: number, page: number, pages: number }>(`/employer/gig-request/${gigRequestId}${queryParams}`);
  }

  // Get a single application by ID
  async getApplicationById(id: string): Promise<ApiResponse<GigApplication>> {
    return await this.makeRequest<GigApplication>(`/employer/${id}`);
  }

  // Update application status
  async updateApplicationStatus(id: string, statusData: ApplicationStatusUpdate): Promise<ApiResponse<GigApplication>> {
    return await this.makeRequest<GigApplication>(`/employer/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  // Get applicant profile (detailed view)
  async getApplicantProfile(userId: string): Promise<ApiResponse<Applicant>> {
    return await this.makeRequest<Applicant>(`/employer/applicant/${userId}`);
  }

  // Get applications statistics
  async getApplicationsStats(): Promise<ApiResponse<{
    total: number;
    pending: number;
    reviewed: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  }>> {
    return await this.makeRequest<{
      total: number;
      pending: number;
      reviewed: number;
      accepted: number;
      rejected: number;
      withdrawn: number;
    }>('/employer/stats');
  }
}

export const gigApplyService = new GigApplyService();
