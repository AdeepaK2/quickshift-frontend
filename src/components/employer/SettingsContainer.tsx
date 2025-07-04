'use client';

import { useState, useEffect } from 'react';
import { Settings } from '@/types/settings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import AppearanceSettings from './AppearanceSettings';
import { settingsService } from '@/services/settingsService';
import { CircleNotch } from "@phosphor-icons/react";

export default function SettingsContainer() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'appearance'>('notifications');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await settingsService.getSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        } else {
          throw new Error(response.message || 'Failed to load settings');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setError('Failed to load settings. Using default settings.');
        // Set default settings as fallback
        setSettings({
          theme: 'light',
          language: 'en',
          emailNotifications: {
            newApplications: true,
            jobUpdates: true,
            systemUpdates: true,
            marketing: false,
          },
          pushNotifications: {
            enabled: true,
            newApplications: true,
            messages: true,
          },
          autoSave: true,
          showProfile: true,
          twoFactorAuth: false,
          sessionTimeout: 30,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleUpdate = async (updatedSettings: Partial<Settings>) => {
    try {
      if (!settings) return;
      
      // Optimistically update the UI
      setSettings({ ...settings, ...updatedSettings });
      
      // Update on the backend
      const response = await settingsService.updateSettings(updatedSettings);
      
      if (!response.success) {
        // If failed, show error but keep the updated settings in the UI
        // as if the update succeeded (since we're mocking the API for now)
        setError(`Failed to save settings: ${response.message}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircleNotch size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Failed to load settings. Please refresh the page and try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'notifications' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'security' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Security
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'appearance' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Appearance
          </button>
        </div>
        
        <div className="py-6">
          {activeTab === 'notifications' && (
            <NotificationSettings settings={settings} onUpdate={handleUpdate} />
          )}
          
          {activeTab === 'security' && (
            <SecuritySettings settings={settings} onUpdate={handleUpdate} />
          )}
          
          {activeTab === 'appearance' && (
            <AppearanceSettings settings={settings} onUpdate={handleUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}
