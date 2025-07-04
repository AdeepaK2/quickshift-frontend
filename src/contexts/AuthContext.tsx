'use client';

// AuthContext for managing authentication state across the application
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType, AuthTokens } from '@/types/auth';
import { authService } from '@/services/authService';
// Using notification system for auth events
// import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userType: UserType | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokens;

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication state...');
        
        // Check for stored tokens and user data
        const storedTokens = getStoredTokens();
        const storedUser = getStoredUser();
        const storedUserType = getStoredUserType();

        console.log('📦 Found stored data:', {
          hasTokens: !!storedTokens,
          hasUser: !!storedUser,
          userType: storedUserType
        });

        if (storedTokens && storedUser && storedUserType) {
          setTokens(storedTokens);
          setUser(storedUser);
          setUserType(storedUserType);

          // Ensure currentUserId is also set in localStorage
          if (!localStorage.getItem('currentUserId') && storedUser._id) {
            localStorage.setItem('currentUserId', storedUser._id);
          }

          // Set cookies for middleware
          setCookies(storedTokens.accessToken, storedUserType);

          console.log('✅ Auth state restored from storage');

          // Verify token is still valid
          try {
            await authService.getCurrentUser(storedTokens.accessToken);
            console.log('✅ Token validation successful');
          } catch (error) {
            console.error('❌ Token validation failed:', error);
            // Try to refresh token
            try {
              console.log('🔄 Attempting token refresh...');
              const refreshResponse = await authService.refreshToken(storedTokens.refreshToken);
              const newTokens = refreshResponse.data!.tokens;
              
              setTokens(newTokens);
              storeTokens(newTokens);
              setCookies(newTokens.accessToken, storedUserType);
              console.log('✅ Token refresh successful');
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError);
              // Clear invalid auth data
              clearAuthData();
            }
          }
        } else {
          console.log('📭 No stored auth data found');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        clearAuthData();
      } finally {
        console.log('✅ Auth initialization complete');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userType: UserType) => {
    try {
      setIsLoading(true);
      
      console.log('🔐 Starting login process:', { email, userType });
      
      let response;
      if (userType === 'admin') {
        response = await authService.adminLogin({ email, password });
      } else {
        response = await authService.login({ email, password, userType });
      }
      
      console.log('📤 Login response received:', { 
        success: response.success, 
        userType: response.data?.userType,
        hasUser: !!response.data?.user,
        hasTokens: !!response.data?.tokens
      });
      
      if (response.success && response.data) {
        const { user: userData, userType: responseUserType, tokens: userTokens } = response.data;
        
        console.log('✅ Login successful:', { userType: responseUserType, userId: userData._id });
        
        setUser(userData);
        setUserType(responseUserType as UserType);
        setTokens(userTokens);

        // Store in localStorage
        storeTokens(userTokens);
        storeUser(userData);
        storeUserType(responseUserType as UserType);
        
        // Store the user ID for profile access
        localStorage.setItem('currentUserId', userData._id);

        // Set cookies for middleware
        setCookies(userTokens.accessToken, responseUserType);
        
        console.log('✅ Auth state updated and cookies set');
        console.log('🔍 Final auth state:', {
          userSet: !!userData,
          userTypeSet: !!responseUserType,
          tokensSet: !!userTokens,
          localStorage: {
            accessToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
            userType: localStorage.getItem('userType')
          }
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    
    // Use Next.js router for better navigation
    window.location.href = '/auth/login';
  };

  const refreshAuth = async () => {
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refreshToken(tokens.refreshToken);
      
      if (response.success && response.data) {
        const newTokens = response.data.tokens;
        setTokens(newTokens);
        storeTokens(newTokens);
        
        if (userType) {
          setCookies(newTokens.accessToken, userType);
        }
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    storeUser(updatedUser);
  };

  const clearAuthData = () => {
    console.log('🧹 Clearing all authentication data...');
    
    setUser(null);
    setUserType(null);
    setTokens(null);
    
    // Clear localStorage
    const keysToRemove = ['accessToken', 'refreshToken', 'user', 'userType', 'currentUserId'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear all possible auth cookies thoroughly
    const cookiesToClear = ['accessToken', 'userType', 'refreshToken'];
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=localhost;`;
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
    });
    
    console.log('✅ All authentication data cleared');
  };

  const value: AuthContextType = {
    user,
    userType,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting components with authentication
export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedUserTypes?: UserType[]
) {
  const AuthenticatedComponent = (props: T) => {
    const { isAuthenticated, isLoading, userType } = useAuth();

    // Show loading while auth state is being determined
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Only redirect if we're sure the user is not authenticated
    // The middleware should handle most auth redirects, so this is just a fallback
    if (!isAuthenticated) {
      console.log('🔄 withAuth: User not authenticated, redirecting to login');
      window.location.href = '/auth/login';
      return null;
    }

    // Check if user type is allowed (only if we have a userType)
    if (allowedUserTypes && userType) {
      if (!allowedUserTypes.includes(userType)) {
        console.log('🔄 withAuth: Wrong user type, redirecting to correct dashboard', { 
          userType, 
          allowedUserTypes,
          redirectTo: getDashboardUrl(userType)
        });
        const dashboardUrl = getDashboardUrl(userType);
        window.location.href = dashboardUrl;
        return null;
      }
    }

    // User is authenticated and has correct permissions
    console.log('✅ withAuth: User authorized, rendering component', { userType, allowedUserTypes });
    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
}

// Helper function to get dashboard URL (same as in middleware)
function getDashboardUrl(userType: UserType): string {
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'employer':
      return '/employer';
    case 'user':
      return '/undergraduate';
    default:
      return '/auth/login';
  }
}

// Utility functions for storage management
function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken };
    }
  } catch (error) {
    console.error('Error getting stored tokens:', error);
  }
  
  return null;
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
}

function getStoredUserType(): UserType | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('userType') as UserType | null;
  } catch (error) {
    console.error('Error getting stored user type:', error);
    return null;
  }
}

function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
}

function storeUser(user: User): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user', JSON.stringify(user));
    // Also store the user ID separately for easier access
    localStorage.setItem('currentUserId', user._id);
  } catch (error) {
    console.error('Error storing user:', error);
  }
}

function storeUserType(userType: UserType): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('userType', userType);
  } catch (error) {
    console.error('Error storing user type:', error);
  }
}

function setCookies(accessToken: string, userType: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear any existing cookies first
    document.cookie = `accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `userType=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    
    // Set new cookies with more explicit attributes
    const expires = new Date();
    expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
    
    document.cookie = `accessToken=${accessToken}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax; Secure=false`;
    document.cookie = `userType=${userType}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax; Secure=false`;
    
    console.log('✅ Cookies set with explicit attributes:', { 
      accessToken: accessToken.substring(0, 20) + '...', 
      userType,
      expires: expires.toUTCString()
    });
    
    // Verify cookies were set by reading them back
    setTimeout(() => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
      }, {} as Record<string, string>);
      
      console.log('🍪 Cookies verification after delay:', {
        accessTokenSet: !!cookies.accessToken,
        userTypeSet: !!cookies.userType,
        userTypeValue: cookies.userType,
        allCookies: document.cookie
      });
    }, 100);
  } catch (error) {
    console.error('❌ Error setting cookies:', error);
  }
}
