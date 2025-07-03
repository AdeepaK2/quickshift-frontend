'use client';

import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaGraduationCap, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaUniversity } from 'react-icons/fa';
import { userService, UserProfile as BackendUserProfile } from '@/services/userService';
import toast from 'react-hot-toast';

// Interface that combines backend data with UI-specific fields
interface UserProfileUI extends Omit<BackendUserProfile, '_id'> {
  id: string;
  studentId: string;
  year: string;
  skills: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  joinedDate: string;
  completedGigs: number;
  rating: number;
}

// Convert from backend to UI format
const convertToUIFormat = (backendProfile: BackendUserProfile): UserProfileUI => {
  return {
    id: backendProfile._id,
    firstName: backendProfile.firstName,
    lastName: backendProfile.lastName,
    email: backendProfile.email,
    phone: backendProfile.phone || '',
    profilePicture: backendProfile.profilePicture,
    university: backendProfile.university || '',
    faculty: backendProfile.faculty || '',
    studentId: '', // Not in the backend model - will need to be added or handled separately
    year: backendProfile.yearOfStudy ? `${backendProfile.yearOfStudy}${getOrdinalSuffix(backendProfile.yearOfStudy)} Year` : '',
    bio: backendProfile.bio || '',
    address: backendProfile.address || '',
    city: backendProfile.city || '',
    postalCode: backendProfile.postalCode || '',
    coordinates: backendProfile.coordinates,
    skills: [], // Not in the backend model - will need to be added or handled separately
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    joinedDate: backendProfile.createdAt,
    completedGigs: 0, // Will be updated from stats
    rating: 0, // Will be updated from stats
    isActive: backendProfile.isActive,
    isVerified: backendProfile.isVerified,
    createdAt: backendProfile.createdAt,
    updatedAt: backendProfile.updatedAt,
    dateOfBirth: backendProfile.dateOfBirth,
    gender: backendProfile.gender,
    studentIdVerified: backendProfile.studentIdVerified
  };
};

// Convert from UI format to backend update format
const convertToBackendUpdateFormat = (uiProfile: UserProfileUI) => {
  return {
    firstName: uiProfile.firstName,
    lastName: uiProfile.lastName,
    phone: uiProfile.phone,
    dateOfBirth: uiProfile.dateOfBirth,
    gender: uiProfile.gender,
    university: uiProfile.university,
    faculty: uiProfile.faculty,
    yearOfStudy: parseInt(uiProfile.year.split(/[^\d]/)[0]) || undefined,
    bio: uiProfile.bio,
    address: uiProfile.address,
    city: uiProfile.city,
    postalCode: uiProfile.postalCode,
    coordinates: uiProfile.coordinates
  };
};

// Helper function for ordinal suffixes (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileUI | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedProfile, setEditedProfile] = useState<UserProfileUI | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user profile
        const profileResponse = await userService.getProfile();
        if (!profileResponse.success || !profileResponse.data) {
          setError('Failed to load profile data');
          return;
        }
        
        // Convert to UI format
        const uiProfile = convertToUIFormat(profileResponse.data);
        
        // Get user stats
        try {
          const statsResponse = await userService.getStats();
          if (statsResponse.success && statsResponse.data) {
            uiProfile.completedGigs = statsResponse.data.completedGigs;
            uiProfile.rating = statsResponse.data.rating;
          }
        } catch (statsError) {
          console.error('Error fetching user stats:', statsError);
          // Don't fail if stats can't be loaded
        }
        
        setProfile(uiProfile);
        setEditedProfile(uiProfile);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Error loading your profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedProfile) {
      try {
        setLoading(true);
        const updateData = convertToBackendUpdateFormat(editedProfile);
        
        const response = await userService.updateProfile(updateData);
        
        if (response.success) {
          // Update the displayed profile
          setProfile(editedProfile);
          setIsEditing(false);
          toast.success('Profile updated successfully!');
        } else {
          toast.error('Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('An error occurred while updating your profile');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        [field]: value
      });
    }
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        emergencyContact: {
          ...editedProfile.emergencyContact,
          [field]: value
        }
      });
    }
  };

  const handleSkillsChange = (skills: string) => {
    if (editedProfile) {
      setEditedProfile({
        ...editedProfile,
        skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !editedProfile) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FaUser className="mx-auto text-gray-400 text-4xl mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
        <p className="text-gray-500">{error || 'Unable to load your profile information.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-20 h-20 object-cover rounded-full"
                />
              ) : (
                <div className="w-20 h-20 bg-quickshift-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-gray-600">{profile.university}</p>
                <p className="text-sm text-gray-500">{profile.faculty} • {profile.year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 bg-quickshift-primary text-white px-4 py-2 rounded-lg hover:bg-quickshift-secondary transition-colors"
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaSave />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.completedGigs}</div>
              <div className="text-sm text-gray-600">Completed Gigs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{profile.rating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor((new Date().getTime() - new Date(profile.joinedDate).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-2" />
                  Email
                </label>
                <p className="text-gray-900">{profile.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaPhone className="inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUniversity className="inline mr-2" />
                  University
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.university}
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.university || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaIdCard className="inline mr-2" />
                  Student ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.studentId || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaGraduationCap className="inline mr-2" />
                  Year & Faculty
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Year (e.g., 3rd Year)"
                      value={editedProfile.year}
                      onChange={(e) => handleInputChange('year', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Faculty"
                      value={editedProfile.faculty}
                      onChange={(e) => handleInputChange('faculty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {profile.year ? (profile.year + (profile.faculty ? ` • ${profile.faculty}` : '')) : 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profile.address || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills and Bio */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Bio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              {isEditing ? (
                <input
                  type="text"
                  placeholder="Enter skills separated by commas"
                  value={editedProfile.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length > 0 ? profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-quickshift-light text-quickshift-primary px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  )) : (
                    <p className="text-gray-500">No skills added yet</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell employers about yourself..."
                />
              ) : (
                <p className="text-gray-700">{profile.bio || 'No bio provided yet.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.emergencyContact.name}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.emergencyContact.name || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.emergencyContact.relationship}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.emergencyContact.relationship || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.emergencyContact.phone}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.emergencyContact.phone || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
