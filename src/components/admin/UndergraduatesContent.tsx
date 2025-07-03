"use client";

import React, { useState, useMemo } from "react";
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
import { mockUndergraduates } from "@/lib/mock-data/undergraduates";

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
  const [undergraduates, setUndergraduates] = useState<Undergraduate[]>(mockUndergraduates);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    university: LABELS.ALL_UNIVERSITIES,
    yearOfStudy: null,
    verificationStatus: null,
    accountStatus: null,
  });
  // Refetch function for mock data
  const refetch = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUndergraduates(mockUndergraduates);
      setError(null);    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Mock mutation states - will be used when handlers are implemented
  // const [setVerifyLoading] = useState(false);
  // const [setSuspendLoading] = useState(false);
  // const [setActivateLoading] = useState(false);

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
  // Mock API functions - will be used when handlers are implemented
  // const verifyUndergraduate = async (id: string) => {
  //   return await mockUndergraduatesApi.verify(id);
  // };
  // 
  // const suspendUndergraduate = async (id: string) => {
  //   return await mockUndergraduatesApi.suspend(id);
  // };
  // 
  // const activateUndergraduate = async (id: string) => {
  //   return await mockUndergraduatesApi.activate(id);
  // };

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
  };  // These handlers are used in the UI components but will be implemented later
  // Commented to avoid unused function warnings
  /*
  const handleVerifyUndergraduate = async (id: string) => {
    setVerifyLoading(true);
    try {
      const result = await verifyUndergraduate(id);
      if (result) {
        toast.success("Undergraduate verified successfully!");
        // Update local state
        setUndergraduates(prev => 
          prev.map(undergraduate => 
            undergraduate.id === id 
              ? { ...undergraduate, verificationStatus: "verified" }
              : undergraduate
          )
        );
        // Update selected undergraduate if it's currently viewed
        if (selectedUndergraduate && selectedUndergraduate.id === id) {
          setSelectedUndergraduate({
            ...selectedUndergraduate,
            verificationStatus: "verified",
          });
        }
      }
    } catch (error) {
      console.error("Failed to verify undergraduate:", error);
      toast.error("Failed to verify undergraduate. Please try again.");
    } finally {
      setVerifyLoading(false);
    }
  };
  */  // Commented to avoid unused function warnings
  /*
  const handleSuspendUndergraduate = async (id: string) => {
    setSuspendLoading(true);
    try {
      const result = await suspendUndergraduate(id);
      if (result) {
        toast.success("Undergraduate suspended successfully!");
        // Update local state
        setUndergraduates(prev => 
          prev.map(undergraduate => 
            undergraduate.id === id 
              ? { ...undergraduate, accountStatus: "suspended" }
              : undergraduate
          )
        );
        // Update selected undergraduate if it's currently viewed
        if (selectedUndergraduate && selectedUndergraduate.id === id) {
          setSelectedUndergraduate({
            ...selectedUndergraduate,
            accountStatus: "suspended",
          });
        }
      }
    } catch (error) {
      console.error("Failed to suspend undergraduate:", error);
      toast.error("Failed to suspend undergraduate. Please try again.");
    } finally {
      setSuspendLoading(false);
    }
  };
  */
  // Commented to avoid unused function warnings
  /*
  const handleActivateUndergraduate = async (id: string) => {
    setActivateLoading(true);
    try {
      const result = await activateUndergraduate(id);
      if (result) {
        toast.success("Undergraduate activated successfully!");
        // Update local state
        setUndergraduates(prev => 
          prev.map(undergraduate => 
            undergraduate.id === id 
              ? { ...undergraduate, accountStatus: "active" }
              : undergraduate
          )
  */

  // Export functionality

  // Export functionality
  const handleExportData = () => {
    const csvData = filteredUndergraduates.map(undergraduate => ({
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
  }  return (
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
            filteredUndergraduates.length.toString()
          ).replace("{total}", (undergraduates?.length || 0).toString())}
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
            onClick={handleExportData}
            disabled={filteredUndergraduates.length === 0}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            {ACTIONS.EXPORT}
          </Button>
        </div>
      </div>{" "}
      {/* Users Table */}
      {filteredUndergraduates.length === 0 ? (
        <EmptyState
          title={LABELS.NO_RESULTS_TITLE}
          description={LABELS.NO_RESULTS_DESCRIPTION}
          icon="users"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="space-y-4 p-4">
            {filteredUndergraduates.map((undergraduate) => (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUndergraduate(undergraduate)}
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
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
