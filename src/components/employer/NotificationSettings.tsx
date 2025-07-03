import { Settings } from '@/types/settings';
import { motion } from 'framer-motion';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import Switch from '@/components/ui/Switch';

interface NotificationSettingsProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export default function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center mb-6"
      >
        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
          <BellIcon className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
      </motion.div>

      {/* Email Notifications */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg">
            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Email Notifications</h3>
        </div>

        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-0 divide-y divide-gray-100">
            <motion.div 
              className="p-5 hover:bg-blue-50/30 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Switch
                label="New Applications"
                description="Get notified when someone applies to your jobs"
                checked={settings.emailNotifications.newApplications}
                onChange={(checked) => 
                  onUpdate({
                    emailNotifications: {
                      ...settings.emailNotifications,
                      newApplications: checked
                    }
                  })
                }
              />
            </motion.div>

            <motion.div 
              className="p-5 hover:bg-blue-50/30 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Switch
                label="Job Updates"
                description="Updates about your posted jobs"
                checked={settings.emailNotifications.jobUpdates}
                onChange={(checked) => 
                  onUpdate({
                    emailNotifications: {
                      ...settings.emailNotifications,
                      jobUpdates: checked
                    }
                  })
                }
              />
            </motion.div>

            <motion.div 
              className="p-5 hover:bg-blue-50/30 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Switch
                label="System Updates"
                description="Important system notifications"
                checked={settings.emailNotifications.systemUpdates}
                onChange={(checked) => 
                  onUpdate({
                    emailNotifications: {
                      ...settings.emailNotifications,
                      systemUpdates: checked
                    }
                  })
                }
              />
            </motion.div>

            <motion.div 
              className="p-5 hover:bg-blue-50/30 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Switch
                label="Marketing"
                description="Promotional emails and newsletters"
                checked={settings.emailNotifications.marketing}
                onChange={(checked) => 
                  onUpdate({
                    emailNotifications: {
                      ...settings.emailNotifications,
                      marketing: checked
                    }
                  })
                }
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Push Notifications */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-purple-100 p-2 rounded-lg">
            <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Push Notifications</h3>
        </div>

        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="p-5 hover:bg-purple-50/30 transition-colors"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <Switch
              label="Enable Push Notifications"
              description="Allow notifications in your browser"
              checked={settings.pushNotifications.enabled}
              onChange={(checked) => 
                onUpdate({
                  pushNotifications: {
                    ...settings.pushNotifications,
                    enabled: checked
                  }
                })
              }
            />
          </motion.div>

          {settings.pushNotifications.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-100"
            >
              <div className="space-y-0 divide-y divide-gray-100">
                <motion.div 
                  className="p-5 pl-10 hover:bg-purple-50/30 transition-colors"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Switch
                    label="New Applications"
                    description="Push notifications for new applications"
                    checked={settings.pushNotifications.newApplications}
                    onChange={(checked) => 
                      onUpdate({
                        pushNotifications: {
                          ...settings.pushNotifications,
                          newApplications: checked
                        }
                      })
                    }
                  />
                </motion.div>

                <motion.div 
                  className="p-5 pl-10 hover:bg-purple-50/30 transition-colors"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Switch
                    label="Messages"
                    description="Push notifications for new messages"
                    checked={settings.pushNotifications.messages}
                    onChange={(checked) => 
                      onUpdate({
                        pushNotifications: {
                          ...settings.pushNotifications,
                          messages: checked
                        }
                      })
                    }
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Delivery Preferences</h3>
        </div>

        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">Frequency</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Recommended</span>
                </div>
                <div className="mt-4">
                  <div className="space-y-2">
                    {["Immediately", "Daily Digest", "Weekly Summary"].map((option) => (
                      <label key={option} className="flex items-center space-x-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="frequency" 
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" 
                          defaultChecked={option === "Daily Digest"}
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-800">Quiet Hours</h4>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Optional</span>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <select className="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i}>{`${i}:00`}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <select className="w-full text-sm bg-gray-50 border border-gray-200 rounded-md px-2 py-1">
                        {[...Array(24)].map((_, i) => (
                          <option key={i} value={i} selected={i === 8}>{`${i}:00`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Save Button */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-end pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium rounded-lg shadow-md"
        >
          Save Preferences
        </motion.button>
      </motion.div>
    </motion.div>
  );
}