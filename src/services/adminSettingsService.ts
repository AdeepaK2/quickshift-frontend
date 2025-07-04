// services/adminSettingsService.ts
import { ApiResponse } from '@/types/auth';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Admin profile interfaces
export interface AdminProfile {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  phone?: string;
  isActive: boolean;
  twoFactorAuth?: boolean;
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

export interface UpdateAdminProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AdminPlatformSettings {
  maintenanceMode: boolean;
  feedbackCollection: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  passwordMinLength: number;
  sessionTimeout: number;
  allowRegistrations: boolean;
}

class AdminSettingsService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api${endpoint}`;
      
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

  // Get current admin profile
  async getCurrentAdminProfile(): Promise<ApiResponse<AdminProfile>> {
    try {
      // Try to get the profile from the new endpoint
      try {
        // Use the new endpoint that doesn't require an ID
        const profile = await this.makeRequest<AdminProfile>('/admin/profile');
        
        // Store the ID for backward compatibility
        if (profile.data && profile.data._id) {
          localStorage.setItem('currentUserId', profile.data._id);
        }
        
        return profile;
      } catch (apiError) {
        console.warn('Failed to get profile from /admin/profile endpoint, trying fallback methods...', apiError);
      }
      
      // Fallback 1: Try to get user ID from localStorage
      let currentUserId = localStorage.getItem('currentUserId');
      
      // Fallback 2: If not found, try to extract from the stored user object
      if (!currentUserId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            if (userData && userData._id) {
              currentUserId = userData._id;
              // Store it for future use
              localStorage.setItem('currentUserId', userData._id);
            }
          } catch (e) {
            console.error('Failed to parse user data from localStorage:', e);
          }
        }
      }
      
      // Fallback 3: Try to get user profile from auth API
      if (!currentUserId) {
        console.log('Attempting to retrieve user ID from current profile...');
        try {
          // Get current user profile from API
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) {
            throw new Error('No access token available');
          }
          
          const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data._id) {
              currentUserId = data.data._id;
              localStorage.setItem('currentUserId', data.data._id);
              console.log('Retrieved user ID from profile:', currentUserId);
            }
          }
        } catch (profileError) {
          console.error('Failed to retrieve user profile:', profileError);
        }
      }
      
      // If we have a user ID, try to get the profile by ID
      if (currentUserId) {
        return await this.makeRequest<AdminProfile>(`/admin/${currentUserId}`);
      }
      
      // If all methods fail, throw an error
      throw new Error('Unable to retrieve admin profile: No user ID available');
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      throw error;
    }
  }

  // Update admin profile
  async updateAdminProfile(profileData: UpdateAdminProfileRequest): Promise<ApiResponse<AdminProfile>> {
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) {
        throw new Error('No current user ID found');
      }
      
      return await this.makeRequest<AdminProfile>(`/admin/${currentUserId}`, {
        method: 'PATCH',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Access token is required');
      }

      // Use auth service method for consistency
      return await authService.changePassword(accessToken, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(): Promise<ApiResponse<{ message: string }>> {
    try {
      const profile = await this.getCurrentAdminProfile();
      
      if (!profile.data) {
        throw new Error('Unable to retrieve admin profile');
      }
      
      return await this.makeRequest<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ 
          email: profile.data.email,
          userType: 'admin'
        }),
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Get platform settings
  async getPlatformSettings(): Promise<ApiResponse<AdminPlatformSettings>> {
    try {
      return await this.makeRequest<AdminPlatformSettings>('/admin/settings/platform');
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      
      // Fallback to default settings if API call fails
      return {
        success: true,
        message: 'Settings retrieved from defaults',
        data: {
          maintenanceMode: false,
          feedbackCollection: true,
          emailNotifications: true,
          twoFactorAuth: false,
          passwordMinLength: 8,
          sessionTimeout: 30,
          allowRegistrations: true,
        }
      };
    }
  }

  // Update platform settings
  async updatePlatformSettings(settings: Partial<AdminPlatformSettings>): Promise<ApiResponse<AdminPlatformSettings>> {
    try {
      return await this.makeRequest<AdminPlatformSettings>('/admin/settings/platform', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error updating platform settings:', error);
      throw error;
    }
  }

  // Enable/disable two-factor authentication
  async toggleTwoFactorAuth(enabled: boolean): Promise<ApiResponse<{ twoFactorAuth: boolean }>> {
    try {
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) {
        throw new Error('No current user ID found');
      }
      
      return await this.makeRequest<{ twoFactorAuth: boolean }>(`/admin/${currentUserId}/two-factor`, {
        method: 'PATCH',
        body: JSON.stringify({ twoFactorAuth: enabled }),
      });
    } catch (error) {
      console.error('Error toggling two-factor auth:', error);
      throw error;
    }
  }
}

export const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;
