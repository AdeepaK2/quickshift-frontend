'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  ListBulletIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function JobForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    minSalary: '',
    maxSalary: '',
    requirements: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowConfetti(true);
      console.log('Job posted:', formData);
      
      setTimeout(() => {
        router.push('/employer/jobs');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'remote', label: 'Remote' },
  ];

  const sections = [
    { title: 'Basic Information', icon: BriefcaseIcon },
    { title: 'Job Details', icon: DocumentTextIcon },
    { title: 'Requirements', icon: ListBulletIcon },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="p-0 overflow-hidden shadow-lg border border-gray-200 relative">
        {/* Confetti animation when form is successfully submitted */}
        {showConfetti && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-90">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-800">Job Posted Successfully!</h3>
              <p className="text-gray-600 mt-2">Redirecting you to the jobs dashboard...</p>
            </motion.div>
          </div>
        )}

        {/* Enhanced Progress Tracker - Desktop */}
        <div className="hidden sm:block bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between relative">
            {/* Connecting line behind all steps */}
            <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-0"></div>
            
            {sections.map((section, index) => (
              <motion.div
                key={index}
                className="relative z-10 flex flex-col items-center"
                initial={false}
                animate={currentSection >= index ? { scale: 1 } : { scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Step icon with animated ring */}
                <div className="relative mb-3">
                  <motion.div 
                    className={`absolute inset-0 rounded-full ${
                      currentSection === index ? "bg-blue-100" : "bg-transparent"
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={currentSection === index ? 
                      { scale: 1.6, opacity: 0.5 } : 
                      { scale: 0.8, opacity: 0 }
                    }
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  />
                  <motion.button
                    onClick={() => setCurrentSection(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentSection >= index 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200/50" 
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    } transition-all duration-300`}
                    style={{ 
                      boxShadow: currentSection === index 
                        ? '0 0 0 4px rgba(59, 130, 246, 0.15)' 
                        : 'none' 
                    }}
                  >
                    <section.icon className={`w-5 h-5 ${
                      currentSection === index ? "animate-pulse" : ""
                    }`} />
                  </motion.button>
                  
                  {/* Completion check for completed steps */}
                  {currentSection > index && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
                
                {/* Improved Progress Line connecting to next step */}
                {index < sections.length - 1 && (
                  <div 
                    className="absolute h-1.5 rounded-full overflow-hidden"
                    style={{
                      top: "21px",
                      left: "55px",
                      right: "-55px",
                      zIndex: 5,
                      background: "linear-gradient(to right, rgba(243, 244, 246, 0.5) 0%, rgba(229, 231, 235, 1) 100%)",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)"
                    }}
                  >
                    <motion.div 
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: currentSection > index ? "100%" : 0 
                      }}
                      style={{
                        background: "linear-gradient(to right, #3b82f6, #2563eb)",
                        boxShadow: currentSection > index ? "0 0 8px rgba(59, 130, 246, 0.5)" : "none",
                        position: "absolute",
                        top: 0,
                        left: 0
                      }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  </div>
                )}
                
                {/* Step title with animated color change */}
                <motion.div 
                  animate={{ 
                    color: currentSection >= index ? "#2563eb" : "#6b7280",
                    fontWeight: currentSection === index ? 600 : 500
                  }}
                  className="text-center"
                >
                  <p className="text-sm font-medium whitespace-nowrap">{section.title}</p>
                  {currentSection === index && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: '100%', opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="h-0.5 bg-blue-500 mt-1 rounded-full"
                    />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white relative overflow-hidden">
          <motion.div 
            className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute bottom-4 right-8 w-32 h-32 bg-blue-400 opacity-10 rounded-full"
            animate={{ 
              scale: [1, 1.1, 1],
              x: [0, 10, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold relative z-10"
          >
            Post a New Job
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-blue-100 relative z-10"
          >
            Fill in the details below to create your job listing
          </motion.p>
        </div>
        
        {/* Progress indicator - mobile only */}
        <div className="sm:hidden px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-gray-600">
              Step {currentSection + 1} of {sections.length}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {sections[currentSection].title}
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate={currentSection === 0 ? "show" : "hidden"}
            className={currentSection === 0 ? "block" : "hidden"}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-lg font-semibold text-gray-800 mb-6 flex items-center"
            >
              <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </motion.h3>

            <motion.div variants={itemVariants} className="mb-6">
              <Input
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Developer"
                required
                className="bg-white focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe the responsibilities, qualifications, and benefits of the position"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
              <p className="mt-2 text-xs text-gray-500">A clear, detailed description attracts more qualified candidates</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-8 flex justify-end"
            >
              <Button
                type="button"
                onClick={() => setCurrentSection(1)}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 px-6 group"
              >
                Next Step
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.section>

          {/* Job Details Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate={currentSection === 1 ? "show" : "hidden"}
            className={currentSection === 1 ? "block" : "hidden"}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-lg font-semibold text-gray-800 mb-6 flex items-center"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
              Job Details
            </motion.h3>

            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                  Location
                </label>
                <div className="relative">
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. New York, NY or Remote"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <div className="w-0.5 h-6 bg-gray-300"></div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <div className="relative">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                      <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-gray-500" />
                  Salary Range (Optional)
                </div>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    name="minSalary"
                    value={formData.minSalary}
                    onChange={handleChange}
                    placeholder="Min Salary"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    min="0"
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    name="maxSalary"
                    value={formData.maxSalary}
                    onChange={handleChange}
                    placeholder="Max Salary"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    min="0"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Including salary information can increase the number of applicants by up to 30%</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-8 flex justify-between"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentSection(0)}
                className="border-gray-300"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentSection(2)}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 px-6 group"
              >
                Next Step
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.section>

          {/* Requirements Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate={currentSection === 2 ? "show" : "hidden"}
            className={currentSection === 2 ? "block" : "hidden"}
          >
            <motion.h3 
              variants={itemVariants}
              className="text-lg font-semibold text-gray-800 mb-6 flex items-center"
            >
              <ListBulletIcon className="w-5 h-5 mr-2 text-blue-600" />
              Requirements
            </motion.h3>
            
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Requirements
              </label>
              <div className="p-4 bg-gray-50 rounded-md mb-3">
                <p className="text-xs text-gray-600 mb-2">Pro tip: Great requirements are:</p>
                <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
                  <li>Clear and specific</li>
                  <li>Focused on must-have skills</li>
                  <li>Limited to 5-7 key requirements</li>
                </ul>
              </div>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="• Bachelor's degree in Computer Science or related field
• 3+ years of experience with React.js
• Strong understanding of JavaScript and TypeScript
• Experience with RESTful APIs and state management"
              />
              <p className="mt-2 text-xs text-gray-500">Enter each requirement on a new line, preferably as bullet points</p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row gap-3 justify-between"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCurrentSection(1)}
                className="order-2 sm:order-1 border-gray-300"
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className={`order-1 sm:order-2 ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:ring-blue-500 px-8`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting Job...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Post Job
                  </span>
                )}
              </Button>
            </motion.div>
          </motion.section>
        </form>
      </Card>

      {/* Tip card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800"
      >
        <p className="font-medium">💡 Pro Tip</p>
        <p className="mt-1 text-blue-700">
          Jobs with clear descriptions and specific requirements typically receive 25% more qualified applications.
        </p>
      </motion.div>
    </motion.div>
  );
}