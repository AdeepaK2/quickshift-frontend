'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  BriefcaseIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  ListBulletIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { gigRequestService, CreateGigRequestRequest } from '@/services/gigRequestService';

interface JobPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface JobFormData {
  title: string;
  description: string;
  category: string;
  payRate: {
    amount: number;
    rateType: 'hourly' | 'fixed' | 'daily';
  };
  location: {
    address: string;
    city: string;
    postalCode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  requirements: string;
  skills: string;
  experience: string;
  applicationDeadline: string;
  totalPositions: number;
}

export default function JobPostModal({ isOpen, onClose, onSuccess }: JobPostModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: 'Software Engineer',
    description: 'We are looking for a skilled software engineer to join our development team. You will be responsible for designing, developing, and maintaining web applications using modern technologies. The ideal candidate should have experience with JavaScript, React, and backend development.',
    category: 'Technology',
    payRate: {
      amount: 5000,
      rateType: 'hourly'
    },
    location: {
      address: '123 Galle Road, Colombo 03',
      city: 'Colombo',
      postalCode: '00300',
      coordinates: {
        latitude: 6.9271,
        longitude: 79.8612
      }
    },
    requirements: '• Must be 18 years or older\n• Bachelor\'s degree in Computer Science or related field\n• 2+ years of software development experience\n• Strong problem-solving skills\n• Ability to work in a team environment',
    skills: 'JavaScript, React, Node.js, MongoDB, Git',
    experience: '2-5 years',
    applicationDeadline: '2025-07-20',
    totalPositions: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    'General',
    'Technology',
    'Healthcare',
    'Education',
    'Retail',
    'Food Service',
    'Construction',
    'Transportation',
    'Event Staff',
    'Customer Service',
    'Sales',
    'Marketing',
    'Other'
  ];

  const steps = [
    { title: 'Basic Info', icon: BriefcaseIcon },
    { title: 'Details', icon: DocumentTextIcon },
    { title: 'Requirements', icon: ListBulletIcon },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'payRateAmount') {
      setFormData(prev => ({
        ...prev,
        payRate: { ...prev.payRate, amount: parseFloat(value) || 0 }
      }));
    } else if (name === 'payRateType') {
      setFormData(prev => ({
        ...prev,
        payRate: { ...prev.payRate, rateType: value as 'hourly' | 'fixed' | 'daily' }
      }));
    } else if (name === 'address' || name === 'city' || name === 'postalCode') {
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep < steps.length - 1) {
      e.preventDefault();
      if (canProceed()) {
        nextStep();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit if we're on the last step
    if (currentStep !== steps.length - 1) {
      nextStep();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create default time slots for the next 30 days
      const defaultTimeSlots = [{
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours later
        peopleNeeded: formData.totalPositions,
        peopleAssigned: 0
      }];

      const jobData: CreateGigRequestRequest = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        payRate: formData.payRate,
        location: formData.location,
        timeSlots: defaultTimeSlots,
        requirements: formData.requirements.split('\n').filter(req => req.trim() !== ''),
        skillsRequired: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== ''),
        experienceRequired: formData.experience,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined,
        totalPositions: formData.totalPositions,
        visibility: 'public'
      };
      
      console.log('Creating job with data:', jobData);
      const response = await gigRequestService.createGigRequest(jobData);
      console.log('Job creation response:', response);
      
      if (response.success) {
        setShowSuccess(true);
        // Show success toast
        toast.success('Job posted successfully! Your job is now live and accepting applications.', {
          duration: 4000,
        });
        
        // Call onSuccess immediately to refresh the job list
        onSuccess();
        
        setTimeout(() => {
          setShowSuccess(false);
          setCurrentStep(0);
          setFormData({
            title: 'Software Engineer',
            description: 'We are looking for a skilled software engineer to join our development team. You will be responsible for designing, developing, and maintaining web applications using modern technologies. The ideal candidate should have experience with JavaScript, React, and backend development.',
            category: 'Technology',
            payRate: { amount: 5000, rateType: 'hourly' },
            location: { 
              address: '123 Galle Road, Colombo 03', 
              city: 'Colombo', 
              postalCode: '00300', 
              coordinates: { latitude: 6.9271, longitude: 79.8612 } 
            },
            requirements: '• Must be 18 years or older\n• Bachelor\'s degree in Computer Science or related field\n• 2+ years of software development experience\n• Strong problem-solving skills\n• Ability to work in a team environment',
            skills: 'JavaScript, React, Node.js, MongoDB, Git',
            experience: '2-5 years',
            applicationDeadline: '2025-07-20',
            totalPositions: 1
          });
          onClose();
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      // Show error toast
      toast.error(error instanceof Error ? error.message : 'Failed to create job. Please try again.', {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.category && formData.payRate.amount > 0;
      case 1:
        return formData.description && formData.location.address && formData.location.city;
      case 2:
        return formData.requirements;
      default:
        return false;
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setShowSuccess(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Post New Job</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Success Animation */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white rounded-xl flex items-center justify-center z-10"
              >
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4"
                  >
                    <CheckCircleIcon className="w-12 h-12 text-green-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h3>
                  <p className="text-gray-600">Your job posting is now live and accepting applications.</p>
                </div>
              </motion.div>
            )}

            {/* Progress Steps */}
            <div className="flex items-center justify-between p-6 bg-gray-50">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center ${index !== steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index !== steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-6">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. software engineer, Event Staff, Customer Service Representative"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pay Rate *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">LKR</span>
                        <input
                          type="number"
                          name="payRateAmount"
                          value={formData.payRate.amount || ''}
                          onChange={handleChange}
                          placeholder="0"
                          className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pay Type *
                      </label>
                      <select
                        name="payRateType"
                        value={formData.payRate.rateType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="hourly">Per Hour</option>
                        <option value="daily">Per Day</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Positions
                    </label>
                    <input
                      type="number"
                      name="totalPositions"
                      value={formData.totalPositions}
                      onChange={handleChange}
                      placeholder="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Details */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Describe the job responsibilities, qualifications, and what you're looking for..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.location.address}
                      onChange={handleChange}
                      placeholder="e.g. 123 Main Street, Colombo 03"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.location.city}
                        onChange={handleChange}
                        placeholder="e.g. Colombo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.location.postalCode}
                        onChange={handleChange}
                        placeholder="e.g. 00300"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Requirements */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Requirements *
                    </label>
                    <textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Enter each requirement on a new line:
• Must be 18 years or older
• Good communication skills
• Ability to work weekends
• Previous experience preferred"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">Enter each requirement on a new line</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skills Required
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g. Communication, Time Management, Customer Service"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Required
                    </label>
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select experience level</option>
                      <option value="No experience required">No experience required</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-5 years">2-5 years</option>
                      <option value="5+ years">5+ years</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={currentStep === 0 ? onClose : prevStep}
                  className="flex items-center"
                >
                  {currentStep === 0 ? 'Cancel' : (
                    <>
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Previous
                    </>
                  )}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !canProceed()}
                    className="flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Posting...
                      </>
                    ) : (
                      'Post Job'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
