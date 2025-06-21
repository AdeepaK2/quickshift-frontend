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
  Shield,
  ShieldCheck,
} from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
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

import { useApi, useMutation } from "@/lib/hooks";
import { undergraduatesApi, type Undergraduate } from "@/lib/api";
import {
  formatDate,
  getStatusVariant,
  debounce,
  formatStatusText,
  getInitials,
} from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { UNDERGRADUATE_CONSTANTS } from "@/lib/undergraduate-constants";

// LoadingState component for consistency
const LoadingState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-gray-600">{message}</p>
  </div>
);

// Helper function to get full name
const getFullName = (undergraduate: Undergraduate): string => {
  if (undergraduate.fullName) return undergraduate.fullName;
  if (undergraduate.firstName && undergraduate.lastName) {
    return `${undergraduate.firstName} ${undergraduate.lastName}`;
  }
  return undergraduate.firstName || undergraduate.email || "Unknown User";
};

// Helper function to get computed account status
const getAccountStatus = (undergraduate: Undergraduate): string => {
  if (undergraduate.accountStatus) return undergraduate.accountStatus;
  return undergraduate.isActive ? "active" : "inactive";
};

// Helper function to get computed verification status
const getVerificationStatus = (undergraduate: Undergraduate): string => {
  if (undergraduate.verificationStatus) return undergraduate.verificationStatus;
  return undergraduate.isVerified ? "verified" : "pending";
};

interface FilterState {
  search: string;
  university: string;
  yearOfStudy: number | null;
  verificationStatus: string | null;
  accountStatus: string | null;
}

// Constants for filter options - moved to constants file for better maintainability
const {
  YEARS_OF_STUDY,
  VERIFICATION_STATUSES,
  ACCOUNT_STATUSES,
  LABELS,
  TABLE_HEADERS,
  ACTIONS,
  SHEET_SECTIONS,
  FIELD_LABELS,
} = UNDERGRADUATE_CONSTANTS;

