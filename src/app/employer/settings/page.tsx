'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppearanceSettings from '@/components/employer/AppearanceSettings';
import NotificationSettings from '@/components/employer/NotificationSettings';
import AccountSettings from '@/components/employer/AccountSettings';
import SecuritySettings from '@/components/employer/SecuritySettings';
import Card from '@/components/ui/Card';
import { Settings } from '@/types/settings';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { CogIcon, BellIcon, PaintBrushIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    theme: 'light',
    language: 'en',
    emailNotifications: {
      newApplications: true,
      jobUpdates: true,
      systemUpdates: false,
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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'account', name: 'Account', icon: CogIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
  ];

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearanceSettings settings={settings} onUpdate={updateSettings} />;
      case 'notifications':
        return <NotificationSettings settings={settings} onUpdate={updateSettings} />;
      case 'account':
        return <AccountSettings settings={settings} onUpdate={updateSettings} />;
      case 'security':
        return <SecuritySettings settings={settings} onUpdate={updateSettings} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto px-4 pb-12"
      >
        {/* Animated Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 rounded-xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="absolute top-12 right-12 w-16 h-16 bg-white opacity-10 rounded-full"></div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-blue-100 max-w-2xl">
            Customize your experience and manage your account preferences
          </p>
        </motion.div>
        
        {/* Mobile Tab Navigation for smaller screens */}
        <div className="block sm:hidden mb-6 overflow-x-auto">
          <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span className="font-medium whitespace-nowrap">{tab.name}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicatorMobile"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:block lg:w-64"
          >
            <Card className="p-4 shadow-lg border border-gray-200 sticky top-24">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500'
                      } mr-3`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      
                      {tab.name}
                      
                      {isActive && (
                        <motion.div 
                          layoutId="activeTabIndicator"
                          className="ml-auto h-5 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div 
            className="flex-1"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-0 overflow-hidden border border-gray-200 shadow-lg">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center">
                      {tabs.find(tab => tab.id === activeTab)?.icon && (
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md mr-4">
                          {(() => {
                            const activeTabInfo = tabs.find(tab => tab.id === activeTab);
                            if (activeTabInfo?.icon) {
                              const Icon = activeTabInfo.icon;
                              return <Icon className="w-5 h-5" />;
                            }
                            return null;
                          })()}
                        </span>
                      )}
                      <h2 className="text-xl font-semibold text-gray-900">
                        {tabs.find(tab => tab.id === activeTab)?.name} Settings
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    {renderContent()}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </ThemeProvider>
  );
}