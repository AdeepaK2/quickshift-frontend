"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  User as UserIcon,
  Calendar,
  MapPin,
  Phone,
  BookOpen,
  School,
  ClipboardCheck,
  Clock,
  UserCheck,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Select from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import {
  formatDate,
  getStatusVariant,
  debounce,
  formatStatusText,
} from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { UNDERGRADUATE_CONSTANTS } from "@/lib/undergraduate-constants";
import { adminService, AdminUserData } from '@/services/adminService';
import { adminUserManagementService, UserActionRequest } from '@/services/adminUserManagementService';

// TypeScript interfaces for Undergraduate data
interface Undergraduate {
  id: string;
  _id: string;
  profilePicture: string | null;
  fullName: string;
  email: string;
  university: string;
  yearOfStudy: number;
  studentIdVerified: boolean;
  phoneNumber: string;
  faculty: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  accountStatus: string;
  verificationStatus: string;
  lastLogin: string;
  bio: string;
  gpa: number;
  skillsAndInterests: string[];
  documentsUploaded: string[];
  joinDate: string;
  verified: boolean;
}

interface FilterState {
  search: string;
  university: string;
  yearOfStudy: number | null;
  verificationStatus: string | null;
  accountStatus: string | null;
}

// Function to convert AdminUserData to Undergraduate format
const convertToUndergraduate = (user: AdminUserData): Undergraduate => {
  console.log('Converting user data:', {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    university: user.university,
    yearOfStudy: user.yearOfStudy,
    isActive: user.isActive,
    isVerified: user.isVerified,
    fullUser: user
  });
  
  return {
    id: user._id || 'unknown',
    _id: user._id || 'unknown',
    profilePicture: null, // Not available in AdminUserData
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
    email: user.email || 'No email provided',
    university: user.university || 'Not specified',
    yearOfStudy: user.yearOfStudy || 1,
    studentIdVerified: user.studentIdVerified || false,
    phoneNumber: user.phone || 'Not provided',
    faculty: user.faculty || 'Not specified',
    gender: 'Not specified', // Not available in AdminUserData
    dateOfBirth: '', // Not available in AdminUserData
    address: '', // Not available in AdminUserData
    city: '', // Not available in AdminUserData
    postalCode: '', // Not available in AdminUserData
    accountStatus: user.isActive ? 'active' : 'inactive',
    verificationStatus: user.isVerified ? 'verified' : 'pending',
    lastLogin: user.lastLoginAt || user.updatedAt || user.createdAt,
    bio: '', // Not available in AdminUserData
    gpa: 0, // Not available in AdminUserData
    skillsAndInterests: [], // Not available in AdminUserData
    documentsUploaded: [], // Not available in AdminUserData
    joinDate: user.createdAt,
    verified: user.isVerified,
  };
};

// Constants for filter options - moved to constants file for better maintainability
const {
  YEARS_OF_STUDY,
  VERIFICATION_STATUSES,
  ACCOUNT_STATUSES,
  LABELS,
  // TABLE_HEADERS,
  ACTIONS,
  SHEET_SECTIONS,
  FIELD_LABELS,
} = UNDERGRADUATE_CONSTANTS;

