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
      
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = `${API_BASE_URL}/api/employers${endpoint}`;
      
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
        // Handle specific error codes
        if (response.status === 401) {
          // Clear token and redirect to login (handled by middleware)
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }
        
        throw new Error(data.message || `Request failed with status ${response.status}`);
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
    // Use auth endpoint instead of employers endpoint
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = `${API_BASE_URL}/api/auth/me`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          // Clear token and redirect to login (handled by middleware)
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }
        
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error retrieving employer profile:', error);
      
      // Create a basic fallback profile in case of errors to prevent UI breakage
      const fallbackProfile: EmployerProfile = {
        _id: '',
        companyName: 'Error Loading Profile',
        email: '',
        contactNumber: '',
        industry: '',
        description: '',
        address: '',
        city: '',
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to retrieve profile. Please try again.',
          data: fallbackProfile
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred while retrieving your profile.',
          data: fallbackProfile
        };
      }
    }
  }

  // Update employer profile
  async updateProfile(profileData: UpdateEmployerProfileRequest): Promise<ApiResponse<EmployerProfile>> {
    // Use auth endpoint instead of employers endpoint
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/auth/profile`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
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

  // Upload employer logo
  async uploadLogo(logoFile: File): Promise<ApiResponse<{ logo: string }>> {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const accessToken = localStorage.getItem('accessToken');
    
    try {
      // First check if the endpoint is ready on the backend (it returns 501 Not Implemented currently)
      const testResponse = await fetch(`${API_BASE_URL}/api/employers/logo`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });
      
      // If the backend isn't ready for uploads, use a fallback approach to simulate success
      // This allows frontend development to continue even if the backend isn't ready
      if (testResponse.status === 501) {
        console.warn('Logo upload endpoint not fully implemented on backend. Using fallback.');
        // Generate a local ObjectURL as a temporary stand-in for the uploaded image
        const objectUrl = URL.createObjectURL(logoFile);
        
        // Simulate a delay to mimic a network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          success: true,
          data: {
            logo: objectUrl
          },
          message: 'Logo uploaded successfully (simulated)'
        };
      }
      
      // If the backend is ready, proceed with the actual upload
      const response = await fetch(`${API_BASE_URL}/api/employers/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
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
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const url = `${API_BASE_URL}/api/employers/stats`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          // Clear token and redirect to login (handled by middleware)
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this resource.');
        }
        
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error retrieving employer stats:', error);
      
      // Provide fallback data in case of an error to prevent UI breakage
      const fallbackData: EmployerStats = {
        totalJobsPosted: 0,
        activeJobs: 0,
        totalApplications: 0,
        totalHires: 0,
        responseRate: 0
      };
      
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to retrieve employer statistics. Please try again.',
          data: fallbackData
        };
      } else {
        return {
          success: false,
          message: 'An unexpected error occurred while retrieving employer statistics.',
          data: fallbackData
        };
      }
    }
  }

  // Update employer password
  async updatePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    // Use auth endpoint instead of employers endpoint
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/auth/change-password`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
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

  // Get payment methods
  async getPaymentMethods(): Promise<ApiResponse<{
    paymentMethods: Array<{
      id: string;
      type: string;
      lastFour?: string;
      expiryDate?: string;
      isDefault: boolean;
      isVerified: boolean;
    }>;
  }>> {
    try {
      return await this.makeRequest<{
        paymentMethods: Array<{
          id: string;
          type: string;
          lastFour?: string;
          expiryDate?: string;
          isDefault: boolean;
          isVerified: boolean;
        }>;
      }>('/payment-methods');
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to retrieve payment methods. Please try again.'
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while retrieving payment methods.'
      };
    }
  }

  // Add payment method
  async addPaymentMethod(paymentMethodData: {
    token: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<{
    success: boolean;
    paymentMethod: {
      id: string;
      type: string;
      lastFour?: string;
      expiryDate?: string;
      isDefault: boolean;
      isVerified: boolean;
    };
  }>> {
    try {
      if (!paymentMethodData.token) {
        return {
          success: false,
          message: 'Payment token is required'
        };
      }
      
      return await this.makeRequest<{
        success: boolean;
        paymentMethod: {
          id: string;
          type: string;
          lastFour?: string;
          expiryDate?: string;
          isDefault: boolean;
          isVerified: boolean;
        };
      }>('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(paymentMethodData),
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to add payment method. Please try again.'
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while adding your payment method.'
      };
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      if (!paymentMethodId) {
        return {
          success: false,
          message: 'Payment method ID is required'
        };
      }
      
      return await this.makeRequest<{ success: boolean }>(`/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting payment method:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to delete payment method. Please try again.'
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while deleting your payment method.'
      };
    }
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 10): Promise<ApiResponse<{
    payments: Array<{
      _id: string;
      amount: number;
      status: 'pending' | 'completed' | 'failed' | 'refunded';
      paymentMethod: string;
      transactionId: string;
      gigTitle: string;
      gigId: string;
      createdAt: string;
      completedAt?: string;
    }>;
    total: number;
    page: number;
    pages: number;
    totalAmount: number;
  }>> {
    try {
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100; // Set reasonable limits
      
      return await this.makeRequest<{
        payments: Array<{
          _id: string;
          amount: number;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          paymentMethod: string;
          transactionId: string;
          gigTitle: string;
          gigId: string;
          createdAt: string;
          completedAt?: string;
        }>;
        total: number;
        page: number;
        pages: number;
        totalAmount: number;
      }>(`/payments?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Error retrieving payment history:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to retrieve payment history. Please try again.',
          data: {
            payments: [],
            total: 0,
            page: page,
            pages: 0,
            totalAmount: 0
          }
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while retrieving payment history.',
        data: {
          payments: [],
          total: 0,
          page: page,
          pages: 0,
          totalAmount: 0
        }
      };
    }
  }

  // Get financial overview
  async getFinancialOverview(): Promise<ApiResponse<{
    totalSpent: number;
    totalGigs: number;
    averagePerGig: number;
    currentMonth: number;
    previousMonth: number;
    monthlyData: Array<{
      month: string;
      amount: number;
    }>;
  }>> {
    try {
      return await this.makeRequest<{
        totalSpent: number;
        totalGigs: number;
        averagePerGig: number;
        currentMonth: number;
        previousMonth: number;
        monthlyData: Array<{
          month: string;
          amount: number;
        }>;
      }>('/financial-overview');
    } catch (error) {
      console.error('Error retrieving financial overview:', error);
      const currentDate = new Date();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      
      // Default data in case of an error
      const fallbackData = {
        totalSpent: 0,
        totalGigs: 0,
        averagePerGig: 0,
        currentMonth: 0,
        previousMonth: 0,
        monthlyData: Array(6).fill(null).map((_, i) => {
          const monthIndex = (currentDate.getMonth() - 5 + i + 12) % 12;
          return {
            month: monthNames[monthIndex],
            amount: 0
          };
        })
      };
      
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to retrieve financial overview. Please try again.',
          data: fallbackData
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while retrieving financial overview.',
        data: fallbackData
      };
    }
  }
}

export const employerService = new EmployerService();
