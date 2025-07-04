'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [verifiedOtp, setVerifiedOtp] = useState('');
  const [success, setSuccess] = useState(false);  useEffect(() => {
    // Get stored data from session storage
    const storedEmail = sessionStorage.getItem('resetEmail') || '';
    const storedUserType = sessionStorage.getItem('resetUserType') || 'user';
    const storedOtp = sessionStorage.getItem('verifiedOtp') || '';
    const resetRequestTime = sessionStorage.getItem('resetRequestTime');
    
    setEmail(storedEmail);
    setUserType(storedUserType);
    setVerifiedOtp(storedOtp);
    
    // Validate if the session has expired (20 minutes max)
    if (resetRequestTime) {
      const requestTimestamp = parseInt(resetRequestTime, 10);
      const currentTime = Date.now();
      const timeDiffMinutes = (currentTime - requestTimestamp) / (1000 * 60);
      
      if (timeDiffMinutes > 20) {
        // Session expired
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetUserType');
        sessionStorage.removeItem('resetRequestTime');
        sessionStorage.removeItem('verifiedOtp');
        router.push('/auth/forgot-password?error=session_expired');
        return;
      }
    }

    // Redirect if missing required data
    if (!storedEmail || !storedOtp) {
      // Store the current page in session storage so we can redirect back after login
      sessionStorage.setItem('passwordResetRedirect', window.location.pathname);
      router.push('/auth/forgot-password');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) setError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Check if the session has expired (20 minutes max)
      const resetRequestTime = sessionStorage.getItem('resetRequestTime');
      if (resetRequestTime) {
        const requestTimestamp = parseInt(resetRequestTime, 10);
        const currentTime = Date.now();
        const timeDiffMinutes = (currentTime - requestTimestamp) / (1000 * 60);
        
        if (timeDiffMinutes > 20) {
          throw new Error('Your verification code has expired. Please request a new code.');
        }
      }
      
      const response = await authService.resetPassword({
        email,
        otp: verifiedOtp,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: userType as 'user' | 'employer'
      });

      if (response.success) {
        setSuccess(true);
        
        // Clear session storage
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetUserType');
        sessionStorage.removeItem('verifiedOtp');
        sessionStorage.removeItem('resetRequestTime');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }    } catch (err: unknown) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('OTP') || errorMessage.includes('expired')) {
        setError('Your verification code has expired. Please request a new code.');
        setTimeout(() => {
          // Clear all session storage related to password reset
          sessionStorage.removeItem('resetEmail');
          sessionStorage.removeItem('resetUserType');
          sessionStorage.removeItem('verifiedOtp');
          sessionStorage.removeItem('resetRequestTime');
          router.push('/auth/forgot-password?error=otp_expired');
        }, 2000);
      } else {
        setError(errorMessage || 'Failed to reset password. Please try again.');
      }
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full bg-[#0077B6] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005F8A] transition-all duration-200"
              >
                Sign In Now
              </Link>
              <p className="text-sm text-gray-500">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
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
          <div className="w-16 h-16 bg-[#0077B6] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#03045E] mb-2">Set New Password</h1>
          <p className="text-gray-600">
            Create a strong password for your account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-400 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your new password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
                    One number
                  </li>
                </ul>
              </div>
            </div>            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-400 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Passwords match
                </p>
              )}
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
              disabled={loading || !formData.password || !formData.confirmPassword}
              className="w-full bg-[#0077B6] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005F8A] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </span>
              ) : (
                'Update Password'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200"
              >
                ← Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}