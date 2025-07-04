"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Eye,
  Phone,
  Mail,
  Star,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  Users,
  Trash2,
  DollarSign,
  MapPin,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
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
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { adminService } from '@/services/adminService';
import { GigRequest } from '@/services/gigRequestService';

type GigStatus = "draft" | "active" | "closed" | "completed" | "cancelled" | "filled" | "in_progress";

// TypeScript interfaces for filtering
interface GigFilters {
  page: number;
  limit: number;
  search?: string;
  status?: GigStatus;
  category?: string;
}

interface FilterState {
  search: string;
  status: GigStatus | "all";
  category: string;
  city: string;
  deadlineStart: string;
  deadlineEnd: string;
}

// Convert backend GigRequest to display format
interface Gig {
  id: string;
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'draft' | 'active' | 'closed' | 'completed' | 'cancelled' | 'filled' | 'in_progress';
  location: {
    address: string;
    city: string;
    postalCode?: string;
  };
  payRate: {
    amount: number;
    rateType: 'hourly' | 'fixed' | 'daily';
  };
  timeSlots: Array<{
    date: Date | string;
    startTime: Date | string;
    endTime: Date | string;
    peopleNeeded: number;
    peopleAssigned?: number;
  }>;
  totalPositions: number;
  filledPositions: number;
  isAcceptingApplications: boolean;
  applicationDeadline?: Date | string;
  requirements?: string[];
  skillsRequired?: string[];
  views?: number;
  applicationsCount?: number;
  createdAt: string;
  employer?: {
    name: string;
    email: string;
  };
}

const convertToGig = (gigRequest: GigRequest): Gig => {
  const totalPositions = gigRequest.timeSlots.reduce((sum, slot) => sum + slot.peopleNeeded, 0);
  const filledPositions = gigRequest.timeSlots.reduce((sum, slot) => sum + (slot.peopleAssigned || 0), 0);
  
  return {
    ...gigRequest,
    id: gigRequest._id,
    totalPositions,
    filledPositions,
    isAcceptingApplications: gigRequest.status === 'active',
    employer: typeof gigRequest.employer === 'object' 
      ? { name: gigRequest.employer.companyName, email: '' }
      : undefined,
  };
};

