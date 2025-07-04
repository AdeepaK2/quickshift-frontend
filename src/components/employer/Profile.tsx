'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { employerService, UpdateEmployerProfileRequest, EmployerStats } from '@/services/employerService';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<UpdateEmployerProfileRequest>({
    companyName: '',
    contactNumber: '',
    industry: '',
    description: '',
    address: '',
    city: '',
    website: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  });
  const [stats, setStats] = useState<EmployerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Get profile data
        const profileResponse = await employerService.getProfile();
        
        if (profileResponse.success && profileResponse.data) {
          const profileData = profileResponse.data;
          
          setFormData({
            companyName: profileData.companyName || '',
            contactNumber: profileData.contactNumber || '',
            industry: profileData.industry || '',
            description: profileData.description || '',
            address: profileData.address || '',
            city: profileData.city || '',
            website: profileData.website || '',
            socialMedia: profileData.socialMedia || {
              facebook: '',
              twitter: '',
              linkedin: '',
              instagram: ''
            }
          });
        }
        
        // Get stats
        const statsResponse = await employerService.getStats();
        
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested social media fields
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia!,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear messages when editing
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await employerService.updateProfile(formData);
      
      if (response.success && response.data) {
        setSuccessMessage('Profile updated successfully!');
        
        // Update user context if needed
        if (user) {
          updateUser({
            ...user,
            companyName: formData.companyName || user.companyName
          });
        }
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('An error occurred while saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading skeleton for the profile form
  const ProfileFormSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
      </div>
      
      <div className="flex justify-end">
        <div className="h-12 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );

  // Loading skeleton for company stats
  const StatsSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-2/5"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#03045E]">Company Profile</h1>
        <p className="text-gray-600 mt-2">Manage your company information and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            {loading ? (
              <ProfileFormSkeleton />
            ) : (
              <>
                <h3 className="text-xl font-semibold text-[#03045E] mb-6">Company Information</h3>
                
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {successMessage}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="Retail">Retail</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Finance">Finance</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Media">Media & Entertainment</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Construction">Construction</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Company Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-6 py-3 bg-[#0077B6] text-white rounded-lg transition-colors font-medium ${
                        isSaving ? 'bg-blue-300 cursor-not-allowed' : 'hover:bg-[#00B4D8]'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Company Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {loading ? (
              <StatsSkeleton />
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#03045E] mb-4">Company Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Jobs Posted</span>
                    <span className="font-semibold text-[#0077B6]">{stats?.totalJobsPosted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Jobs</span>
                    <span className="font-semibold text-[#0077B6]">{stats?.activeJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Applications</span>
                    <span className="font-semibold text-[#0077B6]">{stats?.totalApplications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hires</span>
                    <span className="font-semibold text-[#0077B6]">{stats?.totalHires || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Rate</span>
                    <span className="font-semibold text-[#0077B6]">{stats?.responseRate || 0}%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#03045E] mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Email Verified</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Phone Verified</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Business Registration Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