export default function UndergraduatesContent() {
  const [selectedUndergraduate, setSelectedUndergraduate] =
    useState<Undergraduate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    university: LABELS.ALL_UNIVERSITIES,
    yearOfStudy: null,
    verificationStatus: null,
    accountStatus: null,
  }); // API calls with explicit function
  const fetchUndergraduates = useCallback(() => {
    console.log("Fetching undergraduates...");
    return undergraduatesApi.getAll();
  }, []);

  const {
    data: undergraduatesResponse,
    loading,
    error,
    refetch,
  } = useApi(fetchUndergraduates);
  const verifyUndergraduateMutation = useMutation();
  const suspendUndergraduateMutation = useMutation();
  const activateUndergraduateMutation = useMutation();

  // Debug logging
  useEffect(() => {
    console.log("UndergraduatesContent Debug:", {
      loading,
      error,
      undergraduatesResponse,
      dataLength: undergraduatesResponse?.length || 0,
    });
  }, [loading, error, undergraduatesResponse]); // Move undergraduates initialization inside useMemo to fix react-hooks/exhaustive-deps warnings
  const undergraduates = useMemo(() => {
    // Handle both direct array and API response with data property
    if (Array.isArray(undergraduatesResponse)) {
      return undergraduatesResponse as Undergraduate[];
    }
    if (
      (undergraduatesResponse as any)?.data &&
      Array.isArray((undergraduatesResponse as any).data)
    ) {
      return (undergraduatesResponse as any).data as Undergraduate[];
    }
    return [] as Undergraduate[];
  }, [undergraduatesResponse]);

  // Extract unique universities for filter dropdown
  const availableUniversities = useMemo(() => {
    const universities = new Set(
      undergraduates
        .map((undergraduate: Undergraduate) => undergraduate.university)
        .filter(
          (university: string | undefined): university is string =>
            university !== undefined && university.trim() !== ""
        )
    );
    return [LABELS.ALL_UNIVERSITIES, ...Array.from(universities)];
  }, [undergraduates]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        setFilters((prev) => ({ ...prev, search: value }));
      }, 300),
    []
  );

  // Fix mutation usage by wrapping API calls with unknown
  const verifyUndergraduate = (params: unknown) =>
    undergraduatesApi.verify(params as string);
  const suspendUndergraduate = (params: unknown) =>
    undergraduatesApi.suspend(params as string);
  const activateUndergraduate = (params: unknown) =>
    undergraduatesApi.activate(params as string);

  // Filtered undergraduates with memoization for performance
  const filteredUndergraduates = useMemo(() => {
    if (!undergraduates) return [];

    return undergraduates.filter((undergraduate: Undergraduate) => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          undergraduate.fullName?.toLowerCase().includes(query) ||
          undergraduate.email?.toLowerCase().includes(query) ||
          undergraduate.university?.toLowerCase().includes(query) ||
          undergraduate.faculty?.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      } // University filter
      if (
        filters.university &&
        filters.university !== LABELS.ALL_UNIVERSITIES
      ) {
        if (undergraduate.university !== filters.university) return false;
      }

      // Year of study filter
      if (filters.yearOfStudy !== null) {
        if (undergraduate.yearOfStudy !== filters.yearOfStudy) return false;
      }

      // Verification status filter
      if (filters.verificationStatus) {
        if (undergraduate.verificationStatus !== filters.verificationStatus)
          return false;
      }

      // Account status filter
      if (filters.accountStatus) {
        if (undergraduate.accountStatus !== filters.accountStatus) return false;
      }

      return true;
    });
  }, [undergraduates, filters]);

  // Handle viewing undergraduate details
  const handleViewUndergraduate = (undergraduate: Undergraduate) => {
    setSelectedUndergraduate(undergraduate);
    setIsSheetOpen(true);
  };
  // Handle verification action
  const handleVerifyUndergraduate = async (id: string) => {
    try {
      const result = await verifyUndergraduateMutation.mutate(
        verifyUndergraduate,
        id
      );
      if (result) {
        toast.success("Undergraduate verified successfully!");
        await refetch();
        // Update selected undergraduate if it's currently viewed
        if (selectedUndergraduate && selectedUndergraduate._id === id) {
          setSelectedUndergraduate({
            ...selectedUndergraduate,
            verificationStatus: "verified",
          });
        }
      }
    } catch (error) {
      console.error("Failed to verify undergraduate:", error);
      toast.error("Failed to verify undergraduate. Please try again.");
    }
  };
  // Handle suspension action
  const handleSuspendUndergraduate = async (id: string) => {
    try {
      const result = await suspendUndergraduateMutation.mutate(
        suspendUndergraduate,
        id
      );
      if (result) {
        toast.success("Undergraduate suspended successfully!");
        await refetch();
        // Update selected undergraduate if it's currently viewed
        if (selectedUndergraduate && selectedUndergraduate._id === id) {
          setSelectedUndergraduate({
            ...selectedUndergraduate,
            accountStatus: "suspended",
          });
        }
      }
    } catch (error) {
      console.error("Failed to suspend undergraduate:", error);
      toast.error("Failed to suspend undergraduate. Please try again.");
    }
  };

  // Handle activation action
  const handleActivateUndergraduate = async (id: string) => {
    try {
      const result = await activateUndergraduateMutation.mutate(
        activateUndergraduate,
        id
      );
      if (result) {
        toast.success("Undergraduate activated successfully!");
        await refetch();
        // Update selected undergraduate if it's currently viewed
        if (selectedUndergraduate && selectedUndergraduate._id === id) {
          setSelectedUndergraduate({
            ...selectedUndergraduate,
            accountStatus: "active",
          });
        }
      }
    } catch (error) {
      console.error("Failed to activate undergraduate:", error);
      toast.error("Failed to activate undergraduate. Please try again.");
    }
  };

  // Update search filter with debouncing
  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  // Update other filters
  const updateFilter = (
    key: keyof FilterState,
    value: string | number | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Undergraduate Users Management</h1>
      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              label="Search Users"
              placeholder={LABELS.SEARCH_PLACEHOLDER}
              className="pl-10"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">University</label>
            <Select
              value={filters.university}
              onChange={(value: string) => updateFilter("university", value)}
              options={availableUniversities.map((university) => ({
                value: university as string,
                label: university as string,
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Year of Study</label>
            <Select
              value={filters.yearOfStudy?.toString() || "all"}
              onChange={(value: string) =>
                updateFilter(
                  "yearOfStudy",
                  value === "all" ? null : parseInt(value)
                )
              }
              options={[
                { value: LABELS.ALL_YEARS, label: LABELS.ALL_YEARS },
                ...YEARS_OF_STUDY.map((year) => ({
                  value: year.toString(),
                  label: `Year ${year}`,
                })),
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Status</label>
            <Select
              value={filters.verificationStatus || "all"}
              onChange={(value: string) =>
                updateFilter(
                  "verificationStatus",
                  value === "all" ? null : value
                )
              }
              options={[
                { value: "all", label: LABELS.ALL_STATUSES },
                ...VERIFICATION_STATUSES.map((status) => ({
                  value: status,
                  label: formatStatusText(status),
                })),
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Status</label>
            <Select
              value={filters.accountStatus || "all"}
              onChange={(value: string) =>
                updateFilter("accountStatus", value === "all" ? null : value)
              }
              options={[
                { value: "all", label: LABELS.ALL_STATUSES },
                ...ACCOUNT_STATUSES.map((status) => ({
                  value: status,
                  label: formatStatusText(status),
                })),
              ]}
            />
          </div>
        </div>
      </div>
      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {LABELS.SHOWING_RESULTS.replace(
            "{count}",
            filteredUndergraduates.length.toString()
          ).replace("{total}", (undergraduates?.length || 0).toString())}
        </p>
      </div>
      {/* Users Table */}
      {filteredUndergraduates.length === 0 ? (
        <EmptyState
          title={LABELS.NO_RESULTS_TITLE}
          description={LABELS.NO_RESULTS_DESCRIPTION}
          icon="users"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.PROFILE}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.FULL_NAME}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.EMAIL}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.UNIVERSITY}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.YEAR}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.STUDENT_ID}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.VERIFICATION}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.STATUS}
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {TABLE_HEADERS.ACTIONS}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUndergraduates.map((undergraduate: Undergraduate) => (
                  <tr key={undergraduate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Avatar>
                        
                        <AvatarImage
                          src={undergraduate.profilePicture || undefined}
                          alt={getFullName(undergraduate)}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getInitials(getFullName(undergraduate))}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      
                      <div className="font-medium text-gray-900">
                        {getFullName(undergraduate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {undergraduate.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {undergraduate.university || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Year {undergraduate.yearOfStudy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          undergraduate.studentIdVerified
                            ? "success"
                            : "warning"
                        }
                      >
                        {undergraduate.studentIdVerified
                          ? "Verified"
                          : "Not Verified"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      
                      <Badge
                        variant={getStatusVariant(
                          getVerificationStatus(undergraduate)
                        )}
                      >
                        {formatStatusText(getVerificationStatus(undergraduate))}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      
                      <Badge
                        variant={getStatusVariant(
                          getAccountStatus(undergraduate)
                        )}
                      >
                        {formatStatusText(getAccountStatus(undergraduate))}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUndergraduate(undergraduate)}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {ACTIONS.VIEW}
                        </Button>
                        {getVerificationStatus(undergraduate) !==
                          "verified" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleVerifyUndergraduate(undergraduate._id)
                            }
                            disabled={verifyUndergraduateMutation.loading}
                            className="flex items-center"
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            {ACTIONS.VERIFY}
                          </Button>
                        )}
                        {getAccountStatus(undergraduate) === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSuspendUndergraduate(undergraduate._id)
                            }
                            disabled={suspendUndergraduateMutation.loading}
                            className="flex items-center text-red-600 hover:text-red-800"
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            {ACTIONS.SUSPEND}
                          </Button>
                        )}
                        {getAccountStatus(undergraduate) === "suspended" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleActivateUndergraduate(undergraduate._id)
                            }
                            disabled={activateUndergraduateMutation.loading}
                            className="flex items-center text-green-600 hover:text-green-800"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            {ACTIONS.ACTIVATE}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* User Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedUndergraduate && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>Undergraduate Details</SheetTitle>
                <SheetDescription>
                  Comprehensive information about the selected undergraduate
                  student
                </SheetDescription>
              </SheetHeader>

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
                    
                    <h3 className="text-xl font-semibold">
                      {selectedUndergraduate.fullName || "N/A"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUndergraduate.email || "N/A"}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      
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

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.PHONE}
                        </p>
                        <p>{selectedUndergraduate.phone || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        
                        <p className="text-sm font-medium text-gray-500">
                          Gender
                        </p>
                        <p>{selectedUndergraduate.gender || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date of Birth
                        </p>
                        <p>
                          {selectedUndergraduate.dateOfBirth
                            ? formatDate(selectedUndergraduate.dateOfBirth)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Address
                        </p>
                        <p>
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

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <School className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.UNIVERSITY}
                        </p>
                        <p>{selectedUndergraduate.university || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.FACULTY}
                        </p>
                        <p>{selectedUndergraduate.faculty || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.YEAR_OF_STUDY}
                        </p>
                        <p>Year {selectedUndergraduate.yearOfStudy}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
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

                    {selectedUndergraduate.gpa && (
                      <div className="flex items-start">
                        <ClipboardCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            {FIELD_LABELS.GPA}
                          </p>
                          <p>{selectedUndergraduate.gpa}</p>
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

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.JOIN_DATE}
                        </p>
                        <p>
                          
                          {selectedUndergraduate.createdAt
                            ? formatDate(selectedUndergraduate.createdAt)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.LAST_LOGIN}
                        </p>
                        <p>
                          
                          {selectedUndergraduate.lastLoginAt
                            ? formatDate(selectedUndergraduate.lastLoginAt)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {FIELD_LABELS.VERIFICATION_STATUS}
                        </p>
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
                <Separator /> {/* Bio */}
                {selectedUndergraduate.bio && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium">
                      {SHEET_SECTIONS.BIO}
                    </h4>
                    <p className="text-sm text-gray-600">
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
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
