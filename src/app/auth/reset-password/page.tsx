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
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50 transition-all duration-1000 hover:bg-white/95 hover:shadow-xl animate-fade-in text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#03045E] mb-3">Password Reset Successfully!</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white py-2.5 px-4 rounded-lg font-semibold hover:from-[#005F8A] hover:to-[#0096C7] transition-all duration-200 transform hover:scale-[1.02] text-sm"
              >
                Sign In Now
              </Link>
              <p className="text-xs text-gray-500 animate-pulse">
                Redirecting automatically in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-[#03045E]">QuickShift</h1>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-[#0077B6] to-[#00B4D8] rounded-full flex items-center justify-center mx-auto mb-3 transform hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#03045E] mb-2">Set New Password</h2>
          <p className="text-gray-600 text-sm">
            Create a strong password for your account
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50 transition-all duration-1000 hover:bg-white/95 hover:shadow-xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your new password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                <p className="mb-1">Password must contain:</p>
                <ul className="list-disc list-inside space-y-1">
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Passwords match
                </p>
              )}
            </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.password || !formData.confirmPassword}
              className="w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white py-2.5 px-4 rounded-lg font-semibold hover:from-[#005F8A] hover:to-[#0096C7] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-sm animate-pulse hover:animate-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="text-center pt-3 border-t border-gray-200">
              <Link 
                href="/auth/login" 
                className="inline-flex items-center text-[#0077B6] hover:text-[#005F8A] text-xs font-medium transition-all duration-300 group transform hover:scale-105"
              >
                <svg className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sign In
              </Link>
            </div>

            {/* Back to Home Button */}
            <div className="text-center pt-2">
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