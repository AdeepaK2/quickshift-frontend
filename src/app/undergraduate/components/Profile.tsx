'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaIdCard, FaEdit, FaSave } from 'react-icons/fa';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  university: string;
  studentId: string;
  bio: string;
  skills: string[];
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+94 77 123 4567',
    university: 'University of Colombo',
    studentId: '2020/CS/123',
    bio: 'Computer Science undergraduate with a passion for technology and innovation.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  });

  const [editedProfile, setEditedProfile] = useState<ProfileData>(profile);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-24"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#03045E]">My Profile</h1>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center px-6 py-3 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isEditing ? (
            <>
              <FaSave className="mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <FaEdit className="mr-2" />
              Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <FaUser className="inline mr-2 text-[#0077B6]" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
              />
            ) : (
              <p className="text-gray-800 text-lg">{profile.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <FaEnvelope className="inline mr-2 text-[#0077B6]" />
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
              />
            ) : (
              <p className="text-gray-800 text-lg">{profile.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <FaPhone className="inline mr-2 text-[#0077B6]" />
              Phone
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={editedProfile.phone}
                onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
              />
            ) : (
              <p className="text-gray-800 text-lg">{profile.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <FaUniversity className="inline mr-2 text-[#0077B6]" />
              University
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.university}
                onChange={(e) => setEditedProfile({ ...editedProfile, university: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
              />
            ) : (
              <p className="text-gray-800 text-lg">{profile.university}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              <FaIdCard className="inline mr-2 text-[#0077B6]" />
              Student ID
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.studentId}
                onChange={(e) => setEditedProfile({ ...editedProfile, studentId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
              />
            ) : (
              <p className="text-gray-800 text-lg">{profile.studentId}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
          {isEditing ? (
            <textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
            />
          ) : (
            <p className="text-gray-800 text-lg leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Skills</label>
          <div className="flex flex-wrap gap-3 mb-4">
            {(isEditing ? editedProfile.skills : profile.skills).map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-[#CAF0F8] text-[#0077B6] rounded-full text-sm font-medium flex items-center"
              >
                {skill}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-[#0077B6] hover:text-red-500 transition-colors duration-200"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent shadow-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button
                onClick={handleAddSkill}
                className="px-6 py-3 bg-[#0077B6] text-white rounded-lg hover:bg-[#00B4D8] transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 