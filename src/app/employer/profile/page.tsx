'use client';
import { useState, useEffect } from 'react';
import ProfileForm from '@/components/employer/ProfileForm';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { EmployerProfile } from '@/types/employer';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const [profile, setProfile] = useState<EmployerProfile>({
    id: '1',
    name: 'Emma Morgan',
    email: 'emma.morgan@company.com',
    phone: '+1 (555) 123-4567',
    position: 'HR Manager',
    companyName: 'TechCorp Solutions',
    companyEmail: 'info@techcorp.com',
    website: 'https://techcorp.com',
    description: 'Leading technology solutions provider specializing in enterprise solutions, cloud computing, and digital transformation. Our team of experts helps businesses achieve their technological goals with cutting-edge solutions and reliable support.',
    address: '123 Business Avenue, San Francisco, CA 94105',
    contactPerson: 'Emma Morgan',
    industry: 'Technology',
    companySize: '50-100 employees',
    profilePicture: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSave = (updatedProfile: EmployerProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 pb-12"
    >
      {/* Animated Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-xl p-6 sm:p-8 mb-8 shadow-xl animate-gradient-x relative overflow-hidden"
      >
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        <div className="absolute top-12 right-12 w-16 h-16 bg-white opacity-10 rounded-full"></div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-blue-100 max-w-2xl">
          Manage your personal and company information to help candidates learn more about you
        </p>
      </motion.div>
      
      {!isEditing ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-6"
        >
          {/* Personal Information Card */}
          <motion.div variants={itemVariants} transition={{ duration: 0.5 }}>
            <Card className="p-0 overflow-hidden border border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                        {profile.name.charAt(0)}
                      </div>
                      <motion.div 
                        className="absolute inset-0 rounded-full bg-blue-400 opacity-30"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      />
                    </div>
                    <div className="ml-5">
                      <motion.h2 
                        className="text-xl sm:text-2xl font-bold text-gray-900"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                      >
                        {profile.name}
                      </motion.h2>
                      <motion.p 
                        className="text-indigo-600 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        {profile.position}
                      </motion.p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center"
                    >
                      <PencilSquareIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              <div className="p-6">
                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <motion.div 
                    className="space-y-4"
                    variants={itemVariants}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center text-blue-600">
                      <UserCircleIcon className="h-5 w-5 mr-2" />
                      <h3 className="font-semibold">Personal Information</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Email</span>
                        <p className="text-gray-900 font-medium">{profile.email}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Phone</span>
                        <p className="text-gray-900 font-medium">{profile.phone}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Company Information */}
                  <motion.div 
                    className="space-y-4 md:col-span-2"
                    variants={itemVariants}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center text-indigo-600">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <h3 className="font-semibold">Company Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Company Name</span>
                        <p className="text-gray-900 font-medium">{profile.companyName}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Company Email</span>
                        <p className="text-gray-900 font-medium">{profile.companyEmail}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Website</span>
                        <p className="text-gray-900 font-medium">{profile.website}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Industry</span>
                        <p className="text-gray-900 font-medium">{profile.industry}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Company Size</span>
                        <p className="text-gray-900 font-medium">{profile.companySize}</p>
                      </div>
                      <div className="p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <span className="text-gray-500 block text-xs">Contact Person</span>
                        <p className="text-gray-900 font-medium">{profile.contactPerson}</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Address and Description */}
                <motion.div 
                  className="mt-6 space-y-4"
                  variants={itemVariants}
                  transition={{ delay: 0.4 }}
                >
                  <div className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    <span className="text-gray-500 block text-xs">Address</span>
                    <p className="text-gray-900 font-medium">{profile.address}</p>
                  </div>

                  <div className="flex items-center text-purple-600 mt-6">
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Company Description</h3>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">
                    <p className="text-gray-700">{profile.description}</p>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 border border-gray-200 shadow-lg">
            <ProfileForm 
              profile={profile}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}