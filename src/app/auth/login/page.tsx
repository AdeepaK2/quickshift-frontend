'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types/auth';

export default function LoginPage() {
  const { login, isAuthenticated, userType, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'user' as UserType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle already authenticated users
  useEffect(() => {
    if (!isLoading && isAuthenticated && userType) {
      // User is already authenticated, redirect immediately
      const redirectPath = getRedirectPath(userType);
      console.log('🔄 User already authenticated, redirecting to:', redirectPath);
      router.replace(redirectPath);
    }
  }, [isAuthenticated, userType, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const getRedirectPath = (userType: string) => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'employer':
        return '/employer';
      default:
        return '/undergraduate';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('🔐 Attempting login with:', { email: formData.email, userType: formData.userType });
      
      await login(formData.email, formData.password, formData.userType);
      
      console.log('✅ Login function completed successfully');
      
      // Show success message
      setSuccess('Login successful! Redirecting to your dashboard...');
      
      // Use Next.js router for smooth navigation (no page reload)
      setTimeout(() => {
        const redirectPath = getRedirectPath(formData.userType);
        console.log('🔄 Redirecting to:', redirectPath);
        
        // Use Next.js router instead of forcing page reload
        router.replace(redirectPath);
      }, 1500); // Reduced delay since no reload needed
        
    } catch (err: unknown) {
      console.error('❌ Login error:', err);
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(errorMessage || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-6">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 animate-pulse"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-bounce" style={{animationDuration: '6s'}}></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl animate-bounce" style={{animationDuration: '8s', animationDelay: '2s'}}></div>
      <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
      
      {/* Gradient Overlay Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 animate-pulse" style={{animationDuration: '3s'}}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Show loading while checking auth state */}
        {isLoading ? (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077B6]"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Logo/Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-white">Q</span>
                </div>
                <h1 className="text-2xl font-bold text-[#03045E]">QuickShift</h1>
              </div>
              <p className="text-gray-600 text-sm">Welcome back! Sign in to continue</p>
            </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50 transition-all duration-1000 hover:bg-white/95 hover:shadow-xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Login as
              </label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 bg-white text-gray-900 font-medium text-sm"
                disabled={loading}
              >
                <option value="user" className="text-gray-900 bg-white">🎓 Student/Job Seeker</option>
                <option value="employer" className="text-gray-900 bg-white">🏢 Employer</option>
                <option value="admin" className="text-gray-900 bg-white">⚙️ Administrator</option>
              </select>
            </div>            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm"
                placeholder="Enter your password"
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Manual Redirect Buttons (Only show after success) */}
            {success && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 mb-3">
                  If you&apos;re not redirected automatically, click your dashboard:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/undergraduate')}
                    className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#005F8A] transition-colors text-sm"
                  >
                    Student Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/employer')}
                    className="px-4 py-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096C7] transition-colors text-sm"
                  >
                    Employer Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 bg-[#023E8A] text-white rounded-lg hover:bg-[#03045E] transition-colors text-sm"
                  >
                    Admin Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white py-2.5 px-4 rounded-lg font-semibold hover:from-[#005F8A] hover:to-[#0096C7] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-sm animate-pulse hover:animate-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                className="text-[#0077B6] hover:text-[#005F8A] text-xs font-medium transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Register Links */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-gray-600 text-xs mb-3">
                New to QuickShift?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/register?type=user"
                  className="text-center py-2 px-3 border-2 border-[#0077B6] text-[#0077B6] rounded-lg hover:bg-[#0077B6] hover:text-white transition-all duration-300 text-xs font-semibold transform hover:scale-105 hover:shadow-lg"
                >
                  🎓 Join as Student
                </Link>
                <Link
                  href="/auth/register?type=employer"
                  className="text-center py-2 px-3 border-2 border-[#00B4D8] text-[#00B4D8] rounded-lg hover:bg-[#00B4D8] hover:text-white transition-all duration-300 text-xs font-semibold transform hover:scale-105 hover:shadow-lg"
                >
                  🏢 Join as Employer
                </Link>
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="text-center pt-3">
              <Link
                href="/"
                className="inline-flex items-center text-gray-500 hover:text-[#0077B6] transition-all duration-300 text-xs font-medium group transform hover:scale-105"
              >
                <svg className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </Link>
            </div>
          </form>
        </div>

            {/* Additional Info */}
            <div className="text-center mt-4">
              <p className="text-gray-500 text-xs animate-fade-in" style={{animationDelay: '1s'}}>
                Need help? Contact{' '}
                <a href="mailto:support@quickshift.com" className="text-[#0077B6] hover:underline transition-colors duration-200">
                  support@quickshift.com
                </a>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}