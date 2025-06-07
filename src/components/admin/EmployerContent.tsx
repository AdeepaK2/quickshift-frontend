"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Eye,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ClipboardCheck,
  Clock,
  UserCheck,
  Star,
  Shield,
  AlertTriangle,
  Check,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import CustomSelect from "@/components/ui/Select"; // Renamed to avoid conflict

// Define types for our employer data
type Employer = {
  id: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  location: string;
  isVerified: boolean;
  accountVerified: boolean;
  averageRating: number;
  totalReviews: number;
  lastLogin: string;
  profilePicture: string;
  companyDescription: string;
  createdAt: string;
  updatedAt: string;
};

// Badge component (if not available from shadcn/ui)
const Badge = ({ 
  children, 
  variant = "default", 
  className = "",
  onClick 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
  onClick?: () => void;
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    destructive: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

// Avatar component (if not available from shadcn/ui)
const Avatar = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => (
  <img className="aspect-square h-full w-full object-cover" src={src} alt={alt} />
);

const AvatarFallback = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-muted ${className}`}>
    {children}
  </div>
);

// Dialog component (simplified version)
const Dialog = ({ 
  open, 
  onOpenChange, 
  children 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  children: React.ReactNode; 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

const DialogDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-2">{children}</p>
);

// Separator component
const Separator = ({ className = "" }: { className?: string }) => (
  <hr className={`border-gray-200 ${className}`} />
);

// Mock data for employers
const mockEmployers: Employer[] = [
  {
    id: "1",
    companyName: "Tech Innovations Inc.",
    email: "hr@techinnovations.com",
    phoneNumber: "+1234567890",
    location: "New York, USA",
    isVerified: true,
    accountVerified: true,
    averageRating: 4.7,
    totalReviews: 45,
    lastLogin: "2025-05-25T10:30:00",
    profilePicture: "",
    companyDescription:
      "Leading technology solutions provider specializing in AI and machine learning applications for enterprise clients.",
    createdAt: "2024-01-15T08:20:00",
    updatedAt: "2025-05-20T14:45:00",
  },
  {
    id: "2",
    companyName: "Global Finance Partners",
    email: "careers@gfpartners.com",
    phoneNumber: "+1987654321",
    location: "London, UK",
    isVerified: true,
    accountVerified: true,
    averageRating: 4.2,
    totalReviews: 38,
    lastLogin: "2025-05-24T15:45:00",
    profilePicture: "",
    companyDescription:
      "International financial services firm providing consulting and investment solutions for businesses and individuals.",
    createdAt: "2024-02-22T10:15:00",
    updatedAt: "2025-05-18T09:30:00",
  },
  {
    id: "3",
    companyName: "Creative Media Solutions",
    email: "jobs@creativemedia.com",
    phoneNumber: "+1122334455",
    location: "Los Angeles, USA",
    isVerified: false,
    accountVerified: false,
    averageRating: 3.9,
    totalReviews: 22,
    lastLogin: "2025-05-23T09:15:00",
    profilePicture: "",
    companyDescription:
      "Boutique media agency specializing in digital marketing, content creation, and brand strategy for emerging companies.",
    createdAt: "2024-03-10T13:40:00",
    updatedAt: "2025-05-15T11:20:00",
  },
  {
    id: "4",
    companyName: "Sustainable Energy Corp",
    email: "recruitment@sustainableenergy.org",
    phoneNumber: "+1565758595",
    location: "Berlin, Germany",
    isVerified: true,
    accountVerified: false,
    averageRating: 4.8,
    totalReviews: 31,
    lastLogin: "2025-05-20T14:20:00",
    profilePicture: "",
    companyDescription:
      "Pioneering renewable energy solutions with a focus on solar and wind technologies for residential and commercial applications.",
    createdAt: "2024-04-05T09:50:00",
    updatedAt: "2025-05-12T16:15:00",
  },
  {
    id: "5",
    companyName: "Health Innovations",
    email: "careers@healthinnovations.com",
    phoneNumber: "+1454545454",
    location: "Boston, USA",
    isVerified: false,
    accountVerified: true,
    averageRating: 4.1,
    totalReviews: 27,
    lastLogin: "2025-05-18T11:10:00",
    profilePicture: "",
    companyDescription:
      "Healthcare technology company developing patient-centered solutions and digital health platforms for hospitals and clinics.",
    createdAt: "2024-05-20T14:30:00",
    updatedAt: "2025-05-10T10:45:00",
  },
];

// Locations for the filter
const locations = [
  "All Locations",
  "New York, USA",
  "London, UK",
  "Los Angeles, USA",
  "Berlin, Germany",
  "Boston, USA",
];

// Verification statuses for the filter
const verificationStatuses = ["All", "Verified", "Not Verified"];

// Rating ranges for the filter
const ratingRanges = [
  { label: "All Ratings", value: "all" },
  { label: "4.5 and above", value: "4.5-5" },
  { label: "4.0 - 4.49", value: "4-4.49" },
  { label: "3.5 - 3.99", value: "3.5-3.99" },
  { label: "Below 3.5", value: "0-3.49" },
];

export default function EmployerContent() {
  const [employers, setEmployers] = useState<Employer[]>(mockEmployers);
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("all");

  // Function to handle filtering
  useEffect(() => {
    let filteredEmployers = mockEmployers;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEmployers = filteredEmployers.filter(
        (employer) =>
          employer.companyName.toLowerCase().includes(query) ||
          employer.email.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationFilter && locationFilter !== "All Locations") {
      filteredEmployers = filteredEmployers.filter(
        (employer) => employer.location === locationFilter
      );
    }

    // Filter by verification status
    if (verificationFilter !== "All") {
      const isVerified = verificationFilter === "Verified";
      filteredEmployers = filteredEmployers.filter(
        (employer) => employer.accountVerified === isVerified
      );
    }

    // Filter by rating range
    if (ratingFilter !== "all") {
      const [min, max] = ratingFilter.split("-").map(Number);
      filteredEmployers = filteredEmployers.filter(
        (employer) =>
          employer.averageRating >= min && employer.averageRating <= max
      );
    }

    setEmployers(filteredEmployers);
  }, [searchQuery, locationFilter, verificationFilter, ratingFilter]);

  // Function to format date and time
  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Function to handle employer verification
  const handleVerifyEmployer = (employerId: string) => {
    setEmployers((prevEmployers) =>
      prevEmployers.map((employer) =>
        employer.id === employerId
          ? { ...employer, accountVerified: true, isVerified: true }
          : employer
      )
    );
  };

  // Function to handle employer suspension
  const handleSuspendEmployer = (employerId: string) => {
    setEmployers((prevEmployers) =>
      prevEmployers.map((employer) =>
        employer.id === employerId
          ? { ...employer, accountVerified: false }
          : employer
      )
    );
  };

  // View employer details
  const handleViewEmployer = (employer: Employer) => {
    setSelectedEmployer(employer);
    setIsDialogOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Employer Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Search Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Employers</h2>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              label="Search Employers"
              type="text"
              placeholder="Search by company name or email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <CustomSelect
              value={locationFilter}
              onChange={(value) => setLocationFilter(value)}
              options={locations.map(loc => ({ value: loc, label: loc }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Status</label>
            <CustomSelect
              value={verificationFilter}
              onChange={(value) => setVerificationFilter(value)}
              options={verificationStatuses.map(status => ({ value: status, label: status }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <CustomSelect
              value={ratingFilter}
              onChange={(value) => setRatingFilter(value)}
              options={ratingRanges.map(range => ({ value: range.value, label: range.label }))}
            />
          </div>
        </div>

        {/* Employers Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {employers.length > 0 ? (
                employers.map((employer) => (
                  <tr key={employer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage
                            src={employer.profilePicture}
                            alt={employer.companyName}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {employer.companyName
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-gray-900">
                          {employer.companyName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          employer.accountVerified ? "success" : "warning"
                        }
                      >
                        {employer.accountVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{employer.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEmployer(employer)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {!employer.accountVerified && (
                          <Badge
                            className="cursor-pointer hover:bg-green-100 bg-green-50 text-green-800 border border-green-200 px-3 py-1"
                            onClick={() => handleVerifyEmployer(employer.id)}
                          >
                            <Check className="h-4 w-4 mr-1 inline text-green-600" />
                            Verify
                          </Badge>
                        )}
                        {employer.accountVerified && (
                          <Badge
                            className="cursor-pointer hover:bg-red-100 bg-red-50 text-red-800 border border-red-200 px-3 py-1"
                            onClick={() => handleSuspendEmployer(employer.id)}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1 inline text-red-600" />
                            Suspend
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No employers found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employer Detail Modal */}
      {selectedEmployer && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Employer Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedEmployer.companyName}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4">
              {/* Company Profile Header */}
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedEmployer.profilePicture}
                    alt={selectedEmployer.companyName}
                  />
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                    {selectedEmployer.companyName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedEmployer.companyName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedEmployer.email}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedEmployer.accountVerified
                          ? "success"
                          : "destructive"
                      }
                    >
                      {selectedEmployer.accountVerified
                        ? "Account Verified"
                        : "Not Verified"}
                    </Badge>
                    <Badge
                      variant={
                        selectedEmployer.isVerified ? "success" : "warning"
                      }
                    >
                      {selectedEmployer.isVerified
                        ? "Profile Verified"
                        : "Not Verified"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Contact Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{selectedEmployer.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{selectedEmployer.phoneNumber}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{selectedEmployer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Account Statistics
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-2" />
                        <span>
                          Average Rating:{" "}
                          {selectedEmployer.averageRating.toFixed(1)} (
                          {selectedEmployer.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          Last Login:{" "}
                          {formatDateTime(selectedEmployer.lastLogin)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Company Description
                    </h4>
                    <p className="mt-2 text-sm text-gray-700">
                      {selectedEmployer.companyDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Account Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          Created: {formatDateTime(selectedEmployer.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          Updated: {formatDateTime(selectedEmployer.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {!selectedEmployer.accountVerified ? (
                  <Badge
                    className="cursor-pointer hover:bg-green-100 bg-green-50 text-green-800 border border-green-200 px-4 py-2"
                    onClick={() => {
                      handleVerifyEmployer(selectedEmployer.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2 inline text-green-600" />
                    Verify Employer
                  </Badge>
                ) : (
                  <Badge
                    className="cursor-pointer hover:bg-red-100 bg-red-50 text-red-800 border border-red-200 px-4 py-2"
                    onClick={() => {
                      handleSuspendEmployer(selectedEmployer.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2 inline text-red-600" />
                    Suspend Account
                  </Badge>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}