// types/auth.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

export interface LoginRequest {
  email: string;
  password: string;
  userType: 'user' | 'employer' | 'admin';
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RegisterEmployerRequest {
  companyName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  userType?: 'user' | 'employer' | 'admin';
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
  purpose: 'password_reset' | 'account_verification' | 'login_verification';
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
  userType?: 'user' | 'employer' | 'admin';
}

export interface ResendOTPRequest {
  email: string;
  purpose: 'password_reset' | 'account_verification' | 'login_verification';
  userType?: 'user' | 'employer' | 'admin';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User extends Record<string, unknown> {
  _id: string;
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthResponse {
  user: User;
  userType: string;
  tokens: AuthTokens;
}

export interface LoginResponse {
  user: User;
  userType: string;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user?: User;
  employer?: User;
  userType: string;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

export interface UserProfileResponse extends Record<string, unknown> {
  user: User;
}

export type UserType = 'user' | 'employer' | 'admin';