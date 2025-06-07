import { Settings } from '@/types/settings';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  DocumentCheckIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/ui/card';
import Switch from '@/components/ui/Switch';

interface AccountSettingsProps {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

export default function AccountSettings({ settings, onUpdate }: AccountSettingsProps) {
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Section: Account Preferences */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg">
            <DocumentCheckIcon className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Account Preferences</h3>
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
                label="Auto Save"
                description="Automatically save your progress when creating or editing job postings"
                checked={settings.autoSave}
                onChange={(checked) => onUpdate({ autoSave: checked })}
                icon={<ArrowPathIcon className="h-4 w-4 text-blue-500" />}
                activeColor="bg-blue-500"
              />
            </motion.div>
            
            <motion.div 
              className="p-5 hover:bg-blue-50/30 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <Switch
                label="Show Profile"
                description="Make your profile visible to job seekers browsing the platform"
                checked={settings.showProfile}
                onChange={(checked) => onUpdate({ showProfile: checked })}
                icon={<EyeIcon className="h-4 w-4 text-indigo-500" />}
                activeColor="bg-indigo-500"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Section: Data Preferences */}
      <motion.div variants={itemVariants}>
        <div className="mb-5 flex items-center">
          <div className="bg-purple-100 p-2 rounded-lg">
            <ShieldCheckIcon className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-2">Data Preferences</h3>
        </div>
        
        <motion.div 
          className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          whileHover={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-5 hover:bg-purple-50/30 transition-colors">
            <div className="space-y-5">
              <h4 className="text-base font-medium text-gray-800">Data Sharing</h4>
              
              <div className="space-y-2">
                <motion.div 
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">Analytics Collection</p>
                    <p className="text-xs text-gray-500">Help us improve by sharing usage data</p>
                  </div>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    activeColor="bg-purple-500"
                    label=""
                  />
                </motion.div>
                
                <motion.div 
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">Personalization</p>
                    <p className="text-xs text-gray-500">Allow recommendations based on activity</p>
                  </div>
                  <Switch
                    checked={true}
                    onChange={() => {}}
                    activeColor="bg-purple-500"
                    label=""
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Save Changes Button */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md"
        >
          Save Changes
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
