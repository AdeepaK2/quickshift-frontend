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
        return '/employer/dashboard';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#03045E] mb-2">Join QuickShift</h1>
          <p className="text-gray-600">
            Create your {userType === 'employer' ? 'employer' : 'student'} account
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="mb-6">
          <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setUserType('user');
                router.push('/auth/register?type=user');
              }}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                userType === 'user'
                  ? 'bg-white text-[#0077B6] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setUserType('employer');
                router.push('/auth/register?type=employer');
              }}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                userType === 'employer'
                  ? 'bg-white text-[#0077B6] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Employer
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {userType === 'user' ? (
              <>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50"
                placeholder="+1 (555) 123-4567"
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
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 disabled:opacity-50 ${
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
                  If you're not redirected automatically, click your dashboard:
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
              className="w-full bg-[#0077B6] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005F8A] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="text-[#0077B6] hover:text-[#005F8A] font-medium transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
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