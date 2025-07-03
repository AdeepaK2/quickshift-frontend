"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';

interface TokenExpirationNotificationProps {
  isVisible: boolean;
  onRefreshLogin: () => void;
  onDismiss: () => void;
}

export default function TokenExpirationNotification({
  isVisible,
  onRefreshLogin,
  onDismiss,
}: TokenExpirationNotificationProps) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-redirect to login when countdown reaches 0
          window.location.href = '/auth/login';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Session Expired
          </h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            Your session has expired. Please log in again to continue using the admin panel.
          </p>
          <p className="text-sm text-gray-500">
            Auto-redirecting to login in <span className="font-semibold text-red-600">{countdown}</span> seconds...
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onRefreshLogin}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Login Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </button>
          
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
