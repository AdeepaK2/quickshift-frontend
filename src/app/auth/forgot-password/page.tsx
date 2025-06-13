'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import { UserType } from '@/types/auth';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    userType: 'user' as UserType
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    // Check if there's an error parameter in the URL
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setError('Your password reset session has expired. Please start a new request.');
    }
    
    // Clean up any stale session data
    sessionStorage.removeItem('resetEmail');
    sessionStorage.removeItem('resetUserType');
    sessionStorage.removeItem('resetRequestTime');
    sessionStorage.removeItem('verifiedOtp');
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.forgotPassword({
        email: formData.email,
        userType: formData.userType
      });      if (response.success) {
        setSuccess(true);
        // Store email and userType for OTP verification
        sessionStorage.setItem('resetEmail', formData.email);
        sessionStorage.setItem('resetUserType', formData.userType);
        // Store timestamp to check for session expiration
        sessionStorage.setItem('resetRequestTime', Date.now().toString());
        
        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          router.push('/auth/verify-otp?purpose=password_reset');
        }, 2000);      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>            <p className="text-gray-600 mb-6">
              We&apos;ve sent a 6-digit verification code to <strong>{formData.email}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to verification page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#03045E] mb-2">Reset Password</h1>
          <p className="text-gray-600">
            Enter your email to receive a verification code
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
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
                placeholder="Enter your email address"
              />              <p className="text-xs text-gray-500 mt-2">
                We&apos;ll send a 6-digit verification code to this email
              </p>
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
                  Sending Code...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link 
                href="/auth/login" 
                className="text-[#0077B6] hover:text-[#005F8A] text-sm font-medium transition-colors duration-200"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Help */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <a href="mailto:support@quickshift.com" className="text-[#0077B6] hover:underline">
              Contact Support
            </a>
          </p>        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}