"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Tag,
  Building,
  Eye,
  Trash2,
  RefreshCw,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useApi, useMutation } from "@/lib/hooks";
import { gigsApi, Gig, ApiError } from "@/lib/api/gigsApi";
import { formatDate, getStatusVariant, debounce } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

// TypeScript interfaces for filtering
interface FilterState {
  search: string;
  status: string;
  employer: string;
  city: string;
  category: string;
  deadlineStart: string;
  deadlineEnd: string;
}

// Constants for filter options
const GIG_STATUSES = ["draft", "open", "in_progress", "completed", "cancelled"];

const GIG_CATEGORIES = [
  "Event Staff",
  "Campus Tours",
  "Warehouse",
  "Food Service",
  "Administrative",
  "Marketing",
  "Customer Service",
  "Other",
];

export default function GigContent() {
  // API hooks for data fetching
  const {
    data: gigsResponse,
    loading: gigsLoading,
    error: gigsError,
    refetch,
  } = useApi(() => gigsApi.getAll());

  // Mutation hooks for API operations
  const { mutate: updateGig, loading: updateLoading } = useMutation();
  const { mutate: deleteGig, loading: deleteLoading } = useMutation();

  // State management
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "",
    employer: "",
    city: "",
    category: "",
    deadlineStart: "",
    deadlineEnd: "",
  });

  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [gigToDelete, setGigToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Extract gigs data - handle both direct array and wrapped response
  const gigs: Gig[] = useMemo(() => {
    if (!gigsResponse) return [];

    // If response has a data property, use it; otherwise assume direct array
    if ((gigsResponse as any).data) {
      return Array.isArray((gigsResponse as any).data)
        ? (gigsResponse as any).data
        : [];
    }

    // If response is directly an array
    if (Array.isArray(gigsResponse)) {
      return gigsResponse;
    }

    // Fallback to empty array
    return [];
  }, [gigsResponse]);
  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters((prev) => ({ ...prev, search: searchTerm }));
    }, 300),
    []
  );
  // Filter gigs based on current filters
  const filteredGigs = useMemo(() => {
    return gigs.filter((gig: Gig) => {
      const matchesSearch =
        !filters.search ||
        gig.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (gig.employer?.name &&
          gig.employer.name
            .toLowerCase()
            .includes(filters.search.toLowerCase())) ||
        gig.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || gig.status === filters.status;
      const matchesEmployer =
        !filters.employer || gig.employer?.name === filters.employer;
      const matchesCity = !filters.city || gig.city === filters.city;
      const matchesCategory =
        !filters.category || gig.category === filters.category;

      const matchesDeadlineStart =
        !filters.deadlineStart ||
        new Date(gig.applicationDeadline) >= new Date(filters.deadlineStart);
      const matchesDeadlineEnd =
        !filters.deadlineEnd ||
        new Date(gig.applicationDeadline) <= new Date(filters.deadlineEnd);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEmployer &&
        matchesCity &&
        matchesCategory &&
        matchesDeadlineStart &&
        matchesDeadlineEnd
      );
    });
  }, [gigs, filters]);
  // Extract unique values for filter dropdowns
  const uniqueEmployers = useMemo(
    () => [
      ...new Set(gigs.map((gig: Gig) => gig.employer?.name).filter(Boolean)),
    ],
    [gigs]
  );
  const uniqueCities = useMemo(
    () => [...new Set(gigs.map((gig: Gig) => gig.city).filter(Boolean))],
    [gigs]
  );

  // Event handlers
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      employer: "",
      city: "",
      category: "",
      deadlineStart: "",
      deadlineEnd: "",
    });
  }; // Handle status updates with proper error handling and toast feedback
  const handleStatusUpdate = async (gigId: string, newStatus: string) => {
    try {
      const loadingToast = toast.loading("Updating gig status...");

      await updateGig(
        (params: { id: string; status: string }) =>
          gigsApi.updateStatus(params.id, params.status),
        { id: gigId, status: newStatus }
      );

      toast.dismiss(loadingToast);
      toast.success(`Gig status updated to ${newStatus}`);

      // Refresh the data to show changes
      await refetch();
    } catch (error) {
      toast.error(
        `Failed to update gig status: ${
          error instanceof ApiError ? error.message : "Unknown error"
        }`
      );
    }
  }; // Handle gig deletion with proper error handling and user feedback
  const handleDeleteGig = async () => {
    if (!gigToDelete) return;

    try {
      const loadingToast = toast.loading("Deleting gig...");

      await deleteGig((params: string) => gigsApi.delete(params), gigToDelete);

      toast.dismiss(loadingToast);
      toast.success("Gig deleted successfully");

      // Close dialog and refresh data
      setShowDeleteDialog(false);
      setGigToDelete(null);
      await refetch();
    } catch (error) {
      toast.error(
        `Failed to delete gig: ${
          error instanceof ApiError ? error.message : "Unknown error"
        }`
      );
    }
  };

  const confirmDelete = (gigId: string) => {
    setGigToDelete(gigId);
    setShowDeleteDialog(true);
  };

  const handleApprove = async (gigId: string) => {
    await handleStatusUpdate(gigId, "open");
  };

  const handleReject = async (gigId: string) => {
    await handleStatusUpdate(gigId, "cancelled");
  }; // Format pay rate for display
  const formatPayRate = (payRate: Gig["payRate"]) => {
    if (!payRate) {
      return "Pay rate not specified";
    }

    if (payRate.type === "hourly" && payRate.min && payRate.max) {
      return `${payRate.currency}${payRate.min}-${payRate.max}/hr`;
    } else if (payRate.type === "fixed" && payRate.amount) {
      return `${payRate.currency}${payRate.amount} fixed`;
    } else if (payRate.type === "daily" && payRate.amount) {
      return `${payRate.currency}${payRate.amount}/day`;
    }
    return "Pay rate not specified";
  };
  // Loading state with consistent UI pattern
  if (gigsLoading) {
    return <LoadingState message="Loading gigs..." />;
  }
  // Error state with retry functionality
  if (gigsError) {
    return (
      <ErrorState
        title="Failed to load gigs"
        message={
          typeof gigsError === "string"
            ? gigsError
            : "An error occurred while loading gigs."
        }
        onRetry={async () => {
          try {
            toast.loading("Retrying...", { id: "retry" });
            await refetch();
            toast.success("Gigs loaded successfully", { id: "retry" });
          } catch (error) {
            toast.error("Failed to load gigs", { id: "retry" });
          }
        }}
      />
    );
  }

  // Empty state when no gigs are available
  if (!gigsLoading && gigs.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gig Management</h1>
            <p className="text-gray-600">
              Manage and monitor all gigs posted by employers
            </p>
          </div>
          <Button
            onClick={async () => {
              try {
                toast.loading("Refreshing gigs...", { id: "refresh" });
                await refetch();
                toast.success("Gigs refreshed successfully", { id: "refresh" });
              } catch (error) {
                toast.error("Failed to refresh gigs", { id: "refresh" });
              }
            }}
            className="flex items-center gap-2"
            disabled={gigsLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${gigsLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <EmptyState
          title="No gigs found"
          description="No gigs have been posted yet. They will appear here once employers start posting gigs."
          action={{
            label: "Refresh",
            onClick: refetch,
          }}
        />

        {/* Toast Notifications */}
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
            },
            error: {
              duration: 5000,
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gig Management</h1>
          <p className="text-gray-600">
            Manage and monitor all gigs posted by employers
          </p>
        </div>{" "}
        <Button
          onClick={async () => {
            try {
              toast.loading("Refreshing gigs...", { id: "refresh" });
              await refetch();
              toast.success("Gigs refreshed successfully", { id: "refresh" });
            } catch (error) {
              toast.error("Failed to refresh gigs", { id: "refresh" });
            }
          }}
          className="flex items-center gap-2"
          disabled={gigsLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${gigsLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gigs</p>
              <p className="text-2xl font-bold text-gray-900">{gigs.length}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Gigs</p>
              <p className="text-2xl font-bold text-green-900">
                {gigs.filter((g: Gig) => g.status === "open").length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">
                {gigs.filter((g: Gig) => g.status === "in_progress").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-900">
                {gigs.filter((g: Gig) => g.status === "completed").length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium">Filters</h3>
          <Button variant="outline" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              label=""
              placeholder="Search gigs..."
              className="pl-10"
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {GIG_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {GIG_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* City Filter */}
          <Select
            value={filters.city}
            onValueChange={(value) => handleFilterChange("city", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Employer Filter */}
          <Select
            value={filters.employer}
            onValueChange={(value) => handleFilterChange("employer", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Employers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Employers</SelectItem>
              {uniqueEmployers.map((employer) => (
                <SelectItem key={employer} value={employer}>
                  {employer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Deadline Start */}
          <Input
            label=""
            type="date"
            value={filters.deadlineStart}
            onChange={(e) =>
              handleFilterChange("deadlineStart", e.target.value)
            }
          />

          {/* Deadline End */}
          <Input
            label=""
            type="date"
            value={filters.deadlineEnd}
            onChange={(e) => handleFilterChange("deadlineEnd", e.target.value)}
          />
        </div>
      </div>

      {/* Gigs List */}
      <div className="bg-white rounded-lg border">
        {" "}
        {filteredGigs.length === 0 ? (
          <EmptyState
            title="No gigs found"
            description="No gigs match your current filters. Try adjusting the filters or clearing them."
            action={{
              label: "Clear Filters",
              onClick: clearFilters,
            }}
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredGigs.map((gig: Gig) => (
              <div
                key={gig.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {gig.title}
                      </h3>
                      <Badge variant={getStatusVariant(gig.status)}>
                        {gig.status.charAt(0).toUpperCase() +
                          gig.status.slice(1).replace("_", " ")}
                      </Badge>
                      {!gig.isAcceptingApplications && (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          Closed
                        </Badge>
                      )}
                    </div>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        {gig.employer?.name || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {gig.city}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Tag className="h-4 w-4" />
                        {gig.category}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        {formatPayRate(gig.payRate)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {gig.filledPositions}/{gig.totalPositions} filled
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        Deadline: {formatDate(gig.applicationDeadline)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {gig.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Created: {formatDate(gig.createdAt)}</span>
                      <span>•</span>
                      <span>Updated: {formatDate(gig.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* View Details */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedGig(gig)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                    </Sheet>{" "}
                    {/* Status Update */}
                    <Select
                      value={gig.status}
                      onValueChange={(value) =>
                        handleStatusUpdate(gig.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GIG_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1).replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Quick Actions for Draft Status */}
                    {gig.status === "draft" && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(gig.id)}
                          disabled={updateLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(gig.id)}
                          disabled={updateLoading}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {/* Delete */}
                    <Button
                      variant="outline"
                      onClick={() => confirmDelete(gig.id)}
                      disabled={deleteLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gig Details Sheet */}
      {selectedGig && (
        <Sheet>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{selectedGig.title}</SheetTitle>
              <SheetDescription>
                Detailed information about this gig
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      variant={getStatusVariant(selectedGig.status)}
                      className="ml-2"
                    >
                      {selectedGig.status.charAt(0).toUpperCase() +
                        selectedGig.status.slice(1).replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>
                    <span className="ml-2 font-medium">
                      {selectedGig.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pay Rate:</span>
                    <span className="ml-2 font-medium">
                      {formatPayRate(selectedGig.payRate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Positions:</span>
                    <span className="ml-2 font-medium">
                      {selectedGig.filledPositions}/{selectedGig.totalPositions}
                    </span>
                  </div>
                </div>
              </div>
              <Separator /> {/* Employer Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Employer</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">
                      {selectedGig.employer?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">
                      {selectedGig.employer?.email || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <Separator /> {/* Location */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Location</h4>
                <div className="space-y-2 text-sm">
                  <div>{selectedGig.location?.address || "N/A"}</div>
                  <div>
                    {selectedGig.location?.city || "N/A"},{" "}
                    {selectedGig.location?.postalCode || "N/A"}
                  </div>
                </div>
              </div>
              <Separator /> {/* Time Slots */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Time Slots</h4>
                <div className="space-y-3">
                  {selectedGig.timeSlots?.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-md text-sm"
                    >
                      <div className="font-medium">{formatDate(slot.date)}</div>
                      <div className="text-gray-600">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="text-gray-600">
                        {slot.peopleAssigned}/{slot.peopleNeeded} people
                        assigned
                      </div>
                    </div>
                  )) || (
                    <div className="text-sm text-gray-500">
                      No time slots available
                    </div>
                  )}
                </div>
              </div>
              <Separator />
              {/* Description */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-sm text-gray-600">
                  {selectedGig.description}
                </p>
              </div>
              {/* Requirements */}
              {(selectedGig.skills ||
                selectedGig.experience ||
                selectedGig.dressCode ||
                selectedGig.equipment) && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Requirements</h4>
                    <div className="space-y-3 text-sm">
                      {selectedGig.skills && (
                        <div>
                          <span className="text-gray-600">Skills:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedGig.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedGig.experience && (
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <span className="ml-2">{selectedGig.experience}</span>
                        </div>
                      )}
                      {selectedGig.dressCode && (
                        <div>
                          <span className="text-gray-600">Dress Code:</span>
                          <span className="ml-2">{selectedGig.dressCode}</span>
                        </div>
                      )}
                      {selectedGig.equipment && (
                        <div>
                          <span className="text-gray-600">Equipment:</span>
                          <span className="ml-2">{selectedGig.equipment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              <Separator /> {/* Applicants */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Applicants ({selectedGig.applicants?.length || 0})
                </h4>
                {selectedGig.applicants?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedGig.applicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className="bg-gray-50 p-3 rounded-md text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{applicant.name}</span>
                          <Badge variant={getStatusVariant(applicant.status)}>
                            {applicant.status}
                          </Badge>
                        </div>
                        <div className="text-gray-600 mt-1">
                          Applied: {formatDate(applicant.appliedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No applicants yet</p>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gig</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gig? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleDeleteGig}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>{" "}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
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
          },
          error: {
            duration: 5000,
            style: {
              background: "#ef4444",
            },
          },
        }}
      />
    </div>
  );
}
