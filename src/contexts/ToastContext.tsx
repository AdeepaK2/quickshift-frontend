'use client';

import { Toaster } from 'react-hot-toast';

// Toast configuration for consistent styling across all dashboards
export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#FFFFFF',
          color: '#1E293B', // slate-800
          border: '1px solid #E2E8F0', // slate-200
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          style: {
            border: '1px solid #10B981', // green-500
            background: '#F0FDF4', // green-50
            color: '#065F46', // green-800
          },
          iconTheme: {
            primary: '#10B981',
            secondary: '#F0FDF4',
          },
        },
        error: {
          style: {
            border: '1px solid #EF4444', // red-500
            background: '#FEF2F2', // red-50
            color: '#991B1B', // red-800
          },
          iconTheme: {
            primary: '#EF4444',
            secondary: '#FEF2F2',
          },
        },
        loading: {
          style: {
            border: '1px solid #0077B6', // quickshift-primary
            background: '#F0F9FF', // blue-50
            color: '#1E40AF', // blue-800
          },
          iconTheme: {
            primary: '#0077B6',
            secondary: '#F0F9FF',
          },
        },
      }}
    />
  );
};
