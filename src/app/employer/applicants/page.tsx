'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  studentId: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  jobTitle: string;
  jobId: string;
  skills: string[];
  experience: string;
  resume?: string;
  coverLetter?: string;
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockApplicants: Applicant[] = [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@university.edu',
        phone: '+94 77 123 4567',
        university: 'University of Colombo',
        studentId: '2021/CS/045',
        appliedDate: '2024-12-15',
        status: 'pending',
        jobTitle: 'Event Staff',
        jobId: 'job1',
        skills: ['Communication', 'Time Management', 'Team Work'],
        experience: '2 years part-time work experience in retail',
        resume: 'sarah_johnson_resume.pdf',
        coverLetter: 'I am very interested in this position...'
      },
      {
        id: '2',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@university.edu',
        phone: '+94 71 987 6543',
        university: 'University of Peradeniya',
        studentId: '2020/ENG/087',
        appliedDate: '2024-12-14',
        status: 'approved',
        jobTitle: 'Marketing Assistant',
        jobId: 'job2',
        skills: ['Marketing', 'Social Media', 'Content Creation'],
        experience: 'Internship at local marketing agency',
        resume: 'michael_chen_resume.pdf',
        coverLetter: 'With my background in engineering...'
      },
      {
        id: '3',
        firstName: 'Emma',
        lastName: 'Wijesinghe',
        email: 'emma.wijesinghe@university.edu',
        phone: '+94 76 555 7890',
        university: 'University of Moratuwa',
        studentId: '2022/IT/023',
        appliedDate: '2024-12-13',
        status: 'rejected',
        jobTitle: 'Data Entry Clerk',
        jobId: 'job3',
        skills: ['Data Entry', 'Excel', 'Attention to Detail'],
        experience: 'Fresh graduate with academic projects',
        resume: 'emma_wijesinghe_resume.pdf',
        coverLetter: 'I am excited to apply for this role...'
      }
    ];

    // Simulate API call delay
    setTimeout(() => {
      setApplicants(mockApplicants);
      setLoading(false);
    }, 1000);
  }, []);

  const handleStatusUpdate = async (applicantId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Here you would make API call to update status
      // await applicantsApi.updateStatus(applicantId, newStatus);
      
      setApplicants(prev => 
        prev.map(applicant => 
          applicant.id === applicantId 
            ? { ...applicant, status: newStatus }
            : applicant
        )
      );
    } catch (error) {
      console.error('Error updating applicant status:', error);
    }
  };

  const handleViewApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsViewModalOpen(true);
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      applicant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'approved':
        return <CheckIcon className="w-4 h-4" />;
      case 'rejected':
        return <XMarkIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0077B6] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Applicants</h1>
            <p className="text-gray-600 mt-2">Manage and review job applications</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-[#0077B6] text-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Total: {applicants.length} applicants</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or job title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0077B6] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applicants List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredApplicants.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No applications have been received yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Applied
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplicants.map((applicant) => (
                  <motion.tr
                    key={applicant.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-[#0077B6] rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {applicant.firstName} {applicant.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                            {applicant.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{applicant.jobTitle}</div>
                      <div className="text-sm text-gray-500">ID: {applicant.jobId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{applicant.university}</div>
                      <div className="text-sm text-gray-500">{applicant.studentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(applicant.appliedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(applicant.status)}`}>
                        {getStatusIcon(applicant.status)}
                        <span className="ml-1 capitalize">{applicant.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewApplicant(applicant)}
                        className="text-[#0077B6] hover:text-[#005F8A] inline-flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </button>
                      {applicant.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(applicant.id, 'approved')}
                            className="text-green-600 hover:text-green-800 inline-flex items-center"
                          >
                            <CheckIcon className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                            className="text-red-600 hover:text-red-800 inline-flex items-center"
                          >
                            <XMarkIcon className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Applicant Modal */}
      {isViewModalOpen && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Applicant Details
                </h3>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedApplicant.firstName} {selectedApplicant.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplicant.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplicant.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">University</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplicant.university}</p>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Application Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Job Applied</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedApplicant.jobTitle}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Application Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedApplicant.appliedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#0077B6] text-white text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Experience</h4>
                <p className="text-sm text-gray-900">{selectedApplicant.experience}</p>
              </div>

              {/* Cover Letter */}
              {selectedApplicant.coverLetter && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{selectedApplicant.coverLetter}</p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplicant.resume && (
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Resume</h4>
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                    <a
                      href="#"
                      className="text-[#0077B6] hover:text-[#005F8A] text-sm"
                    >
                      {selectedApplicant.resume}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedApplicant.status === 'pending' && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedApplicant.id, 'rejected');
                    setIsViewModalOpen(false);
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedApplicant.id, 'approved');
                    setIsViewModalOpen(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
