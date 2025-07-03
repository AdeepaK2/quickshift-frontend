import Link from 'next/link';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { CalendarIcon, UsersIcon, MapPinIcon, BriefcaseIcon, CurrencyDollarIcon } from '@heroicons/react/20/solid';
import { GigRequest } from '@/services/gigRequestService';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface JobCardProps {
  job: GigRequest;
  onDelete: (jobId: string) => void;
  onClose: (jobId: string) => void;
}

export default function JobCard({ job, onDelete, onClose }: JobCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 border border-green-200',
    closed: 'bg-red-100 text-red-800 border border-red-200',
    completed: 'bg-blue-100 text-blue-800 border border-blue-200',
    draft: 'bg-orange-100 text-orange-800 border border-orange-200',
    cancelled: 'bg-gray-100 text-gray-800 border border-gray-200',
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Format location from the job object
  const formatLocation = () => {
    if (!job.location) return "No location specified";
    return `${job.location.city}${job.location.address ? `, ${job.location.address}` : ''}`;
  };
  
  // Format job category/type
  const formatCategory = () => {
    return job.category || "General";
  };
  
  // Format pay rate
  const formatPayRate = () => {
    if (!job.payRate) return "Not specified";
    return `${job.payRate.amount} ${job.payRate.rateType === 'hourly' ? '/hr' : job.payRate.rateType === 'daily' ? '/day' : ' fixed'}`;
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 relative">
      <div className="flex flex-col md:flex-row gap-6 md:gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            <span 
              className={`${job.status in statusColors ? statusColors[job.status as keyof typeof statusColors] : 'bg-gray-100 text-gray-800'} px-3 py-1 rounded-full text-xs font-medium inline-block`}
            >
              {formatStatus(job.status)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
            <div className="flex items-center text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>{formatLocation()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <BriefcaseIcon className="w-4 h-4 mr-1" />
              <span>{formatCategory()}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CurrencyDollarIcon className="w-4 h-4 mr-1" />
              <span>{formatPayRate()}</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4 text-gray-700 hover:bg-gray-100 transition-colors duration-200">
            <p className="line-clamp-2">{job.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-5 text-sm text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1.5" />
              <span>{formatDistanceToNow(parseISO(job.createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex items-center">
              <UsersIcon className="w-4 h-4 mr-1.5" />
              <span>{job.applicationsCount || 0} applicant{(job.applicationsCount !== 1) ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col md:min-w-[140px]">
          <Link href={`/employer/jobs/${job._id}/applicants`} className="w-full">
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full shadow-sm hover:shadow transition-all"
            >
              View Applicants
            </Button>
          </Link>
          <Link href={`/employer/jobs/${job._id}/edit`} className="w-full">
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
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 transition-colors"
              onClick={() => onClose(job._id)}
            >
              Close
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => onDelete(job._id)}
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}