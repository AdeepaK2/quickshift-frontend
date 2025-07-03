'use client';

import { useState } from 'react';
import JobPostModal from '@/components/employer/JobPostModal';

export default function TestModalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Job Post Modal</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
        >
          Open Job Post Modal
        </button>
        
        <div className="mt-8 text-gray-600">
          <p>This is a test page to verify the job posting modal functionality.</p>
          <p>Click the button above to open the modal and test job creation.</p>
        </div>

        <JobPostModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            alert('Job posted successfully!');
          }}
        />
      </div>
    </div>
  );
}
