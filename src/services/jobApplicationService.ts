// services/jobApplicationService.ts
// Customized ApiResponse type for this service
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface ApplicationRequest {
  userId: string;
  gigRequestId: string;
  coverLetter?: string;
  timeSlots?: Array<{
    timeSlotId: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export interface ApplicationResponse {
  _id: string;
  status: 'applied' | 'shortlisted' | 'hired' | 'rejected';
  appliedAt: string;
  user: string;
  gigRequest: string;
  coverLetter?: string;
}

class JobApplicationService {
  // Helper method to get auth cookie
  private getAuthCookie(name: string): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Try to get token from both localStorage and cookies for better reliability
      const token = localStorage.getItem('token') || this.getAuthCookie('accessToken');
      
      if (!token) {
        console.warn('No authentication token found. User may not be logged in.');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred'
        };
      }

      return {
        success: true,
        message: data.message || 'Success',
        data: data.data
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token') || this.getAuthCookie('accessToken');
    return !!token;
  }

  // Apply for a job/gig
  async applyForJob(application: ApplicationRequest): Promise<ApiResponse<ApplicationResponse>> {
    return await this.makeRequest<ApplicationResponse>('/api/gig-applications', {
      method: 'POST',
      body: JSON.stringify(application)
    });
  }

  // Alternative - Apply directly through gig request
  async applyDirectly(gigRequestId: string, application: Omit<ApplicationRequest, 'gigRequestId'>): Promise<ApiResponse<ApplicationResponse>> {
    // Check login status first
    if (!this.isLoggedIn()) {
      console.error('User is not logged in. Cannot apply for job.');
      return {
        success: false,
        message: 'You must be logged in to apply for jobs'
      };
    }

    return await this.makeRequest<ApplicationResponse>(`/api/gig-requests/${gigRequestId}/apply`, {
      method: 'POST',
      body: JSON.stringify(application)
    });
  }

  // Get all applications for the current user
  async getMyApplications(filters?: { status?: string, page?: number, limit?: number }): Promise<ApiResponse<{ applications: ApplicationResponse[], total: number, page: number, pages: number }>> {
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
    
    return await this.makeRequest<{ applications: ApplicationResponse[], total: number, page: number, pages: number }>(`/api/gig-applications/my-applications${queryParams}`);
  }

  // Withdraw an application
  async withdrawApplication(applicationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return await this.makeRequest<{ success: boolean }>(`/api/gig-applications/${applicationId}`, {
      method: 'DELETE'
    });
  }
}

export const jobApplicationService = new JobApplicationService();
