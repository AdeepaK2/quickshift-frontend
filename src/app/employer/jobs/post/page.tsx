'use client';
import JobForm from '@/components/employer/JobForm';

export default function PostJobPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post New Job</h1>
      <JobForm />
    </div>
  );
}