export default function GigContent() {
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gigToDelete, setGigToDelete] = useState<string | null>(null);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    category: "all",
    city: "all",
    deadlineStart: "",
    deadlineEnd: "",
  });

  const fetchGigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const gigFilters: GigFilters = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      // Only add filters if they're not the default "all" value
      if (filters.search) {
        gigFilters.search = filters.search;
      }
      
      if (filters.status !== 'all') {
        gigFilters.status = filters.status;
      }
      
      if (filters.category !== 'all') {
        gigFilters.category = filters.category;
      }

      const response = await adminService.getAllGigs(gigFilters);

      if (response.success && response.data) {
        // Handle different response formats
        let gigRequests: GigRequest[] = [];
        let total = 0;
        let pages = 1;
        
        // Check if response.data is the expected admin service format
        if (response.data.data && Array.isArray(response.data.data)) {
          // Standard admin API format: { data: { data: [...], total, pages } }
          gigRequests = response.data.data;
          total = response.data.total || 0;
          pages = response.data.pages || 1;
        } else if (Array.isArray(response.data)) {
          // Direct array format
          gigRequests = response.data;
          total = response.data.length;
          pages = 1;
        } else {
          console.error('Unexpected response format:', response.data);
          gigRequests = [];
        }
        
        const convertedGigs = gigRequests.map(convertToGig);
        setGigs(convertedGigs);
        setTotalRecords(total);
        setTotalPages(pages);
        
        // If current page is greater than total pages and there are pages
        if (currentPage > pages && pages > 0) {
          setCurrentPage(1);
        }
      } else {
        throw new Error('Failed to fetch gigs');
      }
    } catch (err) {
      console.error('Error fetching gigs:', err);
      setError((err as Error).message);
      toast.error('Failed to load gig data');
      setGigs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Fetch gigs from backend
  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);

  // Refresh function
  const refetch = async () => {
    await fetchGigs();
    toast.success("Data refreshed successfully");
  };

  // Extract unique values for filter dropdowns
  const availableCategories = useMemo(() => {
    const categories = new Set(gigs.map((gig) => gig.category));
    return ["all", ...Array.from(categories)];
  }, [gigs]);

  const availableCities = useMemo(() => {
    const cities = new Set(gigs.map((gig) => gig.location.city));
    return ["all", ...Array.from(cities)];
  }, [gigs]);

  const availableStatuses = [
    "all",
    "draft",
    "active", 
    "closed",
    "completed",
    "cancelled",
    "filled",
    "in_progress"
  ];

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        setFilters((prev) => ({ ...prev, search: value }));
      }, 300),
    []
  );

  // Filtered gigs
  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      // Status filter
      if (filters.status !== "all" && gig.status !== filters.status) return false;
      
      // Category filter
      if (filters.category !== "all" && gig.category !== filters.category) return false;
      
      // City filter
      if (filters.city !== "all" && gig.location.city !== filters.city) return false;

      // Deadline filters
      if (filters.deadlineStart && gig.applicationDeadline) {
        const gigDeadline = new Date(gig.applicationDeadline);
        const startDate = new Date(filters.deadlineStart);
        if (gigDeadline < startDate) return false;
      }

      if (filters.deadlineEnd && gig.applicationDeadline) {
        const gigDeadline = new Date(gig.applicationDeadline);
        const endDate = new Date(filters.deadlineEnd);
        if (gigDeadline > endDate) return false;
      }

      return true;
    });
  }, [gigs, filters]);

  // Handle actions
  const handleViewGig = (gig: Gig) => {
    setSelectedGig(gig);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (gigId: string) => {
    setGigToDelete(gigId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!gigToDelete) return;

    try {
      const response = await adminService.deleteGig(gigToDelete);
      if (response.success) {
        setGigs(prev => prev.filter(gig => gig.id !== gigToDelete));
        toast.success("Gig deleted successfully");
      } else {
        throw new Error("Failed to delete gig");
      }
    } catch (error) {
      console.error("Error deleting gig:", error);
      toast.error("Failed to delete gig");
    } finally {
      setDeleteDialogOpen(false);
      setGigToDelete(null);
    }
  };

  const handleStatusChange = async (gigId: string, newStatus: string) => {
    try {
      // Only allow valid status values that the backend accepts
      const validStatuses = ['draft', 'active', 'closed', 'completed', 'cancelled'];
      if (!validStatuses.includes(newStatus)) {
        toast.error("Invalid status value");
        return;
      }
      
      const response = await adminService.updateGigStatus(gigId, newStatus as 'draft' | 'active' | 'closed' | 'completed' | 'cancelled');
      if (response.success) {
        setGigs(prev => prev.map(gig => 
          gig.id === gigId ? { ...gig, status: newStatus as GigStatus } : gig
        ));
        toast.success("Gig status updated successfully");
      } else {
        throw new Error("Failed to update gig status");
      }
    } catch (error) {
      console.error("Error updating gig status:", error);
      toast.error("Failed to update gig status");
    }
  };

  // Export functionality
  const handleExportData = () => {
    const csvData = filteredGigs.map(gig => ({
      'Title': gig.title,
      'Category': gig.category,
      'Status': gig.status,
      'Employer': gig.employer?.name || 'N/A',
      'City': gig.location.city,
      'Total Positions': gig.totalPositions,
      'Filled Positions': gig.filledPositions,
      'Pay Rate': `${gig.payRate.amount} (${gig.payRate.rateType})`,
      'Application Deadline': gig.applicationDeadline ? formatDate(typeof gig.applicationDeadline === 'string' ? gig.applicationDeadline : gig.applicationDeadline.toISOString()) : 'N/A',
      'Created Date': formatDate(gig.createdAt),
      'Applications': gig.applicationsCount || 0,
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gigs_${new Date().toISOString().split('T')[0]}.csv`;
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

  // Pagination handling
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Render pagination controls
  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage <= 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              currentPage <= 1 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
              currentPage >= totalPages ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalRecords)}
              </span>{' '}
              of <span className="font-medium">{totalRecords}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage <= 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                  currentPage <= 1
                    ? 'text-gray-300'
                    : 'text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                  currentPage >= totalPages
                    ? 'text-gray-300'
                    : 'text-gray-500 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading gigs..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to Load Gigs"
        message={`There was an error loading gig data: ${error}`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Gigs Management</h1>
      
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
                placeholder="Search gigs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Status</label>
            <Select
              value={filters.status}
              onChange={(value: string) => updateFilter("status", value)}
              options={availableStatuses.map((status) => ({ 
                value: status, 
                label: status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Category</label>
            <Select
              value={filters.category}
              onChange={(value: string) => updateFilter("category", value)}
              options={availableCategories.map((category) => ({ 
                value: category, 
                label: category === "all" ? "All Categories" : category 
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">City</label>
            <Select
              value={filters.city}
              onChange={(value: string) => updateFilter("city", value)}
              options={availableCities.map((city) => ({ 
                value: city, 
                label: city === "all" ? "All Cities" : city 
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Deadline Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                value={filters.deadlineStart}
                onChange={(e) => updateFilter("deadlineStart", e.target.value)}
              />
              <input
                type="date"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                value={filters.deadlineEnd}
                onChange={(e) => updateFilter("deadlineEnd", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <p className="text-sm text-gray-800 font-medium">
          Showing {filteredGigs.length} of {gigs.length} gigs
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
            disabled={filteredGigs.length === 0}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Gigs List */}
      {filteredGigs.length === 0 ? (
        <EmptyState
          title="No Gigs Found"
          description="No gigs match your current filters. Try adjusting your search criteria."
          icon="briefcase"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="space-y-4 p-4">
            {filteredGigs.map((gig) => (
              <div key={gig.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {gig.title}
                      </h3>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={getStatusVariant(gig.status)}>
                          {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                        </Badge>
                        <Select
                          value={gig.status}
                          onChange={(value: string) => handleStatusChange(gig.id, value)}
                          options={[
                            { value: "draft", label: "Draft" },
                            { value: "active", label: "Active" },
                            { value: "closed", label: "Closed" },
                            { value: "completed", label: "Completed" },
                            { value: "cancelled", label: "Cancelled" },
                            { value: "filled", label: "Filled" },
                            { value: "in_progress", label: "In Progress" }
                          ]}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {gig.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{gig.category}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{gig.location.city}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Star className="h-4 w-4 mr-1" />
                        <span>{gig.payRate.amount} ({gig.payRate.rateType})</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{gig.filledPositions}/{gig.totalPositions} filled</span>
                      </div>
                    </div>
                    
                    {gig.applicationDeadline && (
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Deadline: {formatDate(typeof gig.applicationDeadline === 'string' ? gig.applicationDeadline : gig.applicationDeadline.toISOString())}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewGig(gig)}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(gig.id)}
                      className="flex items-center text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gig Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white ml-auto mr-4 mt-4 mb-4" style={{ marginLeft: '240px' }}>
          {selectedGig && (
            <>
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold text-gray-900">{selectedGig.title}</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Detailed information about this gig
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 bg-white">
                {/* Basic Info */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-3 text-gray-900">Overview</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">{selectedGig.description}</p>
                    <div className="flex items-center space-x-4 pt-2">
                      <Badge variant={getStatusVariant(selectedGig.status)}>
                        {selectedGig.status.charAt(0).toUpperCase() + selectedGig.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-600">{selectedGig.category}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pay and Positions */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-3 text-gray-900">Payment & Positions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pay Rate</p>
                        <p className="text-sm text-gray-600">
                          ${selectedGig.payRate.amount} per {selectedGig.payRate.rateType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-gray-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Positions</p>
                        <p className="text-sm text-gray-600">
                          {selectedGig.filledPositions} / {selectedGig.totalPositions} filled
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-3 text-gray-900">Location</h4>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">{selectedGig.location.address}</p>
                      <p className="text-sm text-gray-600">
                        {selectedGig.location.city}, {selectedGig.location.postalCode}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Time Slots */}
                {selectedGig.timeSlots && selectedGig.timeSlots.length > 0 && (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-medium mb-3 text-gray-900">Time Slots</h4>
                      <div className="space-y-2">
                        {selectedGig.timeSlots.map((slot, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-md border border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm font-medium text-gray-900">
                                  {formatDate(typeof slot.date === 'string' ? slot.date : slot.date.toISOString())}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm text-gray-600">
                                  {new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              People needed: {slot.peopleAssigned || 0} / {slot.peopleNeeded}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Requirements */}
                {selectedGig.requirements && selectedGig.requirements.length > 0 && (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-medium mb-3 text-gray-900">Requirements</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedGig.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-700">{req}</li>
                        ))}
                      </ul>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Skills Required */}
                {selectedGig.skillsRequired && selectedGig.skillsRequired.length > 0 && (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-medium mb-3 text-gray-900">Skills Required</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedGig.skillsRequired.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Stats */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-3 text-gray-900">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-md border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">{selectedGig.views || 0}</p>
                      <p className="text-sm text-gray-600">Views</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-md border border-gray-100">
                      <p className="text-2xl font-bold text-gray-900">{selectedGig.applicationsCount || 0}</p>
                      <p className="text-sm text-gray-600">Applications</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-6 bg-white border-t border-gray-200 pt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">Close</Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gig</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gig? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="outline"
              onClick={handleDeleteConfirm}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination Controls */}
      {renderPagination()}
    </div>
  );
}
