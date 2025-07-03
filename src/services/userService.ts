// services/userService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Interface for user profile
export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: string;
  university?: string;
  faculty?: string;
  yearOfStudy?: number;
  studentIdVerified?: boolean;
  bio?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for user dashboard statistics
export interface UserStats {
  appliedJobs: number;
  activeGigs: number;
  completedGigs: number;
  totalEarnings: number;
  monthlyEarnings: number;
  rating: number;
  pendingPayments: number;
}

// Interface for updating user profile
export interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  university?: string;
  faculty?: string;
  yearOfStudy?: number;
  bio?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

class UserService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/users${endpoint}`;
      
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

  // Get user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return await this.makeRequest<UserProfile>('/profile');
  }

  // Update user profile
  async updateProfile(profileData: UpdateUserProfileRequest): Promise<ApiResponse<UserProfile>> {
    return await this.makeRequest<UserProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Upload profile picture
  async uploadProfilePicture(imageFile: File): Promise<ApiResponse<{ profilePicture: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);

    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Profile Picture Upload Error:', error.message);
        throw error;
      } else {
        console.error('Unknown Profile Picture Upload Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Get user statistics for dashboard
  async getStats(): Promise<ApiResponse<UserStats>> {
    return await this.makeRequest<UserStats>('/stats');
  }

  // Update user password
  async updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return await this.makeRequest<void>('/update-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  // Upload user document (student ID, etc.)
  async uploadDocument(documentType: string, file: File): Promise<ApiResponse<{ documentUrl: string }>> {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('document', file);

    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Document Upload Error:', error.message);
        throw error;
      } else {
        console.error('Unknown Document Upload Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }
}

export const userService = new UserService();
