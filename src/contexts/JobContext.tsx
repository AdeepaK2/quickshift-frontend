'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Job } from '@/types/employer';

interface JobContextType {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount'>) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  deleteJob: (jobId: string) => void;
  setJobs: (jobs: Job[]) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function useJobs() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
}

interface JobProviderProps {
  children: ReactNode;
}

export function JobProvider({ children }: JobProviderProps) {
  const [jobs, setJobsState] = useState<Job[]>([
    // Default sample jobs
    {
      id: '1',
      title: 'Frontend Developer',
      description: 'We are looking for an experienced frontend developer proficient in React and TypeScript.',
      location: 'Remote',
      type: 'full-time',
      createdAt: new Date('2023-05-01'),
      updatedAt: new Date('2023-05-01'),
      status: 'active',
      applicantCount: 12,
      salary: {
        min: 80000,
        max: 120000,
        currency: 'USD'
      },
      requirements: [
        'React', 
        'TypeScript', 
        '3+ years experience'
      ]
    },
    {
      id: '2',
      title: 'UX Designer',
      description: 'Looking for a talented UX designer to join our product team.',
      location: 'New York, NY',
      type: 'contract',
      createdAt: new Date('2023-05-03'),
      updatedAt: new Date('2023-05-03'),
      status: 'closed',
      applicantCount: 8,
      salary: {
        min: 90000,
        max: 130000,
        currency: 'USD'
      },
      requirements: [
        'Figma', 
        'User Research', 
        '2+ years experience'
      ]
    },
    {
      id: '3',
      title: 'Project Manager',
      description: 'Seeking an experienced project manager for our engineering team.',
      location: 'San Francisco, CA',
      type: 'full-time',
      createdAt: new Date('2023-05-07'),
      updatedAt: new Date('2023-05-07'),
      status: 'draft',
      applicantCount: 0,
      salary: {
        min: 100000,
        max: 150000,
        currency: 'USD'
      },
      requirements: [
        'Agile methodologies', 
        'Jira', 
        '5+ years experience'
      ]
    }
  ]);

  const addJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicantCount'>) => {
    const newJob: Job = {
      ...jobData,
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      createdAt: new Date(),
      updatedAt: new Date(),
      applicantCount: 0,
    };
    
    setJobsState(prevJobs => [newJob, ...prevJobs]); // Add to beginning for newest first
  };

  const updateJob = (jobId: string, updates: Partial<Job>) => {
    setJobsState(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, ...updates, updatedAt: new Date() }
          : job
      )
    );
  };

  const deleteJob = (jobId: string) => {
    setJobsState(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

  const setJobs = (newJobs: Job[]) => {
    setJobsState(newJobs);
  };

  return (
    <JobContext.Provider value={{ 
      jobs, 
      addJob, 
      updateJob, 
      deleteJob, 
      setJobs 
    }}>
      {children}
    </JobContext.Provider>
  );
}
