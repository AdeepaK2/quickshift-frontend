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
  status: 'draft' | 'active' | 'closed' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
  applicationDeadline?: Date | string;
  skillsRequired?: string[];
  experienceRequired?: string;
  educationRequired?: string;
  visibility: 'public' | 'private' | 'targeted';
  views?: number;
  applicationsCount?: number;
  totalPositions?: number;
  filledPositions?: number;
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
  totalPositions?: number;
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
  status?: 'draft' | 'active' | 'closed' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
  applicationDeadline?: Date | string;
  skillsRequired?: string[];
  experienceRequired?: string;
  educationRequired?: string;
  visibility?: 'public' | 'private' | 'targeted';
}

export interface GigRequestsFilters {
  status?: 'draft' | 'active' | 'closed' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
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

  private async makePublicRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api/gig-requests${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
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
  async getGigRequests(filters?: GigRequestsFilters): Promise<ApiResponse<GigRequest[]>> {
    let queryParams = '';
    
    try {
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      const response = await this.makeRequest<GigRequest[]>(queryParams);
      
      // Check if the data from API is in the expected format
      if (response.success && !Array.isArray(response.data)) {
        console.error('Invalid response format. Expected array of gig requests but got:', response.data);
        
        // Try to handle specific API response formats
        if (response.data && typeof response.data === 'object' && 'gigRequests' in response.data) {
          // If the API returns { gigRequests: [...] } format
          return {
            ...response,
            data: (response.data as any).gigRequests as GigRequest[]
          };
        }
        
        // Return a safe response with empty array if data isn't in expected format
        return {
          success: false,
          message: 'Invalid data format received from server',
          data: []
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in getGigRequests:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch gig requests',
        data: []
      };
    }
  }
  
  // Get all public gig requests (for job seekers)
  async getAllGigRequests(filters?: GigRequestsFilters): Promise<ApiResponse<GigRequest[]>> {
    let queryParams = '';
    
    try {
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(key, String(value));
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      const response = await this.makePublicRequest<GigRequest[]>(`/public${queryParams}`);
      
      // Check if the data from API is in the expected format
      if (response.success && !Array.isArray(response.data)) {
        console.error('Invalid response format. Expected array of gig requests but got:', response.data);
        
        // Try to handle legacy API response formats
        if (response.data && typeof response.data === 'object' && 'gigRequests' in response.data) {
          // If the API returns { gigRequests: [...] } format (legacy)
          return {
            ...response,
            data: (response.data as any).gigRequests as GigRequest[]
          };
        }
        
        // Return a safe response with empty array if data isn't in expected format
        return {
          success: false,
          message: 'Invalid data format received from server',
          data: []
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in getAllGigRequests:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch public gig requests',
        data: []
      };
    }
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
      credentials: 'include',
    });
  }

  // Update an existing gig request
  async updateGigRequest(id: string, gigRequestData: UpdateGigRequestRequest): Promise<ApiResponse<GigRequest>> {
    return await this.makeRequest<GigRequest>(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(gigRequestData),
      credentials: 'include',
    });
  }

  // Delete a gig request
  async deleteGigRequest(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return await this.makeRequest<{ deleted: boolean }>(`/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  // Change the status of a gig request
  async changeGigRequestStatus(id: string, status: 'draft' | 'active' | 'closed' | 'filled' | 'in_progress' | 'completed' | 'cancelled'): Promise<ApiResponse<GigRequest>> {
    return await this.makeRequest<GigRequest>(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      credentials: 'include',
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

  // Start a filled job
  async startJob(id: string): Promise<ApiResponse<GigRequest>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/employers/jobs/${id}/start`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start job');
      }

      return {
        success: true,
        message: data.message || 'Job started successfully',
        data: data.data
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Start Job Error:', error.message);
        return {
          success: false,
          message: error.message,
          data: undefined
        };
      } else {
        console.error('Unknown Start Job Error:', error);
        return {
          success: false,
          message: 'An unexpected error occurred',
          data: undefined
        };
      }
    }
  }

  // Complete a job in progress
  async completeJob(id: string, completionData?: { notes?: string, proof?: string[] }): Promise<ApiResponse<GigRequest>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/employers/jobs/${id}/complete`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          completionNotes: completionData?.notes,
          completionProof: completionData?.proof
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete job');
      }

      return {
        success: true,
        message: data.message || 'Job completed successfully',
        data: data.data
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Complete Job Error:', error.message);
        return {
          success: false,
          message: error.message,
          data: undefined
        };
      } else {
        console.error('Unknown Complete Job Error:', error);
        return {
          success: false,
          message: 'An unexpected error occurred',
          data: undefined
        };
      }
    }
  }
}

export const gigRequestService = new GigRequestService();
