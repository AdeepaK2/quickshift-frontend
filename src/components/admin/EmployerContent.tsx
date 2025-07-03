"use client";

import { useState, useMemo, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Eye,
  Phone,
  Mail,
  Check,
  AlertTriangle,
  Star,
  Shield,
  Calendar,
  MapPin,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { useApi, useMutation } from "@/lib/hooks";
import { employersApi } from "@/lib/api";
import { formatDateTime, getInitials } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSpinner } from "@/components/ui/loading";
import Image from "next/image";

// Debounce utility function
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Define types for our employer data (matching backend API)
type Employer = {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  isVerified: boolean;
  verified: boolean;
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  lastLoginAt?: string;
  profilePicture?: string;
  companyDescription?: string;
  createdAt: string;
  updatedAt: string;
};

// Badge component (if not available from shadcn/ui)
const Badge = ({
  children,
  variant = "default",
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
  onClick?: () => void;
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-blue-100 text-blue-800",
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
const Avatar = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
  >
    {children}
  </div>
);

const AvatarImage = ({ src, alt }: { src: string; alt: string }) => {
  // Only show image if src is not empty (for uploaded profile pictures)
  if (!src) {
    return null; // This will cause fallback to show
  }
  
  return (
    <Image
      className="aspect-square h-full w-full object-cover"
      src={src}
      alt={alt}
      width={112}
      height={112}
      onError={(e) => {
        // Hide broken image and show fallback
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};

const AvatarFallback = ({
  children,
  className = "",
  companyName = "",
}: {
  children: React.ReactNode;
  className?: string;
  companyName?: string;
}) => {
  // Generate a consistent color based on company name
  const getCompanyColor = (name: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-red-500 text-white',
      'bg-indigo-500 text-white',
      'bg-pink-500 text-white',
      'bg-slate-500 text-white',
      'bg-teal-500 text-white',
      'bg-cyan-500 text-white',
      'bg-emerald-500 text-white'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full font-semibold ${getCompanyColor(companyName)} ${className}`}
    >
      {children}
    </div>
  );
};

// Dialog component (simplified version)
const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
);

const DialogDescription = ({ 
  children, 
  className = "" 
}: { 
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={`text-sm text-gray-600 mt-2 ${className}`}>{children}</p>
);

// Separator component
const Separator = ({ className = "" }: { className?: string }) => (
  <hr className={`border-gray-200 ${className}`} />
);

// LoadingState component for consistency
const LoadingState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

// Function to generate sample company logos/images
const getSampleCompanyImage = (): string => {
  // Return empty string to always use colorful fallback avatars
  // This avoids Next.js Image configuration issues with external URLs
  return '';
};

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
  const [selectedEmployer, setSelectedEmployer] = useState<Employer | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [verificationFilter, setVerificationFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("all");

  // API hooks
  const {
    data: employersData,
    loading,
    error,
    refetch,
  } = useApi(employersApi.getAll);
  const { mutate: verifyEmployer, loading: verifyLoading } = useMutation();
  const { mutate: suspendEmployer, loading: suspendLoading } = useMutation();

  // Move employers and undergraduates initialization inside useMemo to fix react-hooks/exhaustive-deps warnings
  const employers = useMemo(() => employersData || [], [employersData]);

  // Debug: Log the API response to console for development
  useEffect(() => {
    if (employersData) {
      console.log("Employers API Response:", employersData);
    }
    if (error) {
      console.error("Employers API Error:", error);
    }
  }, [employersData, error]); // Extract unique locations for filter dropdown
  const availableLocations = useMemo(() => {
    const locations = new Set(
      employers
        .map((employer: Employer) => employer.location)
        .filter(
          (location: string | undefined): location is string =>
            location !== undefined && location.trim() !== ""
        )
    );
    return ["All Locations", ...Array.from(locations)];
  }, [employers]);

  // Filter employers based on search and filter criteria
  const filteredEmployers = useMemo(() => {
    let filtered = employers;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (employer: Employer) =>
          employer.companyName.toLowerCase().includes(query) ||
          employer.email.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationFilter && locationFilter !== "All Locations") {
      filtered = filtered.filter(
        (employer: Employer) => employer.location === locationFilter
      );
    }

    // Filter by verification status
    if (verificationFilter !== "All") {
      const isVerified = verificationFilter === "Verified";
      filtered = filtered.filter(
        (employer: Employer) => employer.verified === isVerified
      );
    }

    // Filter by rating range
    if (ratingFilter !== "all") {
      const [min, max] = ratingFilter.split("-").map(Number);
      filtered = filtered.filter(
        (employer: Employer) =>
          employer.ratings.averageRating >= min &&
          employer.ratings.averageRating <= max
      );
    }

    return filtered;
  }, [
    searchQuery,
    locationFilter,
    verificationFilter,
    ratingFilter,
    employers,
  ]);

  // Debounced search to improve performance
  const debouncedSearch = debounce(
    (value: unknown) => setSearchQuery(value as string),
    300
  ); // Function to handle employer verification
  const handleVerifyEmployer = async (employerId: string) => {
    try {
      const result = await verifyEmployer(
        (id: unknown) => employersApi.verify(id as string),
        employerId
      );
      if (result) {
        toast.success("Employer verified successfully!");
        refetch(); // Refresh the data
        if (selectedEmployer && selectedEmployer._id === employerId) {
          setSelectedEmployer({
            ...selectedEmployer,
            verified: true,
            isVerified: true,
          });
        }
      } else {
        toast.error("Failed to verify employer. Please try again.");
      }
    } catch (error) {
      console.error("Failed to verify employer:", error);
      toast.error("Failed to verify employer. Please try again.");
    }
  };

  // Function to handle employer suspension
  const handleSuspendEmployer = async (employerId: string) => {
    try {
      const result = await suspendEmployer(
        (id: unknown) => employersApi.suspend(id as string),
        employerId
      );
      if (result) {
        toast.success("Employer suspended successfully!");
        refetch(); // Refresh the data
        if (selectedEmployer && selectedEmployer._id === employerId) {
          setSelectedEmployer({ ...selectedEmployer, verified: false });
        }
      } else {
        toast.error("Failed to suspend employer. Please try again.");
      }
    } catch (error) {
      console.error("Failed to suspend employer:", error);
      toast.error("Failed to suspend employer. Please try again.");
    }
  };

  // View employer details
  const handleViewEmployer = (employer: Employer) => {
    setSelectedEmployer(employer);
    setIsDialogOpen(true);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setLocationFilter("All Locations");
    setVerificationFilter("All");
    setRatingFilter("all");
  };

  if (loading) {
    return <LoadingState message="Loading employers..." />;
  }
  if (error) {
    const isConnectionError =
      error.includes("Failed to fetch") ||
      error.includes("Network Error") ||
      error.includes("Backend API failed");
    const errorMessage = isConnectionError
      ? `Unable to connect to backend API. Please ensure the backend server is running at ${
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
        }`
      : error;

    return (
      <ErrorState
        title="Failed to load employers"
        message={errorMessage}
        onRetry={refetch}
      />    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Employers</h1>
      
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        {/* Search Bar */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Employers</h2>
            <div className="relative w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                <Input
                  label=""
                  type="text"
                  placeholder="Search by company name or email..."
                  className="pl-10 pr-4 w-full text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
            </div>
          </div>{/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Location</label>
              <Select
                value={locationFilter}
                onChange={(value: string) => setLocationFilter(value)}
                options={availableLocations.map((loc) => ({
                  value: loc,
                  label: loc,
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Verification Status</label>
              <Select
                value={verificationFilter}
                onChange={(value: string) => setVerificationFilter(value)}
                options={verificationStatuses.map((status) => ({
                  value: status,
                  label: status,
                }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Rating</label>
              <Select
                value={ratingFilter}
                onChange={(value: string) => setRatingFilter(value)}
                options={ratingRanges.map((range) => ({
                  value: range.value,
                  label: range.label,
                }))}
              />
            </div>
          </div>          <div className="space-y-4 p-4">
            {filteredEmployers.length > 0 ? (
              filteredEmployers.map((employer: Employer) => (
                <div key={employer._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={employer.profilePicture || getSampleCompanyImage()}
                          alt={employer.companyName}
                        />
                        <AvatarFallback 
                          className="text-sm font-bold"
                          companyName={employer.companyName}
                        >
                          {getInitials(employer.companyName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {employer.companyName}
                        </h3>
                        <p className="text-xs text-gray-600">{employer.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">{employer.phone || "No phone"}</span>
                          <span className="text-xs text-gray-500">{employer.location || "No location"}</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-blue-400 mr-1" />
                            <span className="text-xs text-gray-500">{employer.ratings.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={employer.verified ? "success" : "warning"}
                        className="text-xs"
                      >
                        {employer.verified ? "Verified" : "Not Verified"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEmployer(employer)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 font-medium"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {!employer.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyEmployer(employer._id)}
                          disabled={verifyLoading}
                          className="text-xs px-2 py-1 bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                      )}
                      {employer.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspendEmployer(employer._id)}
                          disabled={suspendLoading}
                          className="text-xs px-2 py-1 bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No employers found"
                description="Try adjusting your search criteria or filters to find employers."
                action={{
                  label: "Clear Filters",
                  onClick: clearFilters,
                }}
              />
            )}
          </div>
        </div>

      {/* Employer Detail Modal */}
      {selectedEmployer && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">            <DialogHeader>
              <DialogTitle className="text-gray-900 font-semibold text-xl">Employer Details</DialogTitle>
              <DialogDescription className="text-gray-700 font-medium">
                Detailed information about {selectedEmployer.companyName}
              </DialogDescription>
            </DialogHeader><div className="mt-4">
              {/* Company Profile Header */}              <div className="flex items-center space-x-4 mb-6">                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedEmployer.profilePicture || getSampleCompanyImage()}
                    alt={selectedEmployer.companyName}
                  />
                  <AvatarFallback 
                    className="text-lg font-bold"
                    companyName={selectedEmployer.companyName}
                  >
                    {getInitials(selectedEmployer.companyName)}
                  </AvatarFallback>
                </Avatar><div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedEmployer.companyName}
                  </h3>
                  <p className="text-sm text-gray-700 font-medium">
                    {selectedEmployer.email}
                  </p>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge
                      variant={
                        selectedEmployer.verified ? "success" : "warning"
                      }
                    >
                      {selectedEmployer.verified
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
                        : "Profile Not Verified"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              {/* Company Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Contact Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">{selectedEmployer.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">{selectedEmployer.phone || "Not provided"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">{selectedEmployer.location}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Account Statistics
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-blue-400 mr-2" />
                        <span className="text-gray-800 font-medium">
                          Average Rating:{" "}
                          {selectedEmployer.ratings.averageRating.toFixed(1)} (
                          {selectedEmployer.ratings.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">
                          Last Login:{" "}
                          {formatDateTime(
                            selectedEmployer.lastLoginAt ||
                              selectedEmployer.updatedAt
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Company Description
                    </h4>
                    <p className="mt-2 text-sm text-gray-800 font-medium">
                      {selectedEmployer.companyDescription ||
                        "No description provided"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      Account Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">
                          Created: {formatDateTime(selectedEmployer.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-gray-800 font-medium">
                          Updated: {formatDateTime(selectedEmployer.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div></div>
              <Separator className="my-4" />
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                {!selectedEmployer.verified ? (
                  <Button
                    onClick={() => {
                      handleVerifyEmployer(selectedEmployer._id);
                      setIsDialogOpen(false);
                    }}
                    disabled={verifyLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Employer
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSuspendEmployer(selectedEmployer._id);
                      setIsDialogOpen(false);
                    }}
                    disabled={suspendLoading}
                    className="bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Suspend Account
                  </Button>                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10b981",
            },
          },          error: {
            duration: 4000,            style: {
              background: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
}
