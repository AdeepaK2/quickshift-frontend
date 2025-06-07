'use client';
import { useState } from 'react';
import { EmployerProfile } from '@/types/employer';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import { motion } from 'framer-motion';
import { 
  UserCircleIcon, 
  BuildingOfficeIcon, 
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ProfileFormProps {
  profile: EmployerProfile;
  onSave: (profile: EmployerProfile) => void;
  onCancel: () => void;
}

export default function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState<EmployerProfile>({
    ...profile,
    profilePicture: profile.profilePicture || null
  });
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    formData.profilePicture ? formData.profilePicture : null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setFormData({...formData, profilePicture: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white rounded-xl overflow-hidden"
    >
      {/* Header with animated gradient */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Edit Your Profile</h2>
        <p className="text-blue-100 max-w-2xl text-sm sm:text-base">
          Update your information to help candidates learn more about you and your company
        </p>
      </motion.div>

      {/* Form navigation tabs for mobile */}
      <motion.div 
        variants={itemVariants}
        className="flex border-b border-gray-200 overflow-x-auto sm:hidden"
      >
        <button 
          onClick={() => setActiveSection("personal")}
          className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
            activeSection === "personal" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500"
          }`}
        >
          <UserCircleIcon className="h-4 w-4 mr-1" /> Personal
        </button>
        <button 
          onClick={() => setActiveSection("company")}
          className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
            activeSection === "company" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500"
          }`}
        >
          <BuildingOfficeIcon className="h-4 w-4 mr-1" /> Company
        </button>
        <button 
          onClick={() => setActiveSection("description")}
          className={`px-4 py-3 text-sm font-medium flex items-center whitespace-nowrap ${
            activeSection === "description" 
              ? "text-blue-600 border-b-2 border-blue-600" 
              : "text-gray-500"
          }`}
        >
          <DocumentTextIcon className="h-4 w-4 mr-1" /> Description
        </button>
      </motion.div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {/* Personal Information */}
        <motion.div 
          variants={itemVariants}
          className={`mb-8 rounded-xl ${
            activeSection === "personal" || !activeSection ? "block" : "hidden sm:block"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserCircleIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-2">Personal Information</h3>
          </div>
          
          <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="mb-6 flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      <UserCircleIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <label htmlFor="profile-picture" className="text-white text-xs font-medium cursor-pointer flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Change Photo
                  </label>
                  <input 
                    type="file" 
                    id="profile-picture" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </motion.div>
              </div>
              
              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-semibold text-gray-800">Profile Picture</h4>
                <p className="text-sm text-gray-600 max-w-xs">
                  Upload a professional photo to help candidates recognize you.
                </p>
                <div className="text-xs text-gray-500">
                  Recommended: Square image, at least 400x400 pixels
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Information */}
        <motion.div 
          variants={itemVariants} 
          className={`mb-8 rounded-xl ${
            activeSection === "company" ? "block" : "hidden sm:block"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-2">Company Information</h3>
          </div>
          
          <div className="p-5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Email
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Website
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Company Size
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-400 text-gray-500 font-medium"
                  required
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Description */}
        <motion.div 
          variants={itemVariants}
          className={`mb-8 rounded-xl ${
            activeSection === "description" ? "block" : "hidden sm:block"
          }`}
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-2 rounded-lg">
              <DocumentTextIcon className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 ml-2">Company Description</h3>
          </div>
          
          <div className="p-5 bg-purple-50/50 rounded-xl border border-purple-100">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Tell candidates about your company
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-gray-500 font-medium"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                A good description helps candidates understand your company culture and values.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 justify-end mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            type="button"
          >
            Cancel
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-colors flex items-center justify-center"
            type="submit"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Save Changes
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
}