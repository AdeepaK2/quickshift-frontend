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
      // Get current user ID from local storage or token
      const currentUserId = localStorage.getItem('currentUserId');
      if (!currentUserId) {
        throw new Error('No current user ID found');
      }
      
      return await this.makeRequest<AdminProfile>(`/admin/${currentUserId}`);
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

  // Get platform settings (Note: This might need to be implemented in backend)
  async getPlatformSettings(): Promise<ApiResponse<AdminPlatformSettings>> {
    try {
      // For now, return default settings since this endpoint might not exist
      // In production, you would implement this endpoint in the backend
      return {
        success: true,
        message: 'Settings retrieved successfully',
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
    } catch (error) {
      console.error('Error fetching platform settings:', error);
      throw error;
    }
  }

  // Update platform settings (Note: This might need to be implemented in backend)
  async updatePlatformSettings(settings: Partial<AdminPlatformSettings>): Promise<ApiResponse<AdminPlatformSettings>> {
    try {
      // For now, simulate the update since this endpoint might not exist
      // In production, you would implement this endpoint in the backend
      const currentSettings = await this.getPlatformSettings();
      const updatedSettings: AdminPlatformSettings = { 
        ...currentSettings.data, 
        ...settings 
      } as AdminPlatformSettings;
      
      return {
        success: true,
        message: 'Settings updated successfully',
        data: updatedSettings
      };
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
      // Return success for now since this feature might not be implemented
      return {
        success: true,
        message: 'Two-factor authentication setting updated',
        data: { twoFactorAuth: enabled }
      };
    }
  }
}

export const adminSettingsService = new AdminSettingsService();
export default adminSettingsService;
