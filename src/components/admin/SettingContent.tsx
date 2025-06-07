"use client";

import { useState } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Bell,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

export default function SettingContent() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@quickshift.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState({
    maintenanceMode: false,
    feedbackCollection: true,
    emailNotifications: true,
    twoFactorAuth: false,
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };
  const handleToggleChange = (field: keyof typeof preferences) => {
    setPreferences({ ...preferences, [field]: !preferences[field] });
  };
  const handleSaveChanges = () => {
    // Basic validation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      alert("New passwords do not match!");
      return;
    }

    setLastUpdated(new Date().toLocaleString());
    // Add save logic here
    alert("Settings saved successfully!");
  };

  const handleResetToDefaults = () => {
    setFormData({
      name: "Admin User",
      email: "admin@quickshift.com",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPreferences({
      maintenanceMode: false,
      feedbackCollection: true,
      emailNotifications: true,
      twoFactorAuth: false,
    });
    alert("Settings reset to defaults!");
  };
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="mt-2 sm:mt-0">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-blue-50 mr-3">
            <User className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold">Profile Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>{" "}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Change Password
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Leave password fields empty if you don't want to change your
              password.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Preferences Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-green-50 mr-3">
            <SettingsIcon className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold">Platform Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
              <div>
                <h4 className="font-medium">Maintenance Mode</h4>
                <p className="text-sm text-gray-600">
                  Temporarily disable the platform for maintenance
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.maintenanceMode}
                onChange={() => handleToggleChange("maintenanceMode")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-purple-500 mr-3" />
              <div>
                <h4 className="font-medium">User Feedback Collection</h4>
                <p className="text-sm text-gray-600">
                  Allow users to submit feedback and reviews
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.feedbackCollection}
                onChange={() => handleToggleChange("feedbackCollection")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">
                  Receive email notifications for important events
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={() => handleToggleChange("emailNotifications")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Access & Security Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-red-50 mr-3">
            <Shield className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold">Access & Security</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Lock className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <h4 className="font-medium">Reset Password</h4>
                <p className="text-sm text-gray-600">
                  Send a password reset link to your email
                </p>
              </div>
            </div>{" "}
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to send a password reset link to your email?"
                  )
                ) {
                  alert(
                    "Password reset link has been sent to your email address."
                  );
                }
              }}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Reset Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.twoFactorAuth}
                onChange={() => handleToggleChange("twoFactorAuth")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to reset all settings to their default values?"
              )
            ) {
              handleResetToDefaults();
            }
          }}
          className="px-6 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </button>
        <button
          onClick={handleSaveChanges}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
