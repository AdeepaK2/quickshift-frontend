'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [purpose, setPurpose] = useState('password_reset');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    // Get email and userType from session storage
    const storedEmail = sessionStorage.getItem('resetEmail') || '';
    const storedUserType = sessionStorage.getItem('resetUserType') || 'user';
    const purposeParam = searchParams.get('purpose') || 'password_reset';
    const resetRequestTime = sessionStorage.getItem('resetRequestTime');
    
    setEmail(storedEmail);
    setUserType(storedUserType);
    setPurpose(purposeParam);

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
        router.push('/auth/forgot-password?error=session_expired');
        return;
      }
    }

    if (!storedEmail) {
      router.push('/auth/forgot-password');
    }
  }, [router, searchParams]);

  useEffect(() => {
    // Focus first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Handle resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle pasted content
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus the last filled input or next empty input
      const nextIndex = Math.min(index + pastedOtp.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      // Handle single digit input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Move to next input if value is entered
      if (value && index < 5) {
        if (inputRefs.current[index + 1]) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    }
    
    if (error) setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current input is empty
      if (inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.verifyOTP({
        email,
        otp: otpString,        purpose: purpose as 'password_reset' | 'account_verification' | 'login_verification'
      });      if (response.success) {
        // Store OTP for password reset
        sessionStorage.setItem('verifiedOtp', otpString);
        
        // Update timestamp to extend session
        sessionStorage.setItem('resetRequestTime', Date.now().toString());
        
        if (purpose === 'password_reset') {
          router.push('/auth/reset-password');
        } else {
          // Handle other purposes if needed
          router.push('/auth/login');
        }
      }} catch (err: unknown) {
      setError((err as Error).message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setError('');

    try {      const response = await authService.resendOTP({
        email,
        purpose: purpose as 'password_reset' | 'account_verification' | 'login_verification',
        userType: userType as 'user' | 'employer' | 'admin'
      });

      if (response.success) {
        setResendCooldown(60); // 60 second cooldown
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0077B6] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 8.89a1 1 0 001.42 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#03045E] mb-2">Enter Verification Code</h1>
          <p className="text-gray-600">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Verification Code
              </label>              <div className="flex justify-center space-x-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 bg-white"
                    autoComplete="off"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Code expires in 10 minutes
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-[#0077B6] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#005F8A] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                className="text-[#0077B6] hover:text-[#005F8A] text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  'Sending...'
                ) : resendCooldown > 0 ? (
                  `Resend in ${resendCooldown}s`
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>

            {/* Back Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <Link 
                href="/auth/forgot-password" 
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200"
              >
                ← Use a different email
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
          </p>
        </div>      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077B6]"></div>
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  );
}