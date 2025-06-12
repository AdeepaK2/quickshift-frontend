// lib/auth-utils.ts
import { useState } from 'react';
import React from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

export interface FormField {
  value: string;
  error: string;
  touched: boolean;
}

export interface FormValidation {
  [key: string]: ValidationRule[];
}

// Custom hook for form validation
export function useFormValidation<T extends Record<string, FormField>>(
  initialState: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>>
) {
  const [formData, setFormData] = useState<T>(initialState);
  const [isValid, setIsValid] = useState(false);

  const validateField = (name: keyof T, value: string): string => {
    const rules = validationRules[name];
    if (!rules) return '';

    for (const rule of rules) {
      if (rule.required && !value.trim()) {
        return rule.message;
      }
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message;
      }
      if (rule.custom && !rule.custom(value)) {
        return rule.message;
      }
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newFormData = { ...formData };
    let formIsValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldKey = key as keyof T;
      const error = validateField(fieldKey, formData[fieldKey].value);
      newFormData[fieldKey] = {
        ...newFormData[fieldKey],
        error,
        touched: true,
      };
      if (error) formIsValid = false;
    });

    setFormData(newFormData);
    setIsValid(formIsValid);
    return formIsValid;
  };

  const updateField = (name: keyof T, value: string) => {
    const error = formData[name].touched ? validateField(name, value) : '';
    setFormData(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error,
        touched: true,
      },
    }));
  };
  const resetForm = () => {
    const resetData = { ...initialState };
    Object.keys(resetData).forEach((key) => {
      const fieldKey = key as keyof T;
      (resetData[fieldKey] as FormField) = {
        value: '',
        error: '',
        touched: false,
      };
    });
    setFormData(resetData);
    setIsValid(false);
  };

  const getFieldProps = (name: keyof T) => ({
    value: formData[name].value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
      updateField(name, e.target.value),
    onBlur: () => {
      if (!formData[name].touched) {
        updateField(name, formData[name].value);
      }
    },
    className: `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent transition-all duration-200 ${
      formData[name].error && formData[name].touched ? 'border-red-500' : 'border-gray-300'
    }`,
  });

  return {
    formData,
    isValid,
    validateForm,
    updateField,
    resetForm,
    getFieldProps,
  };
}

// Password strength checker
export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  strength: 'weak' | 'fair' | 'good' | 'strong';
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  const strengthLevels = ['weak', 'weak', 'fair', 'good', 'strong'] as const;
  const strength = strengthLevels[score] || 'weak';

  return { score, feedback, strength };
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Common validation rules
export const validationRules = {
  email: [
    { required: true, message: 'Email is required' },
    { custom: isValidEmail, message: 'Please enter a valid email address' },
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 8, message: 'Password must be at least 8 characters' },
    { 
      pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, 
      message: 'Password must contain uppercase, lowercase, and number' 
    },
  ],
  confirmPassword: (password: string) => [
    { required: true, message: 'Please confirm your password' },
    { custom: (value: string) => value === password, message: 'Passwords do not match' },
  ],
  firstName: [
    { required: true, message: 'First name is required' },
    { minLength: 2, message: 'First name must be at least 2 characters' },
  ],
  lastName: [
    { required: true, message: 'Last name is required' },
    { minLength: 2, message: 'Last name must be at least 2 characters' },
  ],
  companyName: [
    { required: true, message: 'Company name is required' },
    { minLength: 2, message: 'Company name must be at least 2 characters' },
  ],
  phone: [
    { custom: (value: string) => !value || isValidPhone(value), message: 'Please enter a valid phone number' },
  ],
  otp: [
    { required: true, message: 'OTP is required' },
    { pattern: /^\d{6}$/, message: 'OTP must be 6 digits' },
  ],
} satisfies Record<string, ValidationRule[] | ((param: string) => ValidationRule[])>;

// Route protection utility
export function getRedirectPath(userType: string | null): string {
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'employer':
      return '/employer';
    case 'user':
      return '/undergraduate';
    default:
      return '/auth/login';
  }
}

// Session storage helpers for auth flow
export const authFlow = {
  setResetEmail: (email: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('resetEmail', email);
    }
  },
  getResetEmail: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('resetEmail');
    }
    return null;
  },
  setResetUserType: (userType: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('resetUserType', userType);
    }
  },
  getResetUserType: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('resetUserType');
    }
    return null;
  },
  setVerifiedOtp: (otp: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('verifiedOtp', otp);
    }
  },
  getVerifiedOtp: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('verifiedOtp');
    }
    return null;
  },
  clearResetData: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetUserType');
      sessionStorage.removeItem('verifiedOtp');
    }
  },
};

// Auth loading spinner interface - component should be implemented in .tsx file
export interface AuthLoadingSpinnerProps {
  text?: string;
}