import Link from 'next/link';
import { Job } from '@/types/employer';
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import { CalendarIcon, UsersIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/20/solid';

interface JobCardProps {
  job: Job;
  onDelete: (jobId: string) => void;
  onClose: (jobId: string) => void;
}

export default function JobCard({ job, onDelete, onClose }: JobCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border border-green-200',
    closed: 'bg-red-100 text-red-800 border border-red-200',
    draft: 'bg-amber-100 text-amber-800 border border-amber-200',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 relative">
      <div className="flex flex-col md:flex-row gap-6 md:gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <span 
              className={`${statusColors[job.status]} px-3 py-1 rounded-full text-xs font-medium inline-block`}
            >
              {formatStatus(job.status)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              <span>{job.type}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-gray-700 hover:bg-gray-100 transition-colors duration-200">
            <p className="line-clamp-2">{job.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              <span>{job.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1.5" />
              <span>{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col md:min-w-[140px]">
          <Link href={`/employer/jobs/${job.id}/applicants`} className="w-full">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full shadow-sm hover:shadow transition-all"
            >
              View Applicants
            </Button>
          </Link>
          <Link href={`/employer/jobs/${job.id}/edit`} className="w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full hover:bg-gray-50 transition-colors"
            >
              Edit
            </Button>
          </Link>
          {job.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
              onClick={() => onClose(job.id)}
            >
              Close
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => onDelete(job.id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}