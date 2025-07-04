// services/authService.ts
import { 
  ApiResponse, 
  LoginRequest, 
  RegisterUserRequest, 
  RegisterEmployerRequest, 
  ForgotPasswordRequest, 
  VerifyOTPRequest, 
  ResetPasswordRequest, 
  ResendOTPRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  UserProfileResponse
} from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class AuthService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api/auth${endpoint}`;
      
      console.log(`Making request to: ${url}`); // Debug log
      
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      console.log(`Response status: ${response.status}`); // Debug log

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data); // Debug log
        
        // Handle different error scenarios
        if (response.status === 400 && data.errors) {
          // Validation errors
          const errorMessages = data.errors.map((err: { message: string }) => err.message).join(', ');
          throw new Error(errorMessages);
        } else if (response.status === 401) {
          throw new Error(data.message || 'Invalid credentials');
        } else if (response.status === 403) {
          throw new Error(data.message || 'Access denied');
        } else if (response.status === 409) {
          throw new Error(data.message || 'Email already exists');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Request failed');
        }
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network Error - likely CORS or server unavailable:', error);
        throw new Error('Unable to connect to server. Please check your internet connection and try again.');
      } else if (error instanceof Error) {
        console.error('API Request Error:', error.message);
        throw error;
      } else {
        console.error('Unknown API Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.makeRequest<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Validate response structure
      if (!response.data?.tokens?.accessToken || !response.data?.tokens?.refreshToken) {
        throw new Error('Invalid login response: missing tokens');
      }

      if (!response.data.user) {
        throw new Error('Invalid login response: missing user data');
      }

      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async adminLogin(credentials: Omit<LoginRequest, 'userType'>): Promise<ApiResponse<LoginResponse>> {
    try {
      // FIX: Use correct endpoint for admin login
      const response = await this.makeRequest<LoginResponse>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ ...credentials, userType: 'admin' }),
      });

      // Validate response structure
      if (!response.data?.tokens?.accessToken || !response.data?.tokens?.refreshToken) {
        throw new Error('Invalid admin login response: missing tokens');
      }

      if (!response.data.user) {
        throw new Error('Invalid admin login response: missing user data');
      }

      return response;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async registerUser(userData: RegisterUserRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      // Validate input data
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('Missing required fields for user registration');
      }

      const response = await this.makeRequest<RegisterResponse>('/register/user', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Validate response structure
      if (!response.data?.tokens?.accessToken || !response.data?.tokens?.refreshToken) {
        throw new Error('Invalid registration response: missing tokens');
      }

      if (!response.data.user) {
        throw new Error('Invalid registration response: missing user data');
      }

      return response;
    } catch (error) {
      console.error('User registration error:', error);
      throw error;
    }
  }

  async registerEmployer(userData: RegisterEmployerRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      // Validate input data
      if (!userData.email || !userData.password || !userData.companyName) {
        throw new Error('Missing required fields for employer registration');
      }

      const response = await this.makeRequest<RegisterResponse>('/register/employer', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Validate response structure
      if (!response.data?.tokens?.accessToken || !response.data?.tokens?.refreshToken) {
        throw new Error('Invalid registration response: missing tokens');
      }

      if (!response.data.employer && !response.data.user) {
        throw new Error('Invalid registration response: missing employer data');
      }

      return response;
    } catch (error) {
      console.error('Employer registration error:', error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<ApiResponse<void>> {
    try {
      return await this.makeRequest<void>('/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error for logout - we'll clear local storage anyway
      return { success: false, message: 'Logout failed' };
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token is required');
      }

      const response = await this.makeRequest<RefreshTokenResponse>('/refresh-token', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      // Validate response structure
      if (!response.data?.tokens?.accessToken || !response.data?.tokens?.refreshToken) {
        throw new Error('Invalid refresh token response: missing tokens');
      }

      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  // Password Reset Methods
  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    try {
      if (!data.email) {
        throw new Error('Email is required for password reset');
      }

      return await this.makeRequest<void>('/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<ApiResponse<void>> {
    try {
      if (!data.email || !data.otp || !data.purpose) {
        throw new Error('Email, OTP, and purpose are required');
      }

      return await this.makeRequest<void>('/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      if (!data.email || !data.otp || !data.password) {
        throw new Error('Email, OTP, and new password are required');
      }

      const response = await this.makeRequest<LoginResponse>('/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // If the response contains tokens, it means user is automatically logged in
      if (response.success && response.data?.tokens) {
        this.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        
        if (response.data.userType) {
          this.setUserType(response.data.userType);
        }
        
        if (response.data.user) {
          this.setUser(response.data.user);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async resendOTP(data: ResendOTPRequest): Promise<ApiResponse<void>> {
    try {
      if (!data.email || !data.purpose) {
        throw new Error('Email and purpose are required');
      }

      return await this.makeRequest<void>('/resend-otp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }

  // Profile Methods
  async getCurrentUser(token: string): Promise<ApiResponse<UserProfileResponse>> {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      return await this.makeRequest<UserProfileResponse>('/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async updateProfile(token: string, profileData: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      return await this.makeRequest('/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async changePassword(token: string, passwordData: { currentPassword: string; newPassword: string; confirmNewPassword: string }): Promise<ApiResponse<void>> {
    try {
      if (!token) {
        throw new Error('Access token is required');
      }

      if (!passwordData.currentPassword || !passwordData.newPassword) {
        throw new Error('Current password and new password are required');
      }

      return await this.makeRequest<void>('/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // FIXED: Token Management with proper error handling
  setTokens(accessToken: string, refreshToken: string): void {
    try {
      if (!this.isBrowser()) return;
      
      console.log('AuthService: Setting tokens...');
      
      // Set in localStorage for client-side access
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set in cookies for middleware access with proper settings for development
      const accessTokenExpiry = 24 * 60 * 60; // 24 hours in seconds
      const refreshTokenExpiry = 7 * 24 * 60 * 60; // 7 days in seconds
      
      // Check if we're in development mode to set appropriate cookie settings
      const isProduction = window.location.protocol === 'https:';
      const cookieSettings = isProduction 
        ? 'path=/; secure; samesite=strict' 
        : 'path=/; samesite=lax';
      
      document.cookie = `accessToken=${accessToken}; ${cookieSettings}; max-age=${accessTokenExpiry}`;
      document.cookie = `refreshToken=${refreshToken}; ${cookieSettings}; max-age=${refreshTokenExpiry}`;
      
      console.log('AuthService: Tokens set successfully');
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  }

  getAccessToken(): string | null {
    try {
      if (!this.isBrowser()) return null;
      return localStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      if (!this.isBrowser()) return null;
      return localStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  clearTokens(): void {
    try {
      if (!this.isBrowser()) return;
      
      console.log('AuthService: Clearing tokens...');
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');

      // Clear cookies by setting them to expire immediately
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'userType=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      console.log('AuthService: Tokens cleared successfully');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  setUserType(userType: string): void {
    try {
      if (!this.isBrowser()) return;
      
      console.log('AuthService: Setting userType:', userType);
      localStorage.setItem('userType', userType);
      
      // Also set in cookies for middleware access with appropriate settings
      const isProduction = window.location.protocol === 'https:';
      const cookieSettings = isProduction 
        ? 'path=/; secure; samesite=strict' 
        : 'path=/; samesite=lax';
      
      document.cookie = `userType=${userType}; ${cookieSettings}; max-age=2592000`;
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  }

  getUserType(): string | null {
    try {
      if (!this.isBrowser()) return null;
      return localStorage.getItem('userType');
    } catch (error) {
      console.error('Error getting user type:', error);
      return null;
    }
  }

  setUser(user: Record<string, unknown>): void {
    try {
      if (!this.isBrowser()) return;
      
      console.log('AuthService: Setting user data...');
      localStorage.setItem('user', JSON.stringify(user));
      console.log('AuthService: User data set successfully');
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }

  // FIXED: getUser with proper error handling for JSON parsing
  getUser(): Record<string, unknown> | null {
    try {
      if (!this.isBrowser()) return null;
      
      const userString = localStorage.getItem('user');
      console.log('AuthService: Getting user, raw value:', userString);
      
      // Handle edge cases
      if (!userString || userString === 'undefined' || userString === 'null') {
        console.log('AuthService: No valid user data found');
        return null;
      }
      
      try {
        const parsedUser = JSON.parse(userString);
        console.log('AuthService: User data parsed successfully');
        return parsedUser;
      } catch (parseError) {
        console.error('AuthService: Failed to parse user data:', parseError);
        // Clear the corrupted data
        localStorage.removeItem('user');
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  isAuthenticated(): boolean {
    const hasToken = !!this.getAccessToken();
    const hasUser = !!this.getUser();
    console.log('AuthService: isAuthenticated check:', { hasToken, hasUser });
    return hasToken && hasUser;
  }

  // Utility method to check if we're in a browser environment
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // ADDED: Clear corrupted localStorage data
  clearCorruptedData(): void {
    try {
      if (!this.isBrowser()) return;
      
      console.log('AuthService: Clearing potentially corrupted data...');
      
      // Check each item and clear if corrupted
      const items = ['accessToken', 'refreshToken', 'userType', 'user'];
      
      items.forEach(item => {
        try {
          const value = localStorage.getItem(item);
          if (value === 'undefined' || value === 'null') {
            console.log(`AuthService: Clearing corrupted ${item}:`, value);
            localStorage.removeItem(item);
          }
        } catch (error) {
          console.error(`Error checking ${item}:`, error);
          localStorage.removeItem(item);
        }
      });
      
      console.log('AuthService: Corrupted data cleanup complete');
    } catch (error) {
      console.error('Error clearing corrupted data:', error);
    }
  }
}

export const authService = new AuthService();