export default function UndergraduatesContent() {
  const [selectedUndergraduate, setSelectedUndergraduate] =
    useState<Undergraduate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [undergraduates, setUndergraduates] = useState<Undergraduate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    userId: string;
    currentStatus: string;
    action: 'activate' | 'deactivate';
    userName: string;
  } | null>(null);
  
  // Debug logging
  useEffect(() => {
    console.log('UndergraduatesContent state:', {
      undergraduates: undergraduates.length,
      loading,
      error,
      totalRecords,
      currentPage,
      totalPages
    });
  }, [undergraduates, loading, error, totalRecords, currentPage, totalPages]);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    university: LABELS.ALL_UNIVERSITIES,
    yearOfStudy: null,
    verificationStatus: null,
    accountStatus: null,
  });

  const fetchUndergraduates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check authentication
      const accessToken = localStorage.getItem('accessToken');
      const userType = localStorage.getItem('userType');
      console.log('🔍 fetchUndergraduates - Auth check:', {
        hasAccessToken: !!accessToken,
        userType,
        tokenStart: accessToken?.substring(0, 20) + '...'
      });
      
      if (!accessToken) {
        throw new Error('No access token found. Please log in again.');
      }
      
      // Build query parameters
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        role: 'job_seeker', // Only get students
      };

      // Add search filter if provided
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      // Add account status filter if provided
      if (filters.accountStatus && filters.accountStatus !== 'all') {
        params.isActive = filters.accountStatus === 'active';
      }

      // Add verification status filter if provided
      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        params.isVerified = filters.verificationStatus === 'verified';
      }

      // Add university filter if provided
      if (filters.university && filters.university !== LABELS.ALL_UNIVERSITIES) {
        params.university = filters.university;
      }

      // Add year of study filter if provided
      if (filters.yearOfStudy !== null) {
        params.yearOfStudy = filters.yearOfStudy;
      }

      console.log('🔍 fetchUndergraduates - Making request with params:', params);
      
      const response = await adminService.getAllUsers(params);

      console.log('🔍 fetchUndergraduates - Response received:', {
        success: response.success,
        message: response.message,
        hasData: !!response.data,
        total: response.data?.total,
        count: response.data?.count,
        dataLength: response.data?.data?.length,
        fullResponse: response
      });

      if (response.success && response.data) {
        // Check if response.data is directly an array or has a nested structure
        let userData;
        if (Array.isArray(response.data)) {
          userData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          userData = response.data.data;
        } else if ((response.data as any).users && Array.isArray((response.data as any).users)) {
          userData = (response.data as any).users;
        } else {
          console.log('🔍 fetchUndergraduates - Unexpected response structure:', response.data);
          userData = [];
        }

        if (userData.length > 0) {
          const convertedUsers = userData.map(convertToUndergraduate);
          console.log('🔍 fetchUndergraduates - Converted users:', convertedUsers.length);
          setUndergraduates(convertedUsers);
          setTotalRecords(response.data.total || userData.length);
          setTotalPages(Math.ceil((response.data.total || userData.length) / itemsPerPage));
        } else {
          console.log('🔍 fetchUndergraduates - No data array found or empty array');
          setUndergraduates([]);
          setTotalRecords(0);
          setTotalPages(1);
        }
      } else {
        console.log('🔍 fetchUndergraduates - Response not successful');
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching undergraduates:', err);
      
      // Handle authentication errors specifically
      if (err instanceof Error && (
        err.message.includes('session has expired') ||
        err.message.includes('unauthorized') ||
        err.message.includes('401')
      )) {
        // Clear all auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/auth/login';
        return;
      }
      
      setError((err as Error).message);
      toast.error('Failed to load student data');
      setUndergraduates([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Fetch users from backend
  useEffect(() => {
    fetchUndergraduates();
  }, [fetchUndergraduates]);

  // Debug function to check raw API response
  const debugAPIResponse = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log('🔍 DEBUG - Raw API call');
      
      const response = await adminService.getAllUsers({
        page: 1,
        limit: 5,
        role: 'job_seeker'
      });
      
      console.log('🔍 DEBUG - Full API Response:', response);
      
      if (response.data && response.data.data) {
        console.log('🔍 DEBUG - Raw user data:', response.data.data);
        console.log('🔍 DEBUG - First user:', response.data.data[0]);
      }
      
      toast.success('Check console for debug info');
    } catch (error) {
      console.error('🔍 DEBUG - API Error:', error);
      toast.error('Debug failed - check console');
    }
  };

  // Refetch function for refresh button
  const refetch = async () => {
    await fetchUndergraduates();
    toast.success("Data refreshed successfully");
  };

  // Mock mutation states - will be used when handlers are implemented
  // const [setVerifyLoading] = useState(false);
  // const [setSuspendLoading] = useState(false);
  // const [setActivateLoading] = useState(false);

  // Extract unique universities for filter dropdown
  const availableUniversities = useMemo(() => {
    // For now, we'll use a static list of universities since we're doing server-side filtering
    // In a real application, you might want to fetch this from a separate API endpoint
    return [
      LABELS.ALL_UNIVERSITIES,
      "University of Malaysia",
      "Universiti Malaya",
      "Universiti Putra Malaysia",
      "Universiti Kebangsaan Malaysia",
      "Universiti Sains Malaysia",
      "Universiti Teknologi Malaysia",
      "Universiti Teknologi MARA",
      "International Islamic University Malaysia",
      "Universiti Malaysia Sabah",
      "Universiti Malaysia Sarawak",
      "Other"
    ];
  }, []);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        setFilters((prev) => ({ ...prev, search: value }));
        setCurrentPage(1); // Reset to first page when searching
      }, 300),
    []
  );

  // Handle viewing undergraduate details
  const handleViewUndergraduate = (undergraduate: Undergraduate) => {
    setSelectedUndergraduate(undergraduate);
    setIsSheetOpen(true);
  };

  // Handle activating/deactivating user
  const handleToggleUserStatus = async (userId: string, currentStatus: string, userName: string) => {
    const isCurrentlyActive = currentStatus === 'active';
    setPendingAction({
      userId,
      currentStatus,
      action: isCurrentlyActive ? 'deactivate' : 'activate',
      userName
    });
    setShowConfirmDialog(true);
  };

  // Confirm and execute the action
  const confirmAction = async () => {
    if (!pendingAction) return;

    try {
      setActionLoading(pendingAction.userId);
      setShowConfirmDialog(false);
      
      const isCurrentlyActive = pendingAction.currentStatus === 'active';
      const actionRequest: UserActionRequest = {
        userId: pendingAction.userId,
        reason: isCurrentlyActive ? 'Account deactivated by admin' : 'Account activated by admin',
        notifyUser: true
      };

      if (isCurrentlyActive) {
        await adminUserManagementService.deactivateUser(actionRequest);
        toast.success('User account deactivated successfully');
      } else {
        await adminUserManagementService.activateUser(actionRequest);
        toast.success('User account activated successfully');
      }

      // Refresh the data
      await fetchUndergraduates();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status. Please check the console for details.');
    } finally {
      setActionLoading(null);
      setPendingAction(null);
    }
  };

  // Cancel the action
  const cancelAction = () => {
    setShowConfirmDialog(false);
    setPendingAction(null);
  };

  // Export functionality
  const handleExportData = () => {
    if (!undergraduates || undergraduates.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const csvData = undergraduates.map(undergraduate => ({
      'Full Name': undergraduate.fullName,
      'Email': undergraduate.email,
      'University': undergraduate.university,
      'Faculty': undergraduate.faculty,
      'Year of Study': undergraduate.yearOfStudy,
      'Account Status': undergraduate.accountStatus,
      'Verification Status': undergraduate.verificationStatus,
      'Student ID Verified': undergraduate.studentIdVerified ? 'Yes' : 'No',
      'Phone Number': undergraduate.phoneNumber,
      'City': undergraduate.city,
      'Join Date': formatDate(undergraduate.joinDate),
      'Last Login': formatDate(undergraduate.lastLogin),
      'GPA': undergraduate.gpa || 'N/A',
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `undergraduates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  // Update search filter with debouncing
  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  // Update other filters
  const updateFilter = (key: keyof FilterState, value: string | number | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading undergraduate students..." />;
  }
  // Error state
  if (error) {
    console.error("UndergraduatesContent API Error:", error);
    return (
      <ErrorState
        title="Failed to Load Undergraduates"
        message={`There was an error loading the undergraduate students data: ${error}`}
        onRetry={refetch}
      />
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Undergraduates</h1>
      
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
                placeholder={LABELS.SEARCH_PLACEHOLDER}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">University</label>
            <Select
              value={filters.university}
              onChange={(value: string) => updateFilter("university", value)}
              options={availableUniversities.map((university) => ({ value: university, label: university }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Year of Study</label>
            <Select
              value={filters.yearOfStudy?.toString() || "all"}
              onChange={(value: string) => updateFilter("yearOfStudy", value === "all" ? null : parseInt(value))}
              options={[{ value: LABELS.ALL_YEARS, label: LABELS.ALL_YEARS }, ...YEARS_OF_STUDY.map((year) => ({ value: year.toString(), label: `Year ${year}` }))]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Verification Status</label>
            <Select
              value={filters.verificationStatus || "all"}
              onChange={(value: string) => updateFilter("verificationStatus", value === "all" ? null : value)}
              options={[
                { value: "all", label: LABELS.ALL_STATUSES },
                ...VERIFICATION_STATUSES.map((status) => ({ value: status, label: formatStatusText(status) }))
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">Account Status</label>
            <Select
              value={filters.accountStatus || "all"}
              onChange={(value: string) => updateFilter("accountStatus", value === "all" ? null : value)}
              options={[
                { value: "all", label: LABELS.ALL_STATUSES },
                ...ACCOUNT_STATUSES.map((status) => ({ value: status, label: formatStatusText(status) }))
              ]}
            />
          </div>
        </div>
      </div>{" "}
      {/* Results Summary and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">        <p className="text-sm text-gray-800 font-medium">
          {LABELS.SHOWING_RESULTS.replace(
            "{count}",
            (undergraduates?.length || 0).toString()
          ).replace("{total}", totalRecords.toString())}
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
            {ACTIONS.REFRESH}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={debugAPIResponse}
            className="flex items-center"
          >
            🔍 Debug
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={!undergraduates || undergraduates.length === 0}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {ACTIONS.EXPORT}
          </Button>
        </div>
      </div>{" "}
      {/* Users Table */}
      {!undergraduates || undergraduates.length === 0 ? (
        <EmptyState
          title={LABELS.NO_RESULTS_TITLE}
          description={LABELS.NO_RESULTS_DESCRIPTION}
          icon="users"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="space-y-4 p-4">
            {undergraduates.map((undergraduate: Undergraduate) => (
              <div key={undergraduate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={undergraduate.profilePicture || undefined} />
                      <AvatarFallback>
                        {undergraduate.fullName?.split(' ')[0]?.[0]}{undergraduate.fullName?.split(' ')[1]?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {undergraduate.fullName}
                      </h3>
                      <p className="text-xs text-gray-600">{undergraduate.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">{undergraduate.university}</span>
                        <span className="text-xs text-gray-500">Year {undergraduate.yearOfStudy}</span>
                        <span className="text-xs text-gray-500">{undergraduate.faculty}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={getStatusVariant(undergraduate.verificationStatus)}
                      className="text-xs"
                    >
                      {formatStatusText(undergraduate.verificationStatus)}
                    </Badge>
                    <Badge
                      variant={getStatusVariant(undergraduate.accountStatus)}
                      className="text-xs"
                    >
                      {formatStatusText(undergraduate.accountStatus)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUndergraduate(undergraduate)}
                        className="text-xs px-2 py-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant={undergraduate.accountStatus === 'active' ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleToggleUserStatus(undergraduate.id, undergraduate.accountStatus, undergraduate.fullName)}
                        disabled={actionLoading === undergraduate.id}
                        className={`text-xs px-2 py-1 ${
                          undergraduate.accountStatus === 'active' 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {actionLoading === undergraduate.id ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : undergraduate.accountStatus === 'active' ? (
                          'Deactivate'
                        ) : (
                          'Activate'
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          {`Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, totalRecords)}-${
            Math.min(currentPage * itemsPerPage, totalRecords)
          } of ${totalRecords} results`}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center"
          >
            <ChevronRight className="h-4 w-4 mr-1" />
            Next
          </Button>
        </div>
      </div>
      {/* User Details Modal */}
      {isSheetOpen && selectedUndergraduate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Undergraduate Details</h2>
                  <p className="text-gray-600">Comprehensive information about the selected undergraduate student</p>
                </div>
                <button
                  onClick={() => setIsSheetOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* User Profile Header */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedUndergraduate?.profilePicture || undefined}
                      alt={selectedUndergraduate.fullName}
                    />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                      {selectedUndergraduate.fullName
                        ? selectedUndergraduate.fullName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {" "}
                    <h3 className="text-xl font-semibold">
                      {selectedUndergraduate.fullName || "N/A"}
                    </h3>                    <p className="text-sm text-gray-900 font-medium">
                      {selectedUndergraduate.email || "N/A"}
                    </p>{" "}
                    <div className="mt-1 flex items-center space-x-2">
                      {" "}
                      <Badge
                        variant={getStatusVariant(
                          selectedUndergraduate.accountStatus
                        )}
                      >
                        {formatStatusText(selectedUndergraduate.accountStatus)}
                      </Badge>
                      <Badge
                        variant={getStatusVariant(
                          selectedUndergraduate.verificationStatus
                        )}
                      >
                        {formatStatusText(
                          selectedUndergraduate.verificationStatus
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator /> {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">
                    {SHEET_SECTIONS.PERSONAL_INFO}
                  </h4>

                  <div className="grid grid-cols-1 gap-3">                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />{" "}
                      <div>
                        {" "}
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.PHONE}
                        </p>
                        <p className="text-gray-900 font-medium">{selectedUndergraduate.phoneNumber || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        {" "}
                        <p className="text-sm font-medium text-gray-700">
                          Gender
                        </p>
                        <p className="text-gray-900 font-medium">{selectedUndergraduate.gender || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />{" "}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Date of Birth
                        </p>
                        <p className="text-gray-900 font-medium">
                          {selectedUndergraduate.dateOfBirth
                            ? formatDate(selectedUndergraduate.dateOfBirth)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Address
                        </p>{" "}
                        <p className="text-gray-900 font-medium">
                          {[
                            selectedUndergraduate.address,
                            selectedUndergraduate.city,
                            selectedUndergraduate.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator /> {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">
                    {SHEET_SECTIONS.ACADEMIC_INFO}
                  </h4>

                  <div className="grid grid-cols-1 gap-3">                    <div className="flex items-start">
                      <School className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />{" "}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.UNIVERSITY}
                        </p>
                        <p className="text-gray-900 font-medium">{selectedUndergraduate.university || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />{" "}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.FACULTY}
                        </p>
                        <p className="text-gray-900 font-medium">{selectedUndergraduate.faculty || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.YEAR_OF_STUDY}
                        </p>
                        <p className="text-gray-900 font-medium">Year {selectedUndergraduate.yearOfStudy}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.STUDENT_ID_VERIFICATION}
                        </p>
                        <Badge
                          variant={
                            selectedUndergraduate.studentIdVerified
                              ? "success"
                              : "warning"
                          }
                        >
                          {selectedUndergraduate.studentIdVerified
                            ? "Verified"
                            : "Not Verified"}
                        </Badge>
                      </div>
                    </div>

                    {selectedUndergraduate.gpa && (                      <div className="flex items-start">
                        <ClipboardCheck className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {FIELD_LABELS.GPA}
                          </p>
                          <p className="text-gray-900 font-medium">{selectedUndergraduate.gpa}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator /> {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">
                    {SHEET_SECTIONS.ACCOUNT_INFO}
                  </h4>

                  <div className="grid grid-cols-1 gap-3">                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.JOIN_DATE}
                        </p>
                        <p className="text-gray-900 font-medium">
                          {selectedUndergraduate.joinDate
                            ? formatDate(selectedUndergraduate.joinDate)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.LAST_LOGIN}
                        </p>
                        <p className="text-gray-900 font-medium">
                          {selectedUndergraduate.lastLogin
                            ? formatDate(selectedUndergraduate.lastLogin)
                            : "N/A"}
                        </p>
                      </div>
                    </div>                    <div className="flex items-start">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {FIELD_LABELS.VERIFICATION_STATUS}
                        </p>{" "}
                        <Badge
                          variant={getStatusVariant(
                            selectedUndergraduate.verificationStatus
                          )}
                        >
                          {formatStatusText(
                            selectedUndergraduate.verificationStatus
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator /> {/* Bio */}                {selectedUndergraduate.bio && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium">
                      {SHEET_SECTIONS.BIO}
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {selectedUndergraduate.bio}
                    </p>
                  </div>
                )}
                {/* Skills and Interests */}
                {selectedUndergraduate.skillsAndInterests &&
                  selectedUndergraduate.skillsAndInterests.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="text-lg font-medium">
                          {SHEET_SECTIONS.SKILLS_INTERESTS}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedUndergraduate.skillsAndInterests.map(
                            (skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm {pendingAction.action === 'activate' ? 'Activation' : 'Deactivation'}
              </h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to {pendingAction.action} the account for{' '}
                <span className="font-semibold">{pendingAction.userName}</span>?
              </p>
              
              {pendingAction.action === 'deactivate' && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <p className="text-sm text-orange-800">
                    <strong>Warning:</strong> Deactivating this account will prevent the user from logging in 
                    and accessing their profile until reactivated.
                  </p>
                </div>
              )}
              
              {pendingAction.action === 'activate' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    This will restore the user's access to their account and allow them to log in normally.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={cancelAction}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant={pendingAction.action === 'activate' ? 'primary' : 'secondary'}
                onClick={confirmAction}
                className={`px-4 py-2 ${
                  pendingAction.action === 'activate' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {pendingAction.action === 'activate' ? 'Activate Account' : 'Deactivate Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
