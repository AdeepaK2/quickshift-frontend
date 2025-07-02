"use client";

import { useState, useMemo, useCallback } from "react";
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
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
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
import { formatDate, getStatusVariant, debounce } from "@/lib/utils";
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

// Gig interface for mock data
interface Gig {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  city: string;
  payRate: {
    type: 'hourly' | 'fixed' | 'daily';
    amount?: number;
    min?: number;
    max?: number;
    currency: string;
  };
  totalPositions: number;
  filledPositions: number;
  applicationDeadline: string;
  createdAt: string;
  updatedAt: string;
  isAcceptingApplications: boolean;
  employer?: {
    name: string;
    email: string;
  };
  location?: {
    address: string;
    city: string;
    postalCode: string;
  };
  timeSlots?: Array<{
    date: string;
    startTime: string;
    endTime: string;
    peopleNeeded: number;
    peopleAssigned: number;
  }>;
  skills?: string[];
  experience?: string;
  dressCode?: string;
  equipment?: string;
  applicants?: Array<{
    id: string;
    name: string;
    status: string;
    appliedAt: string;
  }>;
}

// Mock data
const mockGigs: Gig[] = [
  {
    id: "1",
    title: "Event Setup Staff Needed",
    description: "Help set up tables, chairs, and decorations for a corporate event. Must be able to lift 25lbs and work in a team environment.",
    status: "open",
    category: "Event Staff",
    city: "Toronto",
    payRate: {
      type: "hourly",
      min: 18,
      max: 22,
      currency: "$"
    },
    totalPositions: 8,
    filledPositions: 3,
    applicationDeadline: "2025-07-15T23:59:59Z",
    createdAt: "2025-06-15T10:00:00Z",
    updatedAt: "2025-06-20T14:30:00Z",
    isAcceptingApplications: true,
    employer: {
      name: "EventPro Solutions",
      email: "contact@eventpro.com"
    },
    location: {
      address: "123 Convention Center Drive",
      city: "Toronto",
      postalCode: "M5V 3A8"
    },
    timeSlots: [
      {
        date: "2025-07-20T00:00:00Z",
        startTime: "08:00",
        endTime: "16:00",
        peopleNeeded: 4,
        peopleAssigned: 2
      },
      {
        date: "2025-07-21T00:00:00Z",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 4,
        peopleAssigned: 1
      }
    ],
    skills: ["Physical fitness", "Team work", "Attention to detail"],
    experience: "No prior experience required",
    dressCode: "Black pants, comfortable shoes",
    equipment: "Company will provide all tools",
    applicants: [
      {
        id: "a1",
        name: "John Smith",
        status: "accepted",
        appliedAt: "2025-06-16T09:00:00Z"
      },
      {
        id: "a2",
        name: "Sarah Johnson",
        status: "pending",
        appliedAt: "2025-06-17T14:30:00Z"
      }
    ]
  },
  {
    id: "2",
    title: "Campus Tour Guide",
    description: "Lead prospective students and their families on informative campus tours. Must be knowledgeable about university programs and facilities.",
    status: "draft",
    category: "Campus Tours",
    city: "Vancouver",
    payRate: {
      type: "fixed",
      amount: 150,
      currency: "$"
    },
    totalPositions: 3,
    filledPositions: 0,
    applicationDeadline: "2025-07-10T23:59:59Z",
    createdAt: "2025-06-18T11:00:00Z",
    updatedAt: "2025-06-22T09:15:00Z",
    isAcceptingApplications: false,
    employer: {
      name: "University of British Columbia",
      email: "tours@ubc.ca"
    },
    location: {
      address: "2329 West Mall",
      city: "Vancouver",
      postalCode: "V6T 1Z4"
    },
    timeSlots: [
      {
        date: "2025-07-25T00:00:00Z",
        startTime: "10:00",
        endTime: "15:00",
        peopleNeeded: 3,
        peopleAssigned: 0
      }
    ],
    skills: ["Public speaking", "University knowledge", "Customer service"],
    experience: "Current student preferred",
    dressCode: "Business casual",
    equipment: "Campus map and information packet provided",
    applicants: []
  },
  {
    id: "3",
    title: "Warehouse Package Handler",
    description: "Sort, scan, and load packages in a fast-paced warehouse environment. Must be able to work efficiently and accurately.",
    status: "in_progress",
    category: "Warehouse",
    city: "Calgary",
    payRate: {
      type: "hourly",
      min: 16,
      max: 19,
      currency: "$"
    },
    totalPositions: 12,
    filledPositions: 8,
    applicationDeadline: "2025-06-30T23:59:59Z",
    createdAt: "2025-06-10T08:00:00Z",
    updatedAt: "2025-06-21T16:45:00Z",
    isAcceptingApplications: true,
    employer: {
      name: "FastShip Logistics",
      email: "hr@fastship.ca"
    },
    location: {
      address: "4567 Industrial Blvd",
      city: "Calgary",
      postalCode: "T2E 7Y6"
    },
    timeSlots: [
      {
        date: "2025-07-01T00:00:00Z",
        startTime: "06:00",
        endTime: "14:00",
        peopleNeeded: 6,
        peopleAssigned: 4
      },
      {
        date: "2025-07-01T00:00:00Z",
        startTime: "14:00",
        endTime: "22:00",
        peopleNeeded: 6,
        peopleAssigned: 4
      }
    ],
    skills: ["Physical stamina", "Attention to detail", "Time management"],
    experience: "1+ years warehouse experience preferred",
    dressCode: "Steel-toed boots, safety vest provided",
    equipment: "Scanner and safety equipment provided",
    applicants: [
      {
        id: "a3",
        name: "Mike Wilson",
        status: "accepted",
        appliedAt: "2025-06-11T10:30:00Z"
      },
      {
        id: "a4",
        name: "Lisa Chen",
        status: "accepted",
        appliedAt: "2025-06-12T13:15:00Z"
      },
      {
        id: "a5",
        name: "David Brown",
        status: "pending",
        appliedAt: "2025-06-20T11:00:00Z"
      }
    ]
  },
  {
    id: "4",
    title: "Food Service Assistant",
    description: "Assist with food preparation, serving, and cleanup at a busy restaurant. Food handling certification required.",
    status: "completed",
    category: "Food Service",
    city: "Montreal",
    payRate: {
      type: "hourly",
      min: 15,
      max: 17,
      currency: "$"
    },
    totalPositions: 5,
    filledPositions: 5,
    applicationDeadline: "2025-06-01T23:59:59Z",
    createdAt: "2025-05-20T12:00:00Z",
    updatedAt: "2025-06-15T18:20:00Z",
    isAcceptingApplications: false,
    employer: {
      name: "Bistro Montreal",
      email: "jobs@bistromontreal.com"
    },
    location: {
      address: "789 Rue Sainte-Catherine",
      city: "Montreal",
      postalCode: "H3B 1Y5"
    },
    timeSlots: [
      {
        date: "2025-06-10T00:00:00Z",
        startTime: "11:00",
        endTime: "19:00",
        peopleNeeded: 5,
        peopleAssigned: 5
      }
    ],
    skills: ["Food handling", "Customer service", "Multitasking"],
    experience: "Food handling certification required",
    dressCode: "Black pants, non-slip shoes, uniform provided",
    equipment: "All kitchen equipment provided",
    applicants: [
      {
        id: "a6",
        name: "Emma Dubois",
        status: "completed",
        appliedAt: "2025-05-21T09:00:00Z"
      },
      {
        id: "a7",
        name: "Pierre Laval",
        status: "completed",
        appliedAt: "2025-05-22T14:30:00Z"
      }
    ]
  },
  {
    id: "5",
    title: "Administrative Support",
    description: "Provide administrative support including data entry, filing, and phone support. Must have excellent organizational skills.",
    status: "cancelled",
    category: "Administrative",
    city: "Ottawa",
    payRate: {
      type: "daily",
      amount: 120,
      currency: "$"
    },
    totalPositions: 2,
    filledPositions: 0,
    applicationDeadline: "2025-06-25T23:59:59Z",
    createdAt: "2025-06-12T14:00:00Z",
    updatedAt: "2025-06-19T10:30:00Z",
    isAcceptingApplications: false,
    employer: {
      name: "Capital Office Solutions",
      email: "admin@capitaloffice.ca"
    },
    location: {
      address: "456 Sparks Street",
      city: "Ottawa",
      postalCode: "K1P 5E2"
    },
    timeSlots: [],
    skills: ["Microsoft Office", "Data entry", "Phone etiquette"],
    experience: "2+ years office experience",
    dressCode: "Business professional",
    equipment: "Computer and phone provided",
    applicants: []
  }
];

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
  // State management for mock data
  const [gigs, setGigs] = useState<Gig[]>(mockGigs);
  const [loading, setLoading] = useState(false);

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(    debounce((searchTerm: unknown) => {
      setFilters((prev) => ({ ...prev, search: searchTerm as string }));
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
  }, [gigs, filters]);  // Extract unique values for filter dropdowns
  const uniqueEmployers = useMemo(
    () => [
      ...new Set(gigs.map((gig: Gig) => gig.employer?.name).filter((name): name is string => Boolean(name))),
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
  };  // Handle status updates with mock data
  const handleStatusUpdate = async (gigId: string, newStatus: string) => {
    try {
      setLoading(true);
      const loadingToast = toast.loading("Updating gig status...");

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the gig status in mock data
      setGigs(prevGigs => 
        prevGigs.map(gig => 
          gig.id === gigId 
            ? { ...gig, status: newStatus, updatedAt: new Date().toISOString() }
            : gig
        )
      );

      toast.dismiss(loadingToast);
      toast.success(`Gig status updated to ${newStatus}`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        `Failed to update gig status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Handle gig deletion with mock data
  const handleDeleteGig = async () => {
    if (!gigToDelete) return;

    try {
      setLoading(true);
      const loadingToast = toast.loading("Deleting gig...");

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Remove the gig from mock data
      setGigs(prevGigs => prevGigs.filter(gig => gig.id !== gigToDelete));

      toast.dismiss(loadingToast);
      toast.success("Gig deleted successfully");

      // Close dialog and reset state
      setShowDeleteDialog(false);
      setGigToDelete(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        `Failed to delete gig: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // Mock refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      toast.loading("Refreshing gigs...", { id: "refresh" });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset to original mock data
      setGigs(mockGigs);
      
      toast.success("Gigs refreshed successfully", { id: "refresh" });
      setLoading(false);
    } catch {
      setLoading(false);
      toast.error("Failed to refresh gigs", { id: "refresh" });
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
  };  // Format pay rate for display
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading gigs...</span>
        </div>
      </div>
    );
  }

  // Empty state when no gigs are available  
  if (!loading && gigs.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gig Management</h1>
            <p className="text-gray-600">
              Manage and monitor all gigs posted by employers
            </p>
          </div>          <Button
            onClick={handleRefresh}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <EmptyState
          title="No gigs found"
          description="No gigs have been posted yet. They will appear here once employers start posting gigs."            action={{
              label: "Refresh",
              onClick: handleRefresh,
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
          </p>        </div>{" "}
        <Button
          onClick={handleRefresh}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Gigs</p>
              <p className="text-2xl font-bold text-gray-900">{gigs.length}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
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

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-900">
                {gigs.filter((g: Gig) => g.status === "in_progress").length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
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
            onChange={(value: string) => handleFilterChange("status", value)}
            options={[
              { value: "", label: "All Statuses" },
              ...GIG_STATUSES.map((status) => ({
                value: status,
                label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
              })),
            ]}
          />
          {/* Category Filter */}
          <Select
            value={filters.category}
            onChange={(value: string) => handleFilterChange("category", value)}
            options={[
              { value: "", label: "All Categories" },
              ...GIG_CATEGORIES.map((category) => ({ value: category, label: category })),
            ]}
          />
          {/* City Filter */}
          <Select
            value={filters.city}
            onChange={(value: string) => handleFilterChange("city", value)}
            options={[
              { value: "", label: "All Cities" },
              ...uniqueCities.map((city) => ({ value: city, label: city })),
            ]}
          />
          {/* Employer Filter */}
          <Select
            value={filters.employer}
            onChange={(value: string) => handleFilterChange("employer", value)}
            options={[
              { value: "", label: "All Employers" },
              ...uniqueEmployers.map((employer) => ({ value: employer, label: employer })),
            ]}
          />
          {/* Deadline Start */}
          <Input
            label=""
            type="date"
            value={filters.deadlineStart}
            onChange={(e) => handleFilterChange("deadlineStart", e.target.value)}
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
      <div className="bg-white rounded-lg border border-gray-200">
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
                      onChange={(value: string) => handleStatusUpdate(gig.id, value)}
                      options={GIG_STATUSES.map((status) => ({ value: status, label: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ") }))}
                      className="w-32"
                    />
                    {/* Quick Actions for Draft Status */}
                    {gig.status === "draft" && (
                      <>                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(gig.id)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(gig.id)}
                          disabled={loading}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {/* Delete */}                    <Button
                      variant="outline"
                      onClick={() => confirmDelete(gig.id)}
                      disabled={loading}
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
                </h4>                {(selectedGig.applicants && selectedGig.applicants.length > 0) ? (
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
            </DialogClose>            <Button
              variant="primary"
              onClick={handleDeleteGig}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
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
