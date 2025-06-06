import { Settings } from '@/types/settings';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  KeyIcon, 
  ClockIcon,
  LockClosedIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/Card';
import Switch from '@/components/ui/Switch';
import Select from '@/components/ui/Select';

interface SecuritySettingsProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export default function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const timeoutOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 hour' },
    { value: '120', label: '2 hours' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Security Header */}
      <motion.div variants={itemVariants} className="flex items-center mb-6">
        <div className="bg-red-100 p-2 rounded-lg mr-3">
          <ShieldCheckIcon className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
      </motion.div>

      {/* Security Status Card */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-32 w-32 bg-red-500 opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 bg-indigo-500 opacity-10 rounded-full transform -translate-x-6 translate-y-6"></div>
        
        <div className="flex items-center mb-4">
          <div className="bg-red-500 bg-opacity-20 rounded-full p-3 mr-4">
            <LockClosedIcon className="h-6 w-6 text-red-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Account Security</h3>
            <p className="text-gray-300 text-sm">
              Your account security is {settings.twoFactorAuth ? "enhanced" : "basic"}
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 h-2.5 rounded-full mt-4 mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: settings.twoFactorAuth ? '100%' : '40%' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2.5 rounded-full ${settings.twoFactorAuth ? 'bg-green-500' : 'bg-yellow-500'}`}
          ></motion.div>
        </div>
        
        <div className="flex justify-between text-xs mt-1">
          <span className="text-gray-400">Basic</span>
          <span className="text-gray-400">Enhanced</span>
        </div>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <FingerPrintIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Two-Factor Authentication</h3>
        </div>
        
        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-4 sm:mb-0 sm:pr-6">
                <h4 className="font-medium text-gray-900 mb-1">Add verification step</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Add an extra layer of security by requiring a verification code when you log in
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md flex items-center">
                    <KeyIcon className="h-3 w-3 mr-1" />
                    Authentication app
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                    Email
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <motion.div 
                  className={`relative h-7 w-14 rounded-full shadow-inner cursor-pointer ${
                    settings.twoFactorAuth ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => onUpdate({ twoFactorAuth: !settings.twoFactorAuth })}
                  initial={false}
                  animate={{ backgroundColor: settings.twoFactorAuth ? '#3B82F6' : '#D1D5DB' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                    initial={false}
                    animate={{ 
                      x: settings.twoFactorAuth ? 28 : 0,
                      boxShadow: settings.twoFactorAuth 
                        ? '0 0 10px rgba(59, 130, 246, 0.5)' 
                        : '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30 
                    }}
                  >
                    {settings.twoFactorAuth && (
                      <motion.svg
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 text-blue-500" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.div>
                </motion.div>
                
                <div className="ml-3">
                  <span className={`text-xs font-medium ${
                    settings.twoFactorAuth ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {settings.twoFactorAuth && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-indigo-50 border-t border-indigo-100 p-5"
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 w-full sm:w-auto">
                  <div className="text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-200 mb-3 rounded-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-1v-1h-1v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">Scan QR code</p>
                  </div>
                </div>
                <div className="space-y-3 flex-1">
                  <h4 className="font-medium text-gray-900">Setup instructions</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full text-indigo-700 text-xs flex items-center justify-center font-medium">1</span>
                      <span className="text-gray-600">Download an authenticator app like Google Authenticator or Authy</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full text-indigo-700 text-xs flex items-center justify-center font-medium">2</span>
                      <span className="text-gray-600">Scan the QR code with the app</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full text-indigo-700 text-xs flex items-center justify-center font-medium">3</span>
                      <span className="text-gray-600">Enter the verification code from the app to complete setup</span>
                    </li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Session Timeout */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-orange-100 p-2 rounded-lg">
            <ClockIcon className="h-5 w-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Session Timeout</h3>
        </div>
        
        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-4">
              Automatically log out after a period of inactivity for enhanced security
            </p>
            
            <div className="max-w-xs">
              <Select
                value={settings.sessionTimeout.toString()}
                onChange={(value) => onUpdate({ sessionTimeout: parseInt(value) })}
                options={timeoutOptions}
                className="bg-white border-2 border-gray-300 focus:border-orange-500"
              />
            </div>

            <div className="mt-5">
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(parseInt(settings.sessionTimeout.toString()) / 120) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                  className="bg-blue-500 h-2 rounded-full"
                ></motion.div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">Short</span>
                <span className="text-gray-500">Long</span>
              </div>
            </div>
            
            <div className="flex items-center mt-5 p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <div className="p-2 bg-orange-100 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-orange-800">
                A shorter timeout provides better security but may require more frequent logins
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="mt-8">
        <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Recent Activity
        </h3>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {/*
              { event: 'Login', device: 'Chrome on Windows', time: '2 hours ago', ip: '192.168.1.1' },
              { event: 'Password changed', device: 'Chrome on Windows', time: '3 days ago', ip: '192.168.1.1' }
            */}
            {Array.from({ length: 2 }).map((_, i) => (
              <motion.div 
                key={i}
                className="p-4 hover:bg-gray-50"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Login</p>
                    <p className="text-xs text-gray-500">Chrome on Windows</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">2 hours ago</p>
                    <p className="text-xs text-gray-400">192.168.1.1</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-end pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.2)" }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg shadow-md"
        >
          Save Security Settings
        </motion.button>
      </motion.div>
    </motion.div>
  );
}