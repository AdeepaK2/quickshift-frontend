'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { UserType, LoginResponse, ApiResponse } from '@/types/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user' as UserType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let response: ApiResponse<LoginResponse>;
      
      if (formData.userType === 'admin') {
        response = await authService.adminLogin({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authService.login(formData);
      }
      if (response.success && response.data) {
        try {
          // Store tokens and user data
          authService.setTokens(
            response.data.tokens.accessToken,
            response.data.tokens.refreshToken
          );
          authService.setUserType(response.data.userType);
          authService.setUser(response.data.user);
          
          // Set cookies manually to ensure they're available for middleware
          document.cookie = `accessToken=${response.data.tokens.accessToken}; path=/; max-age=2592000`;
          document.cookie = `refreshToken=${response.data.tokens.refreshToken}; path=/; max-age=2592000`;
          document.cookie = `userType=${response.data.userType}; path=/; max-age=2592000`;
          
          // Store the user type before navigation
          const userType = response.data.userType;
          // Use router.push for navigation
          switch (userType) {
            case 'admin':
              router.push('/admin');
              break;
            case 'employer':
              router.push('/employer/dashboard');
              break;
            default:
              router.push('/undergraduate');
              break;
          }
        } catch (err) {
          console.error("Error during login redirection:", err);
          setError('Login successful but failed to redirect. Please try again.');
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#03045E] mb-2">QuickShift</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="user">Student/Job Seeker</option>
                <option value="employer">Employer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0077B6] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005F8A] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-[#0077B6] hover:text-[#005F8A] text-sm font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>            {/* Register Links */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-center text-gray-600 text-sm mb-4">
                Don&apos;t have an account?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/register?type=user"
                  className="text-center py-2 px-4 border border-[#0077B6] text-[#0077B6] rounded-lg hover:bg-[#0077B6] hover:text-white transition-all duration-200 text-sm font-medium"
                >
                  Student Signup
                </Link>
                <Link
                  href="/auth/register?type=employer"
                  className="text-center py-2 px-4 border border-[#00B4D8] text-[#00B4D8] rounded-lg hover:bg-[#00B4D8] hover:text-white transition-all duration-200 text-sm font-medium"
                >
                  Employer Signup
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Need help? Contact{' '}
            <a href="mailto:support@quickshift.com" className="text-[#0077B6] hover:underline">
              support@quickshift.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}