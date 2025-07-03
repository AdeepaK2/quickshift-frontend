// services/gigRequestService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Interfaces for gig request data
export interface TimeSlot {
  _id?: string;
  date: Date | string;
  startTime: Date | string;
  endTime: Date | string;
  peopleNeeded: number;
  peopleAssigned?: number;
}

export interface GigRequest {
  _id: string;
  title: string;
  description: string;
  category: string;
  employer: string | {
    _id: string;
    companyName: string;
    logo?: string;
  };
  payRate: {
    amount: number;
    rateType: 'hourly' | 'fixed' | 'daily';
  };
  timeSlots: TimeSlot[];
  location: {
    address: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements?: string[];
  benefits?: string[];
  status: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
  applicationDeadline?: Date | string;
  skillsRequired?: string[];
  experienceRequired?: string;
  educationRequired?: string;
  visibility: 'public' | 'private' | 'targeted';
  views?: number;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGigRequestRequest {
  title: string;
  description: string;
  category: string;
  payRate: {
    amount: number;
    rateType: 'hourly' | 'fixed' | 'daily';
  };
  timeSlots: Omit<TimeSlot, '_id'>[];
  location: {
    address: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements?: string[];
  benefits?: string[];
  applicationDeadline?: Date | string;
  skillsRequired?: string[];
  experienceRequired?: string;
  educationRequired?: string;
  visibility?: 'public' | 'private' | 'targeted';
}

export interface UpdateGigRequestRequest {
  title?: string;
  description?: string;
  category?: string;
  payRate?: {
    amount: number;
    rateType: 'hourly' | 'fixed' | 'daily';
  };
  timeSlots?: TimeSlot[];
  location?: {
    address: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements?: string[];
  benefits?: string[];
  status?: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
  applicationDeadline?: Date | string;
  skillsRequired?: string[];
  experienceRequired?: string;
  educationRequired?: string;
  visibility?: 'public' | 'private' | 'targeted';
}

export interface GigRequestsFilters {
  status?: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled';
  category?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'applicationsCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

class GigRequestService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/gig-requests${endpoint}`;
      
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

  // Get all gig requests for the employer (private route)
  async getGigRequests(filters?: GigRequestsFilters): Promise<ApiResponse<{ gigRequests: GigRequest[], total: number, page: number, pages: number }>> {
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
    
    return await this.makeRequest<{ gigRequests: GigRequest[], total: number, page: number, pages: number }>(queryParams);
  }
  
  // Get all public gig requests (for job seekers)
  async getAllGigRequests(filters?: GigRequestsFilters): Promise<ApiResponse<{ gigRequests: GigRequest[], total: number, page: number, pages: number }>> {
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
    
    return await this.makeRequest<{ gigRequests: GigRequest[], total: number, page: number, pages: number }>(`/public${queryParams}`);
  }

  // Get a single gig request by ID
  async getGigRequestById(id: string): Promise<ApiResponse<GigRequest>> {
    return await this.makeRequest<GigRequest>(`/${id}`);
  }

  // Create a new gig request
  async createGigRequest(gigRequestData: CreateGigRequestRequest): Promise<ApiResponse<GigRequest>> {
    return await this.makeRequest<GigRequest>('', {
      method: 'POST',
      body: JSON.stringify(gigRequestData),
    });
  }

  // Update an existing gig request
  async updateGigRequest(id: string, gigRequestData: UpdateGigRequestRequest): Promise<ApiResponse<GigRequest>> {
    return await this.makeRequest<GigRequest>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(gigRequestData),
    });
  }

  // Delete a gig request
  async deleteGigRequest(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return await this.makeRequest<{ deleted: boolean }>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Change the status of a gig request
  async changeGigRequestStatus(id: string, status: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled'): Promise<ApiResponse<GigRequest>> {
    return await this.makeRequest<GigRequest>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Get gig request statistics
  async getGigRequestStats(): Promise<ApiResponse<{
    total: number;
    active: number;
    closed: number;
    completed: number;
    cancelled: number;
    drafts: number;
    applicationsTotal: number;
  }>> {
    return await this.makeRequest<{
      total: number;
      active: number;
      closed: number;
      completed: number;
      cancelled: number;
      drafts: number;
      applicationsTotal: number;
    }>('/stats');
  }
}

export const gigRequestService = new GigRequestService();
