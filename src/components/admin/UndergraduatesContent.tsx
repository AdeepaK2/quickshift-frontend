"use client";

import { useState, useMemo } from "react";
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
  Mail,
  ClipboardCheck,
  Clock,
  UserCheck,
  Shield,
  ShieldCheck,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

import { useApi, useMutation } from "@/lib/hooks";
import { undergraduatesApi } from "@/lib/api";
import { formatDate, getStatusVariant, debounce } from "@/lib/utils";
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

// TypeScript interfaces for Undergraduate data
interface Undergraduate {
  id: string;
  profilePicture?: string;
  fullName: string;
  email: string;
  university: string;
  yearOfStudy: number;
  studentIdVerified: boolean;
  phoneNumber: string;
  faculty: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: string;
  address: string;
  city: string;
  postalCode: string;
  accountStatus: "active" | "inactive" | "suspended";
  verificationStatus: "verified" | "pending" | "rejected";
  lastLogin: string;
  bio?: string;
  gpa?: number;
  skillsAndInterests?: string[];
  documentsUploaded?: string[];
  joinDate: string;
}

interface FilterState {
  search: string;
  university: string;
  yearOfStudy: number | null;
  verificationStatus: string | null;
  accountStatus: string | null;
}

// Constants for filter options
const UNIVERSITIES = [
  "All Universities",
  "University of Technology",
  "State University",
  "National University",
  "Technical Institute",
];

const YEARS_OF_STUDY = [1, 2, 3, 4, 5];

const VERIFICATION_STATUSES = ["verified", "pending", "rejected"];

const ACCOUNT_STATUSES = ["active", "inactive", "suspended"];

