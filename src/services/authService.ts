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
      const response = await fetch(`${API_BASE_URL}/api/auth${endpoint}`, {
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
      console.error('API Request Error:', error);
      throw error;
    }
  }
  // Authentication Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async adminLogin(credentials: Omit<LoginRequest, 'userType'>): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, userType: 'admin' }),
    });
  }
  async registerUser(userData: RegisterUserRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.makeRequest<RegisterResponse>('/register/user', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerEmployer(userData: RegisterEmployerRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.makeRequest<RegisterResponse>('/register/employer', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(refreshToken: string) {
    return this.makeRequest('/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }
  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.makeRequest<RefreshTokenResponse>('/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // Password Reset Methods
  async forgotPassword(data: ForgotPasswordRequest) {
    return this.makeRequest('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: VerifyOTPRequest) {
    return this.makeRequest('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }  async resetPassword(data: ResetPasswordRequest) {
    try {
      const response = await this.makeRequest<LoginResponse>('/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    
      // If the response contains tokens, save them
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
      console.error('Reset Password Error:', error);
      throw error;
    }
  }

  async resendOTP(data: ResendOTPRequest) {
    return this.makeRequest('/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  // Profile Methods
  async getCurrentUser(token: string): Promise<ApiResponse<UserProfileResponse>> {
    return this.makeRequest<UserProfileResponse>('/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async updateProfile(token: string, profileData: Record<string, unknown>) {
    return this.makeRequest('/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(token: string, passwordData: { currentPassword: string; newPassword: string; confirmNewPassword: string }) {
    return this.makeRequest('/change-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),    });
  }

  // Token Management
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== 'undefined') {
      // Set in localStorage for client-side access
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set in cookies for middleware access
      document.cookie = `accessToken=${accessToken}; path=/; max-age=2592000`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=2592000`;
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('user');
    }
  }
  setUserType(userType: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userType', userType);
      // Also set in cookies for middleware access
      document.cookie = `userType=${userType}; path=/; max-age=2592000`;
    }
  }

  getUserType(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userType');
    }
    return null;
  }
  setUser(user: Record<string, unknown>) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): Record<string, unknown> | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();