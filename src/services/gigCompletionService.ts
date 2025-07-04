// services/gigCompletionService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Interface for gig completion
export interface GigCompletion {
  _id: string;
  gigRequest: string | {
    _id: string;
    title: string;
    category?: string;
    location?: {
      city: string;
      address: string;
    };
    payRate?: {
      amount: number;
      rateType: string;
    };
    employer: {
      _id: string;
      companyName: string;
      logo?: string;
    };
  };
  employer: string | {
    _id: string;
    companyName: string;
    logo?: string;
  };
  status: 'in_progress' | 'completed' | 'partially_completed' | 'verified' | 'disputed';
  workers: Array<{
    worker: string | {
      _id: string;
      firstName: string;
      lastName: string;
    };
    payment: {
      status: string;
      amount: number;
    };
    completedTimeSlots: Array<{
      hoursWorked: number;
    }>;
    performance?: {
      rating?: number;
      feedback?: string;
    };
  }>;
  paymentSummary: {
    totalAmount: number;
    finalAmount: number;
    paymentStatus: 'pending' | 'processing' | 'partial' | 'completed' | 'refunded';
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a gig completion record
export interface CreateCompletionRequest {
  gigRequestId: string;
  hoursWorked: number;
  startTime: string;
  endTime: string;
  completionDate: string;
  proof?: {
    images: File[];
    description: string;
  };
}

// Interface for filtering gig completions
export interface CompletionFilters {
  status?: 'pending_confirmation' | 'confirmed' | 'disputed' | 'cancelled' | 'paid' | 'all';
  paymentStatus?: 'pending' | 'processing' | 'paid' | 'failed' | 'all';
  sortBy?: 'completionDate' | 'createdAt' | 'paymentAmount' | 'completedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

class GigCompletionService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/gig-completions${endpoint}`;
      
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

  // Get all completions for current user
  async getMyCompletions(filters?: CompletionFilters): Promise<ApiResponse<{ completions: GigCompletion[], total: number }>> {
    let queryParams = '';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.paymentStatus && filters.paymentStatus !== 'all') params.append('paymentStatus', filters.paymentStatus);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      queryParams = `?${params.toString()}`;
    }
    
    return await this.makeRequest<{ completions: GigCompletion[], total: number }>(`/my-completions${queryParams}`);
  }

  // Get a specific completion by ID
  async getCompletionById(id: string): Promise<ApiResponse<GigCompletion>> {
    return await this.makeRequest<GigCompletion>(`/${id}`);
  }

  // Create a new completion record
  async createCompletion(completionData: CreateCompletionRequest): Promise<ApiResponse<GigCompletion>> {
    // For form data with files
    if (completionData.proof?.images?.length) {
      const formData = new FormData();
      formData.append('gigRequestId', completionData.gigRequestId);
      formData.append('hoursWorked', completionData.hoursWorked.toString());
      formData.append('startTime', completionData.startTime);
      formData.append('endTime', completionData.endTime);
      formData.append('completionDate', completionData.completionDate);
      
      if (completionData.proof?.description) {
        formData.append('proofDescription', completionData.proof.description);
      }
      
      // Append each image
      completionData.proof.images.forEach((image) => {
        formData.append(`proofImages`, image);
      });
      
      const accessToken = localStorage.getItem('accessToken');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/gig-completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create completion record');
        }

        return data;
      } catch (error) {
        if (error instanceof Error) {
          console.error('Completion Creation Error:', error.message);
          throw error;
        } else {
          console.error('Unknown Completion Creation Error:', error);
          throw new Error('An unexpected error occurred');
        }
      }
    } else {
      // For regular JSON data without files
      return await this.makeRequest<GigCompletion>('/', {
        method: 'POST',
        body: JSON.stringify(completionData),
      });
    }
  }

  // Update a completion record
  async updateCompletion(completionId: string, updates: { 
    hoursWorked?: number,
    startTime?: string,
    endTime?: string
  }): Promise<ApiResponse<GigCompletion>> {
    return await this.makeRequest<GigCompletion>(`/${completionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Dispute a completion
  async disputeCompletion(completionId: string, reason: string): Promise<ApiResponse<GigCompletion>> {
    return await this.makeRequest<GigCompletion>(`/${completionId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Get payment summary/stats
  async getPaymentStats(): Promise<ApiResponse<{
    totalPaid: number;
    pendingAmount: number;
    thisMonthEarnings: number;
    paymentHistory: Array<{
      month: string;
      amount: number;
    }>;
  }>> {
    return await this.makeRequest<{
      totalPaid: number;
      pendingAmount: number;
      thisMonthEarnings: number;
      paymentHistory: Array<{
        month: string;
        amount: number;
      }>;
    }>('/payment-stats');
  }

  /**
   * Get user's completed gigs (for My Gigs section)
   * @param filters Filters to apply
   * @returns Promise<ApiResponse<{ completions: GigCompletion[] }>>
   */
  async getMyCompletedGigs(filters: CompletionFilters = {}): Promise<ApiResponse<{ completions: GigCompletion[] }>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.paymentStatus && filters.paymentStatus !== 'all') queryParams.append('paymentStatus', filters.paymentStatus);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const endpoint = `/my-completions?${queryParams.toString()}`;
      return await this.makeRequest<{ completions: GigCompletion[] }>(endpoint);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get employer's completed gigs (for Manage Jobs section)
   * @param filters Filters to apply
   * @returns Promise<ApiResponse<GigCompletion[]>>
   */
  async getEmployerCompletedGigs(filters: CompletionFilters = {}): Promise<ApiResponse<GigCompletion[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.paymentStatus && filters.paymentStatus !== 'all') queryParams.append('paymentStatus', filters.paymentStatus);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const endpoint = `/employer/completed?${queryParams.toString()}`;
      return await this.makeRequest<GigCompletion[]>(endpoint);
    } catch (error) {
      throw error;
    }
  }

  // Recalculate payments for a gig completion
  async recalculatePayments(completionId: string): Promise<ApiResponse<{
    paymentSummary: any;
    workers: Array<{
      worker: string;
      payment: any;
    }>;
  }>> {
    try {
      return await this.makeRequest<{
        paymentSummary: any;
        workers: Array<{
          worker: string;
          payment: any;
        }>;
      }>(`/${completionId}/recalculate-payments`, {
        method: 'POST'
      });
    } catch (error) {
      throw error;
    }
  }
}

export const gigCompletionService = new GigCompletionService();