export default function UndergraduatesContent() {
  const [selectedUndergraduate, setSelectedUndergraduate] =
    useState<Undergraduate | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    university: "All Universities",
    yearOfStudy: null,
    verificationStatus: null,
    accountStatus: null,
  });
  // API calls
  const {
    data: undergraduates = [],
    loading,
    error,
    refetch,
  } = useApi(() => undergraduatesApi.getAll());

  const verifyUndergraduateMutation = useMutation();
  const suspendUndergraduateMutation = useMutation();

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({ ...prev, search: value }));
      }, 300),
    []
  );
  // Filtered undergraduates with memoization for performance
  const filteredUndergraduates = useMemo(() => {
    if (!undergraduates) return [];

    return undergraduates.filter((undergraduate: Undergraduate) => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          undergraduate.fullName.toLowerCase().includes(query) ||
          undergraduate.email.toLowerCase().includes(query) ||
          undergraduate.university.toLowerCase().includes(query) ||
          undergraduate.faculty.toLowerCase().includes(query);

        if (!matchesSearch) return false;
      }

      // University filter
      if (filters.university && filters.university !== "All Universities") {
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
      await verifyUndergraduateMutation.mutate(undergraduatesApi.verify, id);
      refetch();
    } catch (error) {
      console.error("Failed to verify undergraduate:", error);
    }
  };

  // Handle suspension action
  const handleSuspendUndergraduate = async (id: string) => {
    try {
      await suspendUndergraduateMutation.mutate(undergraduatesApi.suspend, id);
      refetch();
    } catch (error) {
      console.error("Failed to suspend undergraduate:", error);
    }
  };

  // Update search filter with debouncing
  const handleSearchChange = (value: string) => {
    debouncedSearch(value);
  };

  // Update other filters
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading undergraduate students..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to Load Undergraduates"
        message="There was an error loading the undergraduate students data."
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
              placeholder="Search users..."
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
              onValueChange={(value) => updateFilter("university", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select University" />
              </SelectTrigger>
              <SelectContent>
                {UNIVERSITIES.map((university) => (
                  <SelectItem key={university} value={university}>
                    {university}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Year of Study</label>
            <Select
              value={filters.yearOfStudy?.toString() || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "yearOfStudy",
                  value === "all" ? null : parseInt(value)
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS_OF_STUDY.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    Year {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Verification Status</label>
            <Select
              value={filters.verificationStatus || "all"}
              onValueChange={(value) =>
                updateFilter(
                  "verificationStatus",
                  value === "all" ? null : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {VERIFICATION_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Account Status</label>
            <Select
              value={filters.accountStatus || "all"}
              onValueChange={(value) =>
                updateFilter("accountStatus", value === "all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ACCOUNT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>{" "}
      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {filteredUndergraduates.length} of{" "}
          {undergraduates?.length || 0} undergraduates
        </p>
      </div>{" "}
      {/* Users Table */}
      {filteredUndergraduates.length === 0 ? (
        <EmptyState
          title="No Undergraduates Found"
          description="No undergraduate students match your current filter criteria."
          icon="users"
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profile
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUndergraduates.map((undergraduate) => (
                  <tr key={undergraduate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Avatar>
                        <AvatarImage
                          src={undergraduate.profilePicture}
                          alt={undergraduate.fullName}
                        />{" "}
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {undergraduate.fullName
                            .split(" ")
                            .map((name: string) => name[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {undergraduate.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {undergraduate.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {undergraduate.university}
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
                      {" "}
                      <Badge
                        variant={getStatusVariant(
                          undergraduate.verificationStatus
                        )}
                      >
                        {undergraduate.verificationStatus
                          .charAt(0)
                          .toUpperCase() +
                          undergraduate.verificationStatus.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={getStatusVariant(undergraduate.accountStatus)}
                      >
                        {undergraduate.accountStatus.charAt(0).toUpperCase() +
                          undergraduate.accountStatus.slice(1)}
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
                          View
                        </Button>

                        {undergraduate.verificationStatus !== "verified" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleVerifyUndergraduate(undergraduate.id)
                            }
                            disabled={verifyUndergraduateMutation.loading}
                            className="flex items-center"
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        )}

                        {undergraduate.accountStatus === "active" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSuspendUndergraduate(undergraduate.id)
                            }
                            disabled={suspendUndergraduateMutation.loading}
                            className="flex items-center text-red-600 hover:text-red-800"
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Suspend
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
                      src={selectedUndergraduate.profilePicture}
                      alt={selectedUndergraduate.fullName}
                    />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                      {selectedUndergraduate.fullName
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedUndergraduate.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUndergraduate.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      {" "}
                      <Badge
                        variant={getStatusVariant(
                          selectedUndergraduate.accountStatus
                        )}
                      >
                        {selectedUndergraduate.accountStatus
                          .charAt(0)
                          .toUpperCase() +
                          selectedUndergraduate.accountStatus.slice(1)}
                      </Badge>
                      <Badge
                        variant={getStatusVariant(
                          selectedUndergraduate.verificationStatus
                        )}
                      >
                        {selectedUndergraduate.verificationStatus
                          .charAt(0)
                          .toUpperCase() +
                          selectedUndergraduate.verificationStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Personal Information</h4>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Phone Number
                        </p>
                        <p>{selectedUndergraduate.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Gender
                        </p>
                        <p>{selectedUndergraduate.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date of Birth
                        </p>
                        <p>{formatDate(selectedUndergraduate.dateOfBirth)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Address
                        </p>
                        <p>
                          {selectedUndergraduate.address},{" "}
                          {selectedUndergraduate.city},{" "}
                          {selectedUndergraduate.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Academic Information</h4>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <School className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          University
                        </p>
                        <p>{selectedUndergraduate.university}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Faculty
                        </p>
                        <p>{selectedUndergraduate.faculty}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Year of Study
                        </p>
                        <p>Year {selectedUndergraduate.yearOfStudy}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Student ID Verification
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
                            GPA
                          </p>
                          <p>{selectedUndergraduate.gpa}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Account Information</h4>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Join Date
                        </p>
                        <p>{formatDate(selectedUndergraduate.joinDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Last Login
                        </p>
                        <p>{formatDate(selectedUndergraduate.lastLogin)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Verification Status
                        </p>{" "}
                        <Badge
                          variant={getStatusVariant(
                            selectedUndergraduate.verificationStatus
                          )}
                        >
                          {selectedUndergraduate.verificationStatus
                            .charAt(0)
                            .toUpperCase() +
                            selectedUndergraduate.verificationStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                {selectedUndergraduate.bio && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium">Biography</h4>
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
                          Skills & Interests
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
