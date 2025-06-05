'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Job } from '@/types/employer';
import JobCard from '@/components/employer/JobCard';
import Button from '@/components/ui/Button';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const handleCloseJob = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'closed' as const } : job
    ));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
        <Link href="/employer/jobs/post">
          <Button>Post New Job</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No jobs posted yet.</p>
            <Link href="/employer/jobs/post">
              <Button className="mt-4">Post Your First Job</Button>
            </Link>
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onDelete={handleDeleteJob}
              onClose={handleCloseJob}
            />
          ))
        )}
      </div>
    </div>
  );
}