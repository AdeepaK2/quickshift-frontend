// This file contains utility functions for testing login and redirection

/**
 * Handles the login process and redirection to the appropriate dashboard
 * @param email User email
 * @param password User password 
 * @param userType User type ('user', 'employer', or 'admin')
 */
export const handleLogin = async (
  email: string, 
  password: string,
  userType: 'user' | 'employer' | 'admin'
) => {
  try {
    // First, validate that we're on the client side
    if (typeof window === 'undefined') {
      throw new Error('Login must be performed on client side');
    }

    // Build the request body
    const reqBody = { email, password, userType };
    
    // Make the login API request
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Extract tokens and user data
    const { tokens, user, userType: responseUserType } = data.data;
    
    // Store tokens in localStorage
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('userType', responseUserType);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Store tokens in cookies for middleware access
    document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=2592000`;
    document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=2592000`;
    document.cookie = `userType=${responseUserType}; path=/; max-age=2592000`;
    
    console.log('Login successful, redirecting to dashboard...');
    
    // Redirect based on user type after a slight delay to ensure storage is set
    setTimeout(() => {
      switch (responseUserType) {
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
    }, 200);
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error during login' 
    };
  }
};

/**
 * Utility function to check if the user is properly authenticated and redirect if not
 */
export const checkAuthAndRedirect = () => {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('accessToken');
  const userType = localStorage.getItem('userType');
  
  if (!accessToken || !userType) {
    window.location.href = '/auth/login';
    return false;
  }
  
  return {
    isAuthenticated: true,
    userType
  };
};
