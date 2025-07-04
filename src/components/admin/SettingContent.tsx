"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Bell,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { 
  adminSettingsService, 
  AdminPlatformSettings 
} from "@/services/adminSettingsService";

// Enhanced styles for blue theme
const textStyles = {
  heading: "text-gray-900 font-semibold",
  subheading: "text-gray-800 font-medium",
  body: "text-gray-700",
  muted: "text-gray-600",
  label: "text-gray-900 font-medium",
  error: "text-red-600",
  description: "text-gray-600",
  strongText: "text-gray-900 font-semibold",
};

// TypeScript interfaces
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function SettingContent() {
  // State management
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [settings, setSettings] = useState<AdminPlatformSettings>({
    maintenanceMode: false,
    feedbackCollection: true,
    emailNotifications: true,
    twoFactorAuth: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    allowRegistrations: true,
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load admin profile and settings on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load admin profile
        const profileResponse = await adminSettingsService.getCurrentAdminProfile();
        if (profileResponse.success && profileResponse.data) {
          setFormData({
            firstName: profileResponse.data.firstName,
            lastName: profileResponse.data.lastName,
            email: profileResponse.data.email,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });

          // Update two-factor auth setting from profile
          if (profileResponse.data.twoFactorAuth !== undefined) {
            setSettings(prevSettings => ({
              ...prevSettings,
              twoFactorAuth: profileResponse.data!.twoFactorAuth || false
            }));
          }
        }

        // Load platform settings
        const settingsResponse = await adminSettingsService.getPlatformSettings();
        if (settingsResponse.success && settingsResponse.data) {
          // Merge platform settings with the current settings (keeping twoFactorAuth from profile)
          setSettings({
            maintenanceMode: settingsResponse.data.maintenanceMode,
            feedbackCollection: settingsResponse.data.feedbackCollection,
            emailNotifications: settingsResponse.data.emailNotifications,
            passwordMinLength: settingsResponse.data.passwordMinLength,
            sessionTimeout: settingsResponse.data.sessionTimeout,
            allowRegistrations: settingsResponse.data.allowRegistrations,
            // Keep the twoFactorAuth that was set from profile
            twoFactorAuth: settings.twoFactorAuth
          });
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast.error('Failed to load admin settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation (only if changing password)
    if (
      formData.newPassword ||
      formData.confirmPassword ||
      formData.currentPassword
    ) {
      if (!formData.currentPassword) {
        errors.currentPassword =
          "Current password is required when changing password";
      }

      if (!formData.newPassword) {
        errors.newPassword = "New password is required";
      } else if (formData.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
        errors.newPassword =
          "Password must contain uppercase, lowercase, and number";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Event handlers
  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear validation error when user starts typing
      if (validationErrors[field]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [validationErrors]
  );

  const handleSettingToggle = useCallback(async (field: keyof AdminPlatformSettings) => {
    // Special handling for two-factor auth
    if (field === 'twoFactorAuth') {
      try {
        const newValue = !settings.twoFactorAuth;
        setIsSubmitting(true);
        
        // Call the specific 2FA API
        const response = await adminSettingsService.toggleTwoFactorAuth(newValue);
        
        if (response.success) {
          setSettings(prev => ({ ...prev, [field]: newValue }));
          toast.success(`Two-factor authentication ${newValue ? 'enabled' : 'disabled'}`);
        } else {
          throw new Error(response.message || 'Failed to update two-factor authentication');
        }
      } catch (error) {
        console.error('2FA toggle error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update two-factor authentication');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Normal toggle for other settings
      setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
    }
  }, [settings]);

  const togglePasswordVisibility = useCallback(
    (field: keyof typeof showPasswords) => {
      setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    },
    []
  );

  const handleSaveProfile = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      const response = await adminSettingsService.updateAdminProfile(profileData);
      
      if (response.success && response.data) {
        setLastUpdated(new Date().toLocaleString());
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  const handleChangePassword = useCallback(async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await adminSettingsService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        setLastUpdated(new Date().toLocaleString());
        toast.success("Password changed successfully!");
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm]);

  const handleSaveSettings = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await adminSettingsService.updatePlatformSettings(settings);

      if (response.success && response.data) {
        setSettings(response.data);
        setLastUpdated(new Date().toLocaleString());
        toast.success("Settings saved successfully!");
      } else {
        throw new Error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [settings]);

  const handleResetToDefaults = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to reset all settings to their default values?"
      )
    ) {
      setFormData(initialFormData);
      setSettings({
        maintenanceMode: false,
        feedbackCollection: true,
        emailNotifications: true,
        twoFactorAuth: false,
        passwordMinLength: 8,
        sessionTimeout: 30,
        allowRegistrations: true,
      });
      setValidationErrors({});
      toast.success("Settings reset to defaults!");
    }
  }, []);

  const handleSendPasswordReset = useCallback(async () => {
    if (
      confirm(
        "Are you sure you want to send a password reset link to your email?"
      )
    ) {
      try {
        setIsSubmitting(true);
        const response = await adminSettingsService.sendPasswordResetEmail();
        
        if (response.success) {
          toast.success("Password reset link has been sent to your email address.");
        } else {
          throw new Error(response.message || 'Failed to send password reset link');
        }
      } catch (error) {
        console.error('Password reset error:', error);
        toast.error(error instanceof Error ? error.message : "Failed to send password reset link. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  }, []);

  // Remove loading state check since we don't have API loading states anymore

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading admin settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textStyles.heading}`}>
            Settings
          </h1>
          <p className={textStyles.body}>
            Manage your admin profile and platform settings
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <p className={`text-sm ${textStyles.muted}`}>
            Last updated: {formatDate(lastUpdated)}
          </p>
        </div>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-blue-50 mr-3">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className={`text-lg ${textStyles.heading}`}>
            Profile Settings
          </h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm ${textStyles.label} mb-2`}>
                First Name
              </label>
              <Input
                label=""
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your first name"
                className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium"
              />
              {validationErrors.firstName && (
                <p className={`mt-1 text-sm ${textStyles.error}`}>
                  {validationErrors.firstName}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-sm ${textStyles.label} mb-2`}>
                Last Name
              </label>
              <Input
                label=""
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your last name"
                className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium"
              />
              {validationErrors.lastName && (
                <p className={`mt-1 text-sm ${textStyles.error}`}>
                  {validationErrors.lastName}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={`block text-sm ${textStyles.label} mb-2`}>
                Email Address
              </label>
              <Input
                label=""
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your email address"
                className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium"
              />
              {validationErrors.email && (
                <p className={`mt-1 text-sm ${textStyles.error}`}>
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>          {/* Password Change Section */}
          <div className="pt-6 border-t border-gray-200">
            <h4 className={`text-md ${textStyles.strongText} mb-3`}>
              Change Password
            </h4>
            <p className={`text-sm ${textStyles.description} mb-4`}>
              Leave password fields empty if you don&apos;t want to change your
              password.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">              <div>
                <label className={`block text-sm ${textStyles.label} mb-2`}>
                  Current Password
                </label>
                <div className="relative">                  <Input
                    label=""
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="Enter current password"
                    className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium pr-10"
                  /><button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >{showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>                {validationErrors.currentPassword && (
                  <p className={`mt-1 text-sm ${textStyles.error}`}>
                    {validationErrors.currentPassword}
                  </p>
                )}
              </div>              <div>
                <label className={`block text-sm ${textStyles.label} mb-2`}>
                  New Password
                </label>
                <div className="relative">                  <Input
                    label=""
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="Enter new password"
                    className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium pr-10"
                  /><button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >{showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>                {validationErrors.newPassword && (
                  <p className={`mt-1 text-sm ${textStyles.error}`}>
                    {validationErrors.newPassword}
                  </p>
                )}
              </div>              <div>
                <label className={`block text-sm ${textStyles.label} mb-2`}>
                  Confirm Password
                </label>
                <div className="relative">                  <Input
                    label=""
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="Confirm new password"
                    className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium pr-10"
                  /><button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >{showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>                {validationErrors.confirmPassword && (
                  <p className={`mt-1 text-sm ${textStyles.error}`}>
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleChangePassword}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>      {/* Platform Preferences Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-green-50 mr-3">
            <SettingsIcon className="h-5 w-5 text-green-600" />
          </div>
          <h3 className={`text-lg ${textStyles.heading}`}>
            Platform Preferences
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" /><div>
                <h4 className={`${textStyles.strongText}`}>
                  Maintenance Mode
                </h4>
                <p className={`text-sm ${textStyles.description}`}>
                  Temporarily disable the platform for maintenance
                </p>
              </div>            </div>            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() => handleSettingToggle("maintenanceMode")}
                className="sr-only peer"
                disabled={isSubmitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-purple-600 mr-3" /><div>
                <h4 className={`${textStyles.strongText}`}>
                  User Feedback Collection
                </h4>
                <p className={`text-sm ${textStyles.description}`}>
                  Allow users to submit feedback and reviews
                </p>
              </div>            </div>            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.feedbackCollection}
                onChange={() => handleSettingToggle("feedbackCollection")}
                className="sr-only peer"
                disabled={isSubmitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-blue-600 mr-3" /><div>
                <h4 className={`${textStyles.strongText}`}>
                  Email Notifications
                </h4>
                <p className={`text-sm ${textStyles.description}`}>
                  Receive email notifications for important events
                </p>
              </div>            </div>            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={() => handleSettingToggle("emailNotifications")}
                className="sr-only peer"
                disabled={isSubmitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>      {/* Access & Security Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-red-50 mr-3">
            <Shield className="h-5 w-5 text-red-600" />
          </div><h3 className={`text-lg ${textStyles.heading}`}>
            Access & Security
          </h3>
        </div>        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-gray-600 mr-3" /><div>
                <h4 className={`${textStyles.strongText}`}>
                  Reset Password
                </h4>
                <p className={`text-sm ${textStyles.description}`}>
                  Send a password reset link to your email
                </p>
              </div>
            </div>
            <Button
              onClick={handleSendPasswordReset}
              variant="outline"
              disabled={isSubmitting}
            >
              Reset Password
            </Button>
          </div>          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600 mr-3" /><div>
                <h4 className={`${textStyles.strongText}`}>
                  Two-Factor Authentication
                </h4>
                <p className={`text-sm ${textStyles.description}`}>
                  Add an extra layer of security to your account
                </p>
              </div>            </div>            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={() => handleSettingToggle("twoFactorAuth")}
                className="sr-only peer"
                disabled={isSubmitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          onClick={handleResetToDefaults}
          variant="outline"
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
