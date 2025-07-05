'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userType, setUserType] = useState<'user' | 'employer'>('user');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const type = searchParams.get('type') as 'user' | 'employer';
    if (type === 'employer' || type === 'user') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (userType === 'user') {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRedirectPath = (userType: string) => {
    switch (userType) {
      case 'employer':
        return '/employer';
      default:
        return '/undergraduate';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (userType === 'employer') {
        response = await authService.registerEmployer({
          companyName: formData.companyName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined
        });
      } else {
        response = await authService.registerUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined
        });
      }

      if (response.success && response.data) {
        // Store auth data
        authService.setTokens(
          response.data.tokens.accessToken,
          response.data.tokens.refreshToken
        );
        authService.setUserType(userType);
        const userData = response.data.user || response.data.employer;
        if (userData) {
          authService.setUser(userData);
        }

        // Show success message
        const userName = userType === 'employer' 
          ? formData.companyName 
          : `${formData.firstName} ${formData.lastName}`;
        
        setSuccess(`Welcome to QuickShift, ${userName}! Your account has been created successfully. Redirecting to your dashboard...`);

        // Redirect after delay
        setTimeout(() => {
          window.location.href = getRedirectPath(userType);
        }, 2000);

      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        setError('An account with this email already exists. Please try logging in instead.');
      } else {
        setError(errorMessage || 'Registration failed. Please try again.');
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-[#03045E]">QuickShift</h1>
          </div>
          <p className="text-gray-600 text-sm">
            Create your {userType === 'employer' ? 'employer' : 'student'} account
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="mb-4">
          <div className="grid grid-cols-2 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-gray-100/50 shadow-lg">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setUserType('user');
                router.push('/auth/register?type=user');
              }}
              className={`py-2 px-3 rounded-md text-xs font-semibold transition-all duration-300 disabled:opacity-50 transform hover:scale-105 ${
                userType === 'user'
                  ? 'bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              🎓 Student
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setUserType('employer');
                router.push('/auth/register?type=employer');
              }}
              className={`py-2 px-3 rounded-md text-xs font-semibold transition-all duration-300 disabled:opacity-50 transform hover:scale-105 ${
                userType === 'employer'
                  ? 'bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              🏢 Employer
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50 transition-all duration-1000 hover:bg-white/95 hover:shadow-xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {userType === 'user' ? (
              <>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Company Name */
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm ${
                    errors.companyName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your Company Name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm"
                placeholder="+1 (555) 123-4567"
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
                disabled={loading}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Create a strong password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 text-sm ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onClick={() => window.location.href = '/undergraduate'}
                    className="px-4 py-2 bg-[#0077B6] text-white rounded-lg hover:bg-[#005F8A] transition-colors text-sm"
                  >
                    Student Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/employer/dashboard'}
                    className="px-4 py-2 bg-[#00B4D8] text-white rounded-lg hover:bg-[#0096C7] transition-colors text-sm"
                  >
                    Employer Dashboard
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
                  Creating Account...
                </span>
              ) : (
                `Create ${userType === 'employer' ? 'Employer' : 'Student'} Account`
              )}
            </button>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-xs">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-[#0077B6] hover:text-[#005F8A] font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077B6]"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}