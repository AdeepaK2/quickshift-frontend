"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Eye,
  Phone,
  Mail,
  Star,
  Shield,
  Calendar,
  MapPin,
  RefreshCw,
  Download,
  Filter,
} from "lucide-react";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import { formatDate, getInitials, debounce } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading";
import { AdminEmployerData } from '@/services/adminService';
import { adminEmployerManagementService } from '@/services/adminEmployerManagementService';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// Define types for filtering
interface FilterState {
  search: string;
  location: string;
  verified: string;
  rating: string;
}

export default function EmployerContent() {
  const [selectedEmployer, setSelectedEmployer] = useState<AdminEmployerData | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [employers, setEmployers] = useState<AdminEmployerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    location: "all",
    verified: "all",
    rating: "all",
  });

  const fetchEmployers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare filter parameters
      const params: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        isVerified?: boolean;
        city?: string;
        minRating?: number;
        maxRating?: number;
      } = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Only add search if it's not empty
      if (filters.search) {
        params.search = filters.search;
      }
      
      // Only add isVerified filter if "verified" is not "all"
      if (filters.verified === 'verified') {
        params.isVerified = true;
      } else if (filters.verified === 'unverified') {
        params.isVerified = false;
      }

      // Add location filter if it's not "all"
      if (filters.location !== 'all') {
        params.city = filters.location;
      }

      // Add rating filter if it's not "all"
      if (filters.rating !== 'all') {
        // Convert rating text to number range
        if (filters.rating === 'top_rated') {
          params.minRating = 4.5;
        } else if (filters.rating === 'good') {
          params.minRating = 4.0;
          params.maxRating = 4.49;
        } else if (filters.rating === 'average') {
          params.minRating = 3.0;
          params.maxRating = 3.99;
        } else if (filters.rating === 'low') {
          params.maxRating = 2.99;
        }
      }

      const response = await adminEmployerManagementService.getAllEmployers(params);

      if (response.success && response.data) {
        setEmployers(response.data.data);
        const totalPages = Math.ceil(response.data.total / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(1);
        }
      } else {
        throw new Error('Failed to fetch employers data');
      }
    } catch (err) {
      console.error('Error fetching employers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load employer data');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Fetch employers from backend
  useEffect(() => {
    fetchEmployers();
  }, [fetchEmployers]);

  // Refresh function
  const refetch = async () => {
    await fetchEmployers();
    toast.success("Data refreshed successfully");
  };

  // Extract unique locations for filter dropdown
  const availableLocations = useMemo(() => {
    const locations = new Set(
      employers
        .map((employer) => employer.location)
        .filter((location): location is string => Boolean(location))
    );
    return ["all", ...Array.from(locations)];
  }, [employers]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        setFilters((prev) => ({ ...prev, search: value }));
      }, 300),
    []
  );

  // Filtered employers with memoization for performance
  const filteredEmployers = useMemo(() => {
    return employers.filter((employer) => {
      // Location filter
      if (filters.location !== "all" && employer.location !== filters.location) {
        return false;
      }

      // Verified filter
      if (filters.verified !== "all") {
        const isVerified = filters.verified === "verified";
        if (employer.isVerified !== isVerified) return false;
      }

      // Rating filter
      if (filters.rating !== "all") {
        const avgRating = employer.ratings?.averageRating || 0;
        if (filters.rating === "high" && avgRating < 4) return false;
        if (filters.rating === "medium" && (avgRating < 3 || avgRating >= 4)) return false;
        if (filters.rating === "low" && avgRating >= 3) return false;
      }

      return true;
    });
  }, [employers, filters]);

  // Handle viewing employer details
  const handleViewEmployer = (employer: AdminEmployerData) => {
    setSelectedEmployer(employer);
    setIsSheetOpen(true);
  };

  // Export functionality
  const handleExportData = () => {
    const csvData = filteredEmployers.map(employer => ({
      'Company Name': employer.companyName,
      'Email': employer.email,
      'Phone': employer.phone || 'N/A',
      'Location': employer.location || 'N/A',
      'Verified': employer.isVerified ? 'Yes' : 'No',
      'Active': employer.isActive ? 'Yes' : 'No',
      'Average Rating': employer.ratings?.averageRating?.toFixed(1) || 'N/A',
      'Total Reviews': employer.ratings?.totalReviews || 0,
      'Join Date': formatDate(employer.createdAt),
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  // Update search filter with debouncing
  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  // Update other filters
  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading employers..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to Load Employers"
        message={`There was an error loading employer data: ${error}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Employers</h1>
      
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Filter className="mr-2 h-5 w-5 text-gray-700" />
            Filters
          </h2>
          <div className="w-full lg:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 z-10" />
              <input
                type="text"
                placeholder="Search employers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Location</label>
            <Select
              value={filters.location}
              onChange={(value: string) => updateFilter("location", value)}
              options={availableLocations.map((location) => ({ 
                value: location, 
                label: location === "all" ? "All Locations" : location 
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Verification Status</label>
            <Select
              value={filters.verified}
              onChange={(value: string) => updateFilter("verified", value)}
              options={[
                { value: "all", label: "All" },
                { value: "verified", label: "Verified" },
                { value: "not_verified", label: "Not Verified" }
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Rating</label>
            <Select
              value={filters.rating}
              onChange={(value: string) => updateFilter("rating", value)}
              options={[
                { value: "all", label: "All Ratings" },
                { value: "top_rated", label: "4.5+ Stars" },
                { value: "good", label: "4.0 - 4.49 Stars" },
                { value: "average", label: "3.0 - 3.99 Stars" },
                { value: "low", label: "Below 3 Stars" }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Results Summary and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-gray-800 font-medium">
          Showing {filteredEmployers.length} of {employers.length} employers
        </p>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={filteredEmployers.length === 0}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Employers Table */}
      {filteredEmployers.length === 0 ? (
        <EmptyState
          title="No Employers Found"
          description="No employers match your current filters. Try adjusting your search criteria."
          icon="building"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="space-y-4 p-4">
            {filteredEmployers.map((employer) => (
              <div key={employer._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={""} />
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {getInitials(employer.companyName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {employer.companyName}
                      </h3>
                      <p className="text-xs text-gray-600">{employer.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {employer.location && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {employer.location}
                          </span>
                        )}
                        {employer.ratings && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                            {employer.ratings.averageRating.toFixed(1)} ({employer.ratings.totalReviews})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={employer.isVerified ? "success" : "warning"}
                      className="text-xs"
                    >
                      {employer.isVerified ? "Verified" : "Not Verified"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEmployer(employer)}
                      className="text-xs px-2 py-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employer Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedEmployer && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>Employer Details</SheetTitle>
                <SheetDescription>
                  Comprehensive information about {selectedEmployer.companyName}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Company Profile Header */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={""} />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                      {getInitials(selectedEmployer.companyName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedEmployer.companyName}
                    </h3>
                    <p className="text-sm text-gray-900 font-medium">
                      {selectedEmployer.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge variant={selectedEmployer.isVerified ? "success" : "warning"}>
                        {selectedEmployer.isVerified ? "Verified" : "Not Verified"}
                      </Badge>
                      <Badge variant={selectedEmployer.isActive ? "success" : "destructive"}>
                        {selectedEmployer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Contact Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-gray-900 font-medium">{selectedEmployer.email}</p>
                      </div>
                    </div>
                    {selectedEmployer.phone && (
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Phone</p>
                          <p className="text-gray-900 font-medium">{selectedEmployer.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedEmployer.location && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Location</p>
                          <p className="text-gray-900 font-medium">{selectedEmployer.location}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Company Description */}
                {selectedEmployer.companyDescription && (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-lg font-medium">About Company</h4>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {selectedEmployer.companyDescription}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Ratings */}
                {selectedEmployer.ratings && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Ratings & Reviews</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start">
                          <Star className="h-5 w-5 mr-2 text-yellow-400 mt-0.5 fill-current" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Average Rating</p>
                            <p className="text-gray-900 font-medium">
                              {selectedEmployer.ratings.averageRating.toFixed(1)} / 5.0
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Reviews</p>
                            <p className="text-gray-900 font-medium">{selectedEmployer.ratings.totalReviews}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Account Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Join Date</p>
                        <p className="text-gray-900 font-medium">{formatDate(selectedEmployer.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Verification Status</p>
                        <Badge variant={selectedEmployer.isVerified ? "success" : "warning"}>
                          {selectedEmployer.isVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
