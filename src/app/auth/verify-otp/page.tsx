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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 8.89a1 1 0 001.42 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#03045E] mb-2">Enter Verification Code</h2>
          <p className="text-gray-600 text-sm">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </div>

        {/* OTP Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100/50 transition-all duration-1000 hover:bg-white/95 hover:shadow-xl animate-fade-in">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 text-center">
                Verification Code
              </label>
              <div className="flex justify-center space-x-3 mb-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 bg-white transform hover:scale-105"
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
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
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-[#0077B6] to-[#00B4D8] text-white py-2.5 px-4 rounded-lg font-semibold hover:from-[#005F8A] hover:to-[#0096C7] focus:ring-2 focus:ring-[#0077B6] focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] text-sm animate-pulse hover:animate-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              <p className="text-gray-600 text-xs mb-2">Didn&apos;t receive the code?</p>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendLoading || resendCooldown > 0}
                className="text-[#0077B6] hover:text-[#005F8A] text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
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
            <div className="text-center pt-3 border-t border-gray-200">
              <Link 
                href="/auth/forgot-password" 
                className="inline-flex items-center text-[#0077B6] hover:text-[#005F8A] text-xs font-medium transition-all duration-300 group transform hover:scale-105"
              >
                <svg className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Use a different email
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

        {/* Help */}
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

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-6">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 animate-pulse"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-bounce" style={{animationDuration: '6s'}}></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-400/20 rounded-full blur-xl animate-bounce" style={{animationDuration: '8s', animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-indigo-400/20 rounded-full blur-xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}}></div>
        
        <div className="text-center relative z-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077B6] mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  );
}