"use client";

import React, { useState, useCallback } from "react";
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
import { useMutation } from "@/lib/hooks";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading";
import { formatDate } from "@/lib/utils";

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
interface AdminSettings {
  maintenanceMode: boolean;
  feedbackCollection: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  passwordMinLength: number;
  sessionTimeout: number;
  allowRegistrations: boolean;
}

interface FormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

const initialFormData: FormData = {
  name: "Admin User",
  email: "admin@quickshift.com",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialSettings: AdminSettings = {
  maintenanceMode: false,
  feedbackCollection: true,
  emailNotifications: true,
  twoFactorAuth: false,
  passwordMinLength: 8,
  sessionTimeout: 30,
  allowRegistrations: true,
};

export default function SettingContent() {
  // State management
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [settings, setSettings] = useState<AdminSettings>(initialSettings);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API mutations
  const { mutate: updateProfile, loading: updateProfileLoading } =
    useMutation();
  const { mutate: updateSettings, loading: updateSettingsLoading } =
    useMutation();
  const { mutate: changePassword, loading: changePasswordLoading } =
    useMutation();

  // Form validation
  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
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

  const handleSettingToggle = useCallback((field: keyof AdminSettings) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

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
      // API call would go here
      await updateProfile(
        () =>
          Promise.resolve({
            success: true,
            data: null,
            message: "Profile updated",
          }),
        { name: formData.name, email: formData.email }
      );

      setLastUpdated(new Date().toLocaleString());
      alert("Profile updated successfully!");
    } catch {
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, updateProfile, validateForm]);

  const handleChangePassword = useCallback(async () => {
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all password fields");
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // API call would go here
      await changePassword(
        () =>
          Promise.resolve({
            success: true,
            data: null,
            message: "Password changed",
          }),
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setLastUpdated(new Date().toLocaleString());
      alert("Password changed successfully!");
    } catch {
      alert("Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, changePassword, validateForm]);

  const handleSaveSettings = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await updateSettings(
        () =>
          Promise.resolve({
            success: true,
            data: null,
            message: "Settings updated",
          }),
        settings
      );

      setLastUpdated(new Date().toLocaleString());
      alert("Settings saved successfully!");
    } catch {
      alert("Failed to save settings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [settings, updateSettings]);

  const handleResetToDefaults = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to reset all settings to their default values?"
      )
    ) {
      setFormData(initialFormData);
      setSettings(initialSettings);
      setValidationErrors({});
      alert("Settings reset to defaults!");
    }
  }, []);

  const handleSendPasswordReset = useCallback(async () => {
    if (
      confirm(
        "Are you sure you want to send a password reset link to your email?"
      )
    ) {
      try {
        // API call would go here
        alert("Password reset link has been sent to your email address.");
      } catch {
        alert("Failed to send password reset link. Please try again.");
      }
    }
  }, []);

  const isLoading =
    updateProfileLoading ||
    updateSettingsLoading ||
    changePasswordLoading ||
    isSubmitting;

  if (isLoading) {
    return <LoadingState message="Updating settings..." />;
  }  return (
    <div className="space-y-6 p-4 bg-gray-50 min-h-screen">{/* Page Header */}
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
      </div>      {/* Profile Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="p-2 rounded-lg bg-blue-50 mr-3">
            <User className="h-5 w-5 text-blue-600" />
          </div><h3 className={`text-lg ${textStyles.heading}`}>
            Profile Settings
          </h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">            <div>
              <label className={`block text-sm ${textStyles.label} mb-2`}>
                Admin Name
              </label>              <Input
                label=""
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={isLoading}
                placeholder="Enter your full name"
                className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium"
              />{validationErrors.name && (
                <p className={`mt-1 text-sm ${textStyles.error}`}>
                  {validationErrors.name}
                </p>
              )}
            </div>            <div>
              <label className={`block text-sm ${textStyles.label} mb-2`}>
                Email Address
              </label>              <Input
                label=""
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                placeholder="Enter your email address"
                className="placeholder:text-gray-600 placeholder:opacity-100 text-gray-900 font-medium"
              />{validationErrors.email && (
                <p className={`mt-1 text-sm ${textStyles.error}`}>
                  {validationErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                disabled={isLoading}
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
          </div><h3 className={`text-lg ${textStyles.heading}`}>
            Platform Preferences
          </h3>
        </div>        <div className="space-y-4">
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
              disabled={isLoading}
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
                disabled={isLoading}
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
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
