"use client";

import { useState, useMemo } from "react";
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
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi, useMutation } from "@/lib/hooks";
import { employersApi } from "@/lib/api";
import {
  formatDateTime,
  getInitials,
  getStatusVariant,
  debounce,
} from "@/lib/utils";

// Define types for our employer data (matching backend API response)
interface Employer {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  location: string;
  isVerified: boolean;
  verified: boolean;
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  lastLoginAt: string;
  profilePicture: string;
  companyDescription: string;
  createdAt: string;
  updatedAt: string;
}

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

  const employers = employersData || [];

  // Extract unique locations for filter dropdown
  const availableLocations = useMemo(() => {
    const locations = new Set(
      employers
        .map((employer) => employer.location)
        .filter((location) => location && location.trim() !== "")
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
        (employer) =>
          employer.companyName.toLowerCase().includes(query) ||
          employer.email.toLowerCase().includes(query)
      );
    }

    // Filter by location
    if (locationFilter && locationFilter !== "All Locations") {
      filtered = filtered.filter(
        (employer) => employer.location === locationFilter
      );
    }

    // Filter by verification status
    if (verificationFilter !== "All") {
      const isVerified = verificationFilter === "Verified";
      filtered = filtered.filter(
        (employer) => employer.verified === isVerified
      );
    }

    // Filter by rating range
    if (ratingFilter !== "all") {
      const [min, max] = ratingFilter.split("-").map(Number);
      filtered = filtered.filter(
        (employer) =>
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
    (value: string) => setSearchQuery(value),
    300
  );

  // Function to handle employer verification
  const handleVerifyEmployer = async (employerId: string) => {
    const result = await verifyEmployer(employersApi.verify, employerId);
    if (result) {
      refetch(); // Refresh the data
      if (selectedEmployer && selectedEmployer._id === employerId) {
        setSelectedEmployer({
          ...selectedEmployer,
          verified: true,
          isVerified: true,
        });
      }
    }
  };

  // Function to handle employer suspension
  const handleSuspendEmployer = async (employerId: string) => {
    const result = await suspendEmployer(employersApi.suspend, employerId);
    if (result) {
      refetch(); // Refresh the data
      if (selectedEmployer && selectedEmployer._id === employerId) {
        setSelectedEmployer({ ...selectedEmployer, verified: false });
      }
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
    return (
      <ErrorState
        title="Failed to load employers"
        message={error}
        onRetry={refetch}
      />
    );
  }

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
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {availableLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Status</label>
            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {verificationStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select Rating Range" />
              </SelectTrigger>
              <SelectContent>
                {ratingRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Employers Table */}
        <div className="overflow-x-auto">
          {filteredEmployers.length > 0 ? (
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
                {filteredEmployers.map((employer) => (
                  <tr key={employer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage
                            src={employer.profilePicture}
                            alt={employer.companyName}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {getInitials(employer.companyName)}
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
                      {employer.phone || "Not provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employer.location || "Not provided"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={employer.verified ? "success" : "warning"}
                      >
                        {employer.verified ? "Verified" : "Not Verified"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span>{employer.ratings.averageRating.toFixed(1)}</span>
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
                        {!employer.verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyEmployer(employer._id)}
                            disabled={verifyLoading}
                            className="bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        {employer.verified && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendEmployer(employer._id)}
                            disabled={suspendLoading}
                            className="bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                    {getInitials(selectedEmployer.companyName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedEmployer.companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
                        <span>{selectedEmployer.phone || "Not provided"}</span>
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
                          {selectedEmployer.ratings.averageRating.toFixed(1)} (
                          {selectedEmployer.ratings.totalReviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          Last Login:{" "}
                          {formatDateTime(
                            selectedEmployer.lastLoginAt ||
                              selectedEmployer.updatedAt
                          )}
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
                      {selectedEmployer.companyDescription ||
                        "No description provided"}
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
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
