'use client';

import React, { useEffect, useState } from 'react';

interface AuthData {
  cookies?: string;
  localStorage?: {
    accessToken: string | null;
    refreshToken: string | null;
    user: string | null;
    userType: string | null;
  };
}

export default function ClearAuthPage(): React.ReactElement {
  const [cleared, setCleared] = useState<boolean>(false);
  const [authData, setAuthData] = useState<AuthData>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Read current auth data
      const currentData: AuthData = {
        cookies: document.cookie,
        localStorage: {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
          user: localStorage.getItem('user'),
          userType: localStorage.getItem('userType'),
        }
      };
      setAuthData(currentData);
    }
  }, []);

  const clearAllAuth = (): void => {
    if (typeof window === 'undefined') return;
    
    console.log('🧹 Clearing all authentication data...');
    
    // Clear all possible auth cookies
    const cookiesToClear: string[] = [
      'accessToken',
      'userType',
      'refreshToken',
      'testToken',
      'testUserType'
    ];
    
    cookiesToClear.forEach((name: string) => {
      // Clear with multiple variations to be thorough
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=localhost;`;
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;`;
    });
    
    // Clear localStorage
    const localStorageKeysToRemove: string[] = [
      'accessToken',
      'refreshToken',
      'user',
      'userType'
    ];
    
    localStorageKeysToRemove.forEach((key: string) => {
      localStorage.removeItem(key);
    });
    
    // Clear sessionStorage too
    sessionStorage.clear();
    
    console.log('✅ All authentication data cleared');
    console.log('🔄 Reloading page...');
    
    setCleared(true);
    
    // Reload the page after clearing
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 2000);
  };

  // Function for forcing logout if needed in the future
  // const forceLogout = () => {
  //   if (typeof window !== 'undefined') {
  //     // Clear everything and go to login
  //     clearAllAuth();
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">🧹 Clear Authentication Data</h1>
        
        {!cleared ? (
          <>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-orange-800 mb-2">⚠️ Authentication Issues?</h2>
              <p className="text-orange-700">
                If you&apos;re experiencing login/redirect issues, there might be stale cookies or cached data. 
                Use the button below to completely clear all authentication data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">Current Authentication Data</h2>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Cookies:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {authData.cookies || 'No cookies'}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">localStorage:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm">
                  {JSON.stringify(authData.localStorage, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={clearAllAuth}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                🧹 Clear All Auth Data & Redirect to Login
              </button>
              
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                🔄 Just Reload Page
              </button>
            </div>
          </>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-green-800">✅ Authentication Data Cleared!</h3>
                <p className="text-green-700">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips for Clean Testing:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Use this page if login redirects aren&apos;t working</li>
            <li>• Try incognito/private browsing for completely fresh sessions</li>
            <li>• Clear browser cache if issues persist</li>
            <li>• Check browser developer tools for console errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
