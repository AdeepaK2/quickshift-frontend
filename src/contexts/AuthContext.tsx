'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import { User, UserType } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<{ success: boolean; redirectPath?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAuthState: (user: User, userType: UserType, tokens: { accessToken: string; refreshToken: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!authService.getAccessToken();

  // Helper function to determine redirect path
  const getRedirectPath = useCallback((userType: string): string => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'employer':
        return '/employer/dashboard';
      default:
        return '/undergraduate';
    }
  }, []);

  // Update auth state helper
  const updateAuthState = useCallback((userData: User, userTypeValue: UserType, tokens: { accessToken: string; refreshToken: string }) => {
    console.log('AuthContext: Updating auth state', { userTypeValue, userId: userData._id });
    
    // Store in localStorage and cookies
    authService.setTokens(tokens.accessToken, tokens.refreshToken);
    authService.setUserType(userTypeValue);
    authService.setUser(userData);
    
    // Update state immediately
    setUser(userData);
    setUserType(userTypeValue);
    
    console.log('AuthContext: Auth state updated successfully');
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthContext: Initializing auth state...');
      
      try {
        const token = authService.getAccessToken();
        const storedUser = authService.getUser();
        const storedUserType = authService.getUserType();

        console.log('AuthContext: Stored data check', {
          hasToken: !!token,
          hasUser: !!storedUser,
          userType: storedUserType
        });

        if (token && storedUser && storedUserType) {
          // Set state from stored data first (immediate auth)
          setUser(storedUser as User);
          setUserType(storedUserType as UserType);
          
          console.log('AuthContext: Auth state restored from storage');
          
          // Then verify token is still valid in background
          try {
            const response = await authService.getCurrentUser(token);
            
            if (response.success && response.data) {
              console.log('AuthContext: Token verified successfully');
              setUser(response.data.user);
              authService.setUser(response.data.user);
            } else {
              console.log('AuthContext: Token verification failed, clearing auth');
              authService.clearTokens();
              setUser(null);
              setUserType(null);
            }          } catch {
            console.log('AuthContext: Token verification error, trying refresh...');
            // Try to refresh token
            const refreshToken = authService.getRefreshToken();
            if (refreshToken) {
              try {
                const refreshResponse = await authService.refreshToken(refreshToken);
                if (refreshResponse.success && refreshResponse.data) {
                  console.log('AuthContext: Token refreshed successfully');
                  authService.setTokens(
                    refreshResponse.data.tokens.accessToken,
                    refreshResponse.data.tokens.refreshToken
                  );
                  
                  // Retry getting current user
                  const userResponse = await authService.getCurrentUser(
                    refreshResponse.data.tokens.accessToken
                  );
                  
                  if (userResponse.success && userResponse.data) {
                    setUser(userResponse.data.user);
                    authService.setUser(userResponse.data.user);
                  }
                } else {
                  console.log('AuthContext: Token refresh failed, clearing auth');
                  authService.clearTokens();
                  setUser(null);
                  setUserType(null);
                }
              } catch {
                console.log('AuthContext: Token refresh error, clearing auth');
                authService.clearTokens();
                setUser(null);
                setUserType(null);
              }
            } else {
              console.log('AuthContext: No refresh token, clearing auth');
              authService.clearTokens();
              setUser(null);
              setUserType(null);
            }
          }
        } else {
          console.log('AuthContext: No stored auth data found');
          setUser(null);
          setUserType(null);
        }
      } catch {
        console.error('AuthContext: Auth initialization error');
        authService.clearTokens();
        setUser(null);
        setUserType(null);
      } finally {
        console.log('AuthContext: Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userType: UserType): Promise<{ success: boolean; redirectPath?: string }> => {
    try {
      let response;
      
      if (userType === 'admin') {
        response = await authService.adminLogin({ email, password });
      } else {
        response = await authService.login({ email, password, userType });
      }

      if (response.success && response.data) {
        const { user: userData, userType: responseUserType, tokens } = response.data;
        
        // Update auth state immediately
        updateAuthState(userData, responseUserType as UserType, tokens);
        
        // Return success with redirect path
        const redirectPath = getRedirectPath(responseUserType);
        return { success: true, redirectPath };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch {
      console.error('Login error');
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      console.error('Logout error');
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
        const response = await authService.getCurrentUser(token);
        
        if (response.success && response.data) {
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
    updateAuthState,
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

// FIXED: Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  allowedUserTypes?: UserType[]
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, userType } = useAuth();
    
    console.log('withAuth: Check', { isAuthenticated, isLoading, userType, allowedUserTypes });
    
    // Show loading while auth is being initialized
    if (isLoading) {
      console.log('withAuth: Still loading...');
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mb-4"></div>
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        </div>
      );
    }

    // Check authentication
    if (!isAuthenticated) {
      console.log('withAuth: Not authenticated, redirecting to login');
      
      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 100);
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mb-4"></div>
            <p className="text-gray-600 text-sm">Redirecting to login...</p>
          </div>
        </div>
      );
    }

    // Check user type authorization
    if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
      console.log('withAuth: Wrong user type, redirecting to correct dashboard', { userType, allowedUserTypes });
      
      // Redirect to appropriate dashboard
      if (typeof window !== 'undefined') {
        let redirectPath = '/';
        switch (userType) {
          case 'admin':
            redirectPath = '/admin';
            break;
          case 'employer':
            redirectPath = '/employer/dashboard';
            break;
          default:
            redirectPath = '/undergraduate';
            break;
        }
        
        // Only redirect if we're not already on the correct path
        if (!window.location.pathname.includes(redirectPath)) {
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 2000);
        }
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4">
              <svg className="w-12 h-12 text-yellow-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Wrong Dashboard</h2>
            <p className="text-gray-600 mb-4">Redirecting to your correct dashboard...</p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
          </div>
        </div>
      );
    }

    console.log('withAuth: All checks passed, rendering component');
    return <Component {...props} />;
  };
}