'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings } from '@/types/settings';
import { motion } from 'framer-motion';
import { 
  PaintBrushIcon, 
  SunIcon, 
  MoonIcon,
  ComputerDesktopIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

interface AppearanceSettingsProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export default function AppearanceSettings({ settings, onUpdate }: AppearanceSettingsProps) {
  const { theme, setTheme } = useTheme();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Section Header */}
      <motion.div variants={itemVariants} className="flex items-center mb-6">
        <div className="bg-purple-100 p-2 rounded-lg mr-3">
          <PaintBrushIcon className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Appearance Settings</h2>
      </motion.div>

      {/* Theme Selection */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            {theme === 'light' 
              ? 'Light Mode' 
              : theme === 'dark' 
                ? 'Dark Mode' 
                : 'System Default'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              theme === 'light' 
                ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => {
              setTheme('light');
              onUpdate({ theme: 'light' });
            }}
          >
            <div className="h-36 bg-white border-b border-gray-100">
              <div className="h-8 bg-blue-500 flex items-center px-3">
                <div className="h-2 w-2 bg-white rounded-full mx-0.5"></div>
                <div className="h-2 w-2 bg-white rounded-full mx-0.5"></div>
                <div className="h-2 w-2 bg-white rounded-full mx-0.5"></div>
              </div>
              <div className="p-3">
                <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 flex items-center justify-between">
              <span className="flex items-center text-gray-800 font-medium">
                <SunIcon className="h-4 w-4 mr-1 text-blue-500" />
                Light
              </span>
              {theme === 'light' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              theme === 'dark' 
                ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => {
              setTheme('dark');
              onUpdate({ theme: 'dark' });
            }}
          >
            <div className="h-36 bg-gray-900 border-b border-gray-700">
              <div className="h-8 bg-gray-800 flex items-center px-3">
                <div className="h-2 w-2 bg-gray-500 rounded-full mx-0.5"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full mx-0.5"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full mx-0.5"></div>
              </div>
              <div className="p-3">
                <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-700 rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
              </div>
            </div>
            <div className="p-3 bg-gray-800 flex items-center justify-between">
              <span className="flex items-center text-gray-200 font-medium">
                <MoonIcon className="h-4 w-4 mr-1 text-indigo-400" />
                Dark
              </span>
              {theme === 'dark' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-5 w-5 bg-indigo-500 rounded-full flex items-center justify-center"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              theme === 'system' 
                ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => {
              setTheme('system');
              onUpdate({ theme: 'system' });
            }}
          >
            <div className="h-36 bg-gradient-to-br from-white to-gray-900">
              <div className="h-8 bg-gradient-to-r from-blue-500 to-gray-800 flex items-center px-3">
                <div className="h-2 w-2 bg-white rounded-full mx-0.5 opacity-80"></div>
                <div className="h-2 w-2 bg-white rounded-full mx-0.5 opacity-80"></div>
                <div className="h-2 w-2 bg-white rounded-full mx-0.5 opacity-80"></div>
              </div>
              <div className="p-3 flex">
                <div className="w-1/2 pr-1">
                  <div className="h-4 w-10 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                  <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                </div>
                <div className="w-1/2 pl-1">
                  <div className="h-4 w-10 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-full bg-gray-700 rounded mb-1"></div>
                  <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-800 flex items-center justify-between">
              <span className="flex items-center text-gray-800 dark:text-gray-200 font-medium">
                <ComputerDesktopIcon className="h-4 w-4 mr-1 text-purple-500" />
                System
              </span>
              {theme === 'system' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center"
                >
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Choose how Quickshift appears to you. Select a single theme, or sync with your system.
        </p>
      </motion.div>

      {/* Language Selection */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <LanguageIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Language</h3>
        </div>

        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-5 shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
        >
          <div className="max-w-md">
            <div className="mb-2">
              <Select
                value={settings.language}
                onChange={(value) => onUpdate({ language: value })}
                options={languageOptions}
                className="bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-start mt-4">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white sm:h-12 sm:w-12">
                  <span className="text-lg font-bold">{settings.language.toUpperCase()}</span>
                </span>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">
                  {settings.language === 'en' ? 'English' : 
                   settings.language === 'es' ? 'Spanish' : 'French'}
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  {settings.language === 'en' ? 'All system text will appear in English' : 
                   settings.language === 'es' ? 'Todo el texto del sistema aparecerá en español' : 
                   'Tout le texte du système apparaîtra en français'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Advanced Display Settings */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-5 shadow-sm"
      >
        <h3 className="text-md font-semibold text-gray-900 mb-4">Advanced Display</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Reduced Motion</p>
              <p className="text-xs text-gray-500">Limit animations and effects</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Compact Mode</p>
              <p className="text-xs text-gray-500">Show more content with reduced spacing</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-end pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-md"
        >
          Save Changes
        </motion.button>
      </motion.div>
    </motion.div>
  );
}