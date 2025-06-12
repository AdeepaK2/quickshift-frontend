'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { User, UserType } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!authService.getAccessToken();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getAccessToken();
        const storedUser = authService.getUser();
        const storedUserType = authService.getUserType();

        if (token && storedUser) {
          // Verify token is still valid by fetching current user
          try {
            const response = await authService.getCurrentUser(token);            if (response.success && response.data) {
              setUser(response.data.user);
              setUserType(storedUserType as UserType);
            } else {
              // Token is invalid, clear stored data
              authService.clearTokens();
            }          } catch (error) {
            // Token might be expired, try to refresh
            console.error('Auth check error:', error);
            const refreshToken = authService.getRefreshToken();
            if (refreshToken) {
              try {
                const refreshResponse = await authService.refreshToken(refreshToken);
                if (refreshResponse.success && refreshResponse.data) {
                  authService.setTokens(
                    refreshResponse.data.tokens.accessToken,
                    refreshResponse.data.tokens.refreshToken
                  );
                  // Retry getting current user
                  const userResponse = await authService.getCurrentUser(
                    refreshResponse.data.tokens.accessToken
                  );                  if (userResponse.success && userResponse.data) {
                    setUser(userResponse.data.user);
                    setUserType(storedUserType as UserType);
                  }
                } else {
                  authService.clearTokens();
                }
              } catch {
                authService.clearTokens();
              }
            } else {
              authService.clearTokens();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userType: UserType) => {
    try {
      let response;
      
      if (userType === 'admin') {
        response = await authService.adminLogin({ email, password });
      } else {
        response = await authService.login({ email, password, userType });
      }

      if (response.success && response.data) {
        const { user: userData, userType: responseUserType, tokens } = response.data;
        
        // Store tokens and user data
        authService.setTokens(tokens.accessToken, tokens.refreshToken);
        authService.setUserType(responseUserType);
        authService.setUser(userData);
        
        // Update state
        setUser(userData);
        setUserType(responseUserType as UserType);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };
  const logout = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state and storage regardless of API call success
      authService.clearTokens();
      setUser(null);
      setUserType(null);
      
      // Redirect to login page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  };

  const refreshUser = async () => {
    try {
      const token = authService.getAccessToken();
      if (token) {
        const response = await authService.getCurrentUser(token);        if (response.success && response.data) {
          setUser(response.data.user);
          authService.setUser(response.data.user);
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userType,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: UserType[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, userType } = useAuth();
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0077B6]"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return null;
    }

    if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
      // Unauthorized - redirect to appropriate dashboard
      if (typeof window !== 'undefined') {
        switch (userType) {
          case 'admin':
            window.location.href = '/admin';
            break;
          case 'employer':
            window.location.href = '/employer';
            break;
          default:
            window.location.href = '/undergraduate';
            break;
        }
      }
      return null;
    }

    return <Component {...props} />;
  };
}