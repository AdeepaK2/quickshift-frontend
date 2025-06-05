import Link from 'next/link';
import { Job } from '@/types/employer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface JobCardProps {
  job: Job;
  onDelete: (jobId: string) => void;
  onClose: (jobId: string) => void;
}

export default function JobCard({ job, onDelete, onClose }: JobCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    closed: 'bg-red-100 text-red-800',
    draft: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
              {job.status}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{job.location} • {job.type}</p>
          <p className="text-gray-700 mb-4">{job.description.substring(0, 150)}...</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📅 {job.createdAt.toLocaleDateString()}</span>
            <span>👥 {job.applicantCount} applicants</span>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <Link href={`/employer/jobs/${job.id}/applicants`}>
            <Button variant="outline" size="sm">View Applicants</Button>
          </Link>
          <Link href={`/employer/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          {job.status === 'active' && (
            <Button variant="outline" size="sm" onClick={() => onClose(job.id)}>
              Close
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => onDelete(job.id)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}