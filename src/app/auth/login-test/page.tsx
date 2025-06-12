'use client';

import React, { useState } from 'react';

export default function ManualLoginTester() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLogin = async () => {
    setLoading(true);
    setStatus('Attempting login...');
    
    try {
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
      
      setStatus('Login successful! Redirecting in 3 seconds...');
      
      // Redirect based on user type after a delay
      setTimeout(() => {
        const dashboardUrl = getDashboardUrl(responseUserType);
        setStatus(`Redirecting to ${dashboardUrl}...`);
        window.location.href = dashboardUrl;
      }, 3000);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getDashboardUrl = (type: string) => {
    switch (type) {
      case 'admin':
        return '/admin';
      case 'employer':
        return '/employer';
      default:
        return '/undergraduate';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Manual Login Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Type:
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="user">Student/Job Seeker</option>
              <option value="employer">Employer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Test Login'}
          </button>
          
          {status && (
            <div className={`mt-4 p-3 rounded-md ${status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {status}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
            <div className="bg-gray-100 p-3 rounded-md text-sm font-mono overflow-auto max-h-40">
              <p>accessToken: {typeof window !== 'undefined' ? localStorage.getItem('accessToken')?.substring(0, 20) + '...' : 'N/A'}</p>
              <p>userType: {typeof window !== 'undefined' ? localStorage.getItem('userType') : 'N/A'}</p>
              <p>Cookies: {typeof document !== 'undefined' ? document.cookie : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
