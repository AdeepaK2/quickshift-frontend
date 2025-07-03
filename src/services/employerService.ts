// services/employerService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface EmployerProfile {
  _id: string;
  companyName: string;
  email: string;
  contactNumber: string;
  industry: string;
  description: string;
  address: string;
  city: string;
  website?: string;
  logo?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateEmployerProfileRequest {
  companyName?: string;
  contactNumber?: string;
  industry?: string;
  description?: string;
  address?: string;
  city?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export interface EmployerStats {
  totalJobsPosted: number;
  activeJobs: number;
  totalApplications: number;
  totalHires: number;
  responseRate: number;
}

class EmployerService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/employers${endpoint}`;
      
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

  // Get employer profile
  async getProfile(): Promise<ApiResponse<EmployerProfile>> {
    return await this.makeRequest<EmployerProfile>('/profile');
  }

  // Update employer profile
  async updateProfile(profileData: UpdateEmployerProfileRequest): Promise<ApiResponse<EmployerProfile>> {
    return await this.makeRequest<EmployerProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Upload employer logo
  async uploadLogo(logoFile: File): Promise<ApiResponse<{ logo: string }>> {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/employers/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload logo');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Logo Upload Error:', error.message);
        throw error;
      } else {
        console.error('Unknown Logo Upload Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Get employer statistics
  async getStats(): Promise<ApiResponse<EmployerStats>> {
    return await this.makeRequest<EmployerStats>('/stats');
  }

  // Update employer password
  async updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return await this.makeRequest<void>('/update-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }
}

export const employerService = new EmployerService();
