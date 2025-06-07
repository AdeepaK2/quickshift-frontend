export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  status: 'active' | 'closed' | 'draft';
  createdAt: Date;
  updatedAt: Date;
  applicantCount: number;
}

export interface Applicant {
  id: string;
  jobId: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: Date;
  rating?: number;
}

export interface EmployerProfile {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  address: string;
  industry: string;
  companySize: string;
}

export interface EmployerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  companyName: string;
  companyEmail: string;
  website: string;
  description: string;
  address: string;
  contactPerson: string;
  industry: string;
  companySize: string;
  profilePicture: string | null; // New property added
}