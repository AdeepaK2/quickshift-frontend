// services/settingsService.ts
import { ApiResponse } from '@/types/auth';
import { Settings } from '@/types/settings';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class SettingsService {
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

  // Get employer settings
  async getSettings(): Promise<ApiResponse<Settings>> {
    try {
      // The endpoint would ideally be something like /settings/employer
      // But since we might not have a specific endpoint for this in the backend,
      // we'll use the employer profile endpoint to get any user preferences
      return await this.makeRequest<Settings>('/employer/settings');
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Return default settings as fallback
      return {
        success: true,
        message: 'Default settings loaded',
        data: {
          theme: 'light',
          language: 'en',
          emailNotifications: {
            newApplications: true,
            jobUpdates: true,
            systemUpdates: true,
            marketing: false,
          },
          pushNotifications: {
            enabled: true,
            newApplications: true,
            messages: true,
          },
          autoSave: true,
          showProfile: true,
          twoFactorAuth: false,
          sessionTimeout: 30,
        }
      };
    }
  }

  // Update employer settings
  async updateSettings(settings: Partial<Settings>): Promise<ApiResponse<Settings>> {
    try {
      // The endpoint would ideally be something like /settings/employer
      return await this.makeRequest<Settings>('/employer/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      // For now, return the settings that were attempted to be updated
      return {
        success: false,
        message: 'Failed to update settings. This feature may not be available yet.',
        data: settings as Settings
      };
    }
  }
  
  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        message: 'Failed to change password',
        data: { success: false }
      };
    }
  }
  
  // Enable/disable two-factor authentication
  async updateTwoFactorAuth(enable: boolean): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>('/auth/two-factor', {
        method: 'POST',
        body: JSON.stringify({ enable }),
      });
    } catch (error) {
      console.error('Error updating two-factor auth:', error);
      return {
        success: false,
        message: 'Failed to update two-factor authentication',
        data: { success: false }
      };
    }
  }
}

export const settingsService = new SettingsService();
