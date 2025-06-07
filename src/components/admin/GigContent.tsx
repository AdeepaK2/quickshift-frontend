"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Tag,
  Building,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Mock gig data - in a real app, this would come from an API
const mockGigs = [
  {
    id: "gig-001",
    title: "Event Staff for Summer Festival",
    employer: {
      id: "emp-001",
      name: "Festival Productions Inc.",
      email: "contact@festivalproductions.com",
    },
    category: "Event Staff",
    status: "open",
    city: "Toronto",
    totalPositions: 20,
    filledPositions: 5,
    applicationDeadline: "2025-06-15",
    description:
      "We need energetic staff to help with our annual summer festival.",
    payRate: { type: "hourly", min: 25, max: 30, currency: "$" },
    timeSlots: [
      {
        date: "2025-07-01",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 10,
        peopleAssigned: 3,
      },
      {
        date: "2025-07-02",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 10,
        peopleAssigned: 2,
      },
    ],
    location: {
      address: "123 Festival Ave",
      city: "Toronto",
      postalCode: "M5V 2H1",
    },
    skills: ["Customer Service", "Standing for long periods", "Communication"],
    experience: "No prior experience required",
    dressCode: "Black t-shirt and pants",
    equipment: "Comfortable shoes",
    isAcceptingApplications: true,
    applicants: [
      {
        id: "app-001",
        name: "John Doe",
        status: "pending",
        appliedAt: "2025-05-20T14:30:00Z",
      },
      {
        id: "app-002",
        name: "Jane Smith",
        status: "accepted",
        appliedAt: "2025-05-21T10:15:00Z",
      },
    ],
    createdAt: "2025-05-15T09:00:00Z",
    updatedAt: "2025-05-20T16:45:00Z",
  },
  {
    id: "gig-002",
    title: "Campus Tour Guide",
    employer: {
      id: "emp-002",
      name: "University of Toronto",
      email: "admissions@utoronto.ca",
    },
    category: "Campus Jobs",
    status: "draft",
    city: "Toronto",
    totalPositions: 5,
    filledPositions: 0,
    applicationDeadline: "2025-06-01",
    description: "Leading tours for prospective students and their families.",
    payRate: { type: "hourly", min: 20, max: 20, currency: "$" },
    timeSlots: [
      {
        date: "2025-06-15",
        startTime: "10:00",
        endTime: "12:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
      {
        date: "2025-06-16",
        startTime: "10:00",
        endTime: "12:00",
        peopleNeeded: 3,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "27 King's College Circle",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    skills: ["Public Speaking", "Knowledge of campus", "Friendly demeanor"],
    experience: "Must be a current student",
    dressCode: "Business casual",
    equipment: "None required",
    isAcceptingApplications: false,
    applicants: [],
    createdAt: "2025-05-10T11:30:00Z",
    updatedAt: "2025-05-10T11:30:00Z",
  },
  {
    id: "gig-003",
    title: "Warehouse Helper",
    employer: {
      id: "emp-003",
      name: "FastShip Logistics",
      email: "hr@fastship.com",
    },
    category: "Warehouse",
    status: "in_progress",
    city: "Mississauga",
    totalPositions: 10,
    filledPositions: 8,
    applicationDeadline: "2025-05-15",
    description: "Assisting with inventory management and order fulfillment.",
    payRate: { type: "fixed", amount: 500, currency: "$" },
    timeSlots: [
      {
        date: "2025-05-25",
        startTime: "08:00",
        endTime: "16:00",
        peopleNeeded: 10,
        peopleAssigned: 8,
      },
    ],
    location: {
      address: "500 Industrial Pkwy",
      city: "Mississauga",
      postalCode: "L5T 2B1",
    },
    skills: [
      "Lifting up to 50lbs",
      "Basic computer skills",
      "Attention to detail",
    ],
    experience: "Previous warehouse experience preferred",
    dressCode: "Casual, closed-toe shoes required",
    equipment: "Safety gear provided",
    isAcceptingApplications: true,
    applicants: [
      {
        id: "app-003",
        name: "Mike Johnson",
        status: "accepted",
        appliedAt: "2025-05-01T09:45:00Z",
      },
      {
        id: "app-004",
        name: "Sarah Williams",
        status: "rejected",
        appliedAt: "2025-05-02T14:20:00Z",
      },
      {
        id: "app-005",
        name: "David Brown",
        status: "accepted",
        appliedAt: "2025-05-03T11:10:00Z",
      },
    ],
    createdAt: "2025-04-20T08:15:00Z",
    updatedAt: "2025-05-10T16:30:00Z",
  },
];

// Status badge colors mapping
const statusBadgeVariants: Record<
  string,
  | "warning"
  | "success"
  | "info"
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
> = {
  draft: "warning",
  open: "success",
  in_progress: "info",
  completed: "default",
  cancelled: "destructive",
};

export default function GigContent() {
  // State for filters
  const [filters, setFilters] = useState({
    status: "",
    employer: "",
    city: "",
    category: "",
    deadlineStart: "",
    deadlineEnd: "",
  });

  // State for selected gig details
  const [selectedGig, setSelectedGig] = useState<any>(null);

  // Apply filters to gigs
  const filteredGigs = mockGigs.filter((gig) => {
    if (filters.status && gig.status !== filters.status) return false;
    if (
      filters.employer &&
      !gig.employer.name.toLowerCase().includes(filters.employer.toLowerCase())
    )
      return false;
    if (
      filters.city &&
      !gig.city.toLowerCase().includes(filters.city.toLowerCase())
    )
      return false;
    if (
      filters.category &&
      !gig.category.toLowerCase().includes(filters.category.toLowerCase())
    )
      return false;

    if (filters.deadlineStart) {
      const deadlineDate = new Date(gig.applicationDeadline);
      const startDate = new Date(filters.deadlineStart);
      if (deadlineDate < startDate) return false;
    }

    if (filters.deadlineEnd) {
      const deadlineDate = new Date(gig.applicationDeadline);
      const endDate = new Date(filters.deadlineEnd);
      if (deadlineDate > endDate) return false;
    }

    return true;
  });

  // Unique values for filter dropdowns
  const uniqueEmployers = Array.from(
    new Set(mockGigs.map((g) => g.employer.name))
  );
  const uniqueCities = Array.from(new Set(mockGigs.map((g) => g.city)));
  const uniqueCategories = Array.from(new Set(mockGigs.map((g) => g.category)));
  const statuses = ["draft", "open", "in_progress", "completed", "cancelled"];

  // Format pay rate for display
  const formatPayRate = (payRate: any) => {
    if (payRate.type === "fixed") {
      return `${payRate.currency}${payRate.amount} - Fixed`;
    } else {
      return `${payRate.currency}${payRate.min}${
        payRate.max !== payRate.min
          ? ` - ${payRate.currency}${payRate.max}`
          : ""
      } / ${payRate.type}`;
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  // Function to clear all filters
  const clearFilters = () => {
    setFilters({
      status: "",
      employer: "",
      city: "",
      category: "",
      deadlineStart: "",
      deadlineEnd: "",
    });
  };

  // View gig details
  const viewGigDetails = (gig: any) => {
    setSelectedGig(gig);
  };

  // Handle status change (in a real app, this would call an API)
  const handleStatusChange = (gigId: string, newStatus: string) => {
    console.log(`Changing status for gig ${gigId} to ${newStatus}`);
    // In a real app, this would update the backend and then refresh the data
  };

  // Handle delete (in a real app, this would call an API)
  const handleDelete = (gigId: string) => {
    console.log(`Deleting gig ${gigId}`);
    // In a real app, this would call an API to delete the gig
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gigs Management</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-md border border-input p-2"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Employer Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Employer</label>
            <select
              className="w-full rounded-md border border-input p-2"
              value={filters.employer}
              onChange={(e) => handleFilterChange("employer", e.target.value)}
            >
              <option value="">All Employers</option>
              {uniqueEmployers.map((employer) => (
                <option key={employer} value={employer}>
                  {employer}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium">City</label>
            <select
              className="w-full rounded-md border border-input p-2"
              value={filters.city}
              onChange={(e) => handleFilterChange("city", e.target.value)}
            >
              <option value="">All Cities</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full rounded-md border border-input p-2"
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Application Deadline Range */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Deadline From</label>
            <input
              type="date"
              className="w-full rounded-md border border-input p-2"
              value={filters.deadlineStart}
              onChange={(e) =>
                handleFilterChange("deadlineStart", e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Deadline To</label>
            <input
              type="date"
              className="w-full rounded-md border border-input p-2"
              value={filters.deadlineEnd}
              onChange={(e) =>
                handleFilterChange("deadlineEnd", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Gigs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gig Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Positions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGigs.length > 0 ? (
                filteredGigs.map((gig) => (
                  <tr key={gig.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {gig.title}
                      </div>
                      {!gig.isAcceptingApplications && (
                        <div className="mt-1 flex items-center">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-xs text-amber-500">
                            Not accepting applications
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gig.employer.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gig.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={statusBadgeVariants[gig.status] || "default"}
                      >
                        {gig.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{gig.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {gig.filledPositions} / {gig.totalPositions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(gig.applicationDeadline).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {/* View Details Button */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => viewGigDetails(gig)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="w-[90vw] sm:w-[600px] overflow-y-auto"
                          >
                            {selectedGig && (
                              <div className="space-y-6">
                                <div className="border-b pb-4">
                                  <h2 className="text-2xl font-bold">
                                    {selectedGig.title}
                                  </h2>
                                  <Badge
                                    variant={
                                      statusBadgeVariants[selectedGig.status] ||
                                      "default"
                                    }
                                    className="mt-2"
                                  >
                                    {selectedGig.status.replace("_", " ")}
                                  </Badge>
                                  {!selectedGig.isAcceptingApplications && (
                                    <div className="mt-2 flex items-center text-amber-500">
                                      <AlertTriangle className="h-4 w-4 mr-1" />
                                      <span>Not accepting applications</span>
                                    </div>
                                  )}
                                  <p className="mt-4 text-gray-700">
                                    {selectedGig.description}
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">
                                        Employer
                                      </h3>
                                      <p className="text-base">
                                        {selectedGig.employer.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {selectedGig.employer.email}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">
                                        Category & Pay
                                      </h3>
                                      <p className="text-base">
                                        {selectedGig.category}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {formatPayRate(selectedGig.payRate)}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                      Time Slots
                                    </h3>
                                    <div className="border rounded-md overflow-hidden">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                              Date
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                              Time
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                              People Needed
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                              People Assigned
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {selectedGig.timeSlots.map(
                                            (slot: any, index: number) => (
                                              <tr key={index}>
                                                <td className="px-4 py-2 text-sm">
                                                  {new Date(
                                                    slot.date
                                                  ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                  {slot.startTime} -{" "}
                                                  {slot.endTime}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                  {slot.peopleNeeded}
                                                </td>
                                                <td className="px-4 py-2 text-sm">
                                                  {slot.peopleAssigned}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                      Location
                                    </h3>
                                    <div className="flex items-start gap-2">
                                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-base">
                                          {selectedGig.location.address}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {selectedGig.location.city},{" "}
                                          {selectedGig.location.postalCode}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                      Skills Required
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedGig.skills.map(
                                        (skill: string, index: number) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-blue-50"
                                          >
                                            {skill}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">
                                        Experience
                                      </h3>
                                      <p className="text-sm">
                                        {selectedGig.experience}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">
                                        Dress Code
                                      </h3>
                                      <p className="text-sm">
                                        {selectedGig.dressCode}
                                      </p>
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500">
                                        Equipment
                                      </h3>
                                      <p className="text-sm">
                                        {selectedGig.equipment}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                      Application Deadline
                                    </h3>
                                    <p className="text-base">
                                      {new Date(
                                        selectedGig.applicationDeadline
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>

                                  <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                      Positions: {selectedGig.filledPositions}{" "}
                                      filled out of {selectedGig.totalPositions}
                                    </h3>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{
                                          width: `${
                                            (selectedGig.filledPositions /
                                              selectedGig.totalPositions) *
                                            100
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>

                                  {selectedGig.applicants.length > 0 && (
                                    <div>
                                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                                        Applicants (
                                        {selectedGig.applicants.length})
                                      </h3>
                                      <div className="border rounded-md overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                                Name
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                                Status
                                              </th>
                                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                                                Applied At
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-gray-200">
                                            {selectedGig.applicants.map(
                                              (applicant: any) => (
                                                <tr key={applicant.id}>
                                                  <td className="px-4 py-2 text-sm">
                                                    {applicant.name}
                                                  </td>
                                                  <td className="px-4 py-2 text-sm">
                                                    <Badge
                                                      variant={
                                                        applicant.status ===
                                                        "accepted"
                                                          ? "success"
                                                          : applicant.status ===
                                                            "rejected"
                                                          ? "destructive"
                                                          : "warning"
                                                      }
                                                    >
                                                      {applicant.status}
                                                    </Badge>
                                                  </td>
                                                  <td className="px-4 py-2 text-sm">
                                                    {new Date(
                                                      applicant.appliedAt
                                                    ).toLocaleString()}
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                                    <div>
                                      <span className="font-medium">
                                        Created:
                                      </span>{" "}
                                      {new Date(
                                        selectedGig.createdAt
                                      ).toLocaleString()}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Last Updated:
                                      </span>{" "}
                                      {new Date(
                                        selectedGig.updatedAt
                                      ).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </SheetContent>
                        </Sheet>

                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>

                        {/* Change Status Dropdown */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <h2 className="text-xl font-semibold mb-4">
                              Change Status
                            </h2>
                            <div className="space-y-4">
                              <p>
                                Current status:{" "}
                                <Badge
                                  variant={statusBadgeVariants[gig.status]}
                                >
                                  {gig.status}
                                </Badge>
                              </p>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  New Status
                                </label>
                                <select
                                  className="w-full rounded-md border border-input p-2"
                                  defaultValue={gig.status}
                                >
                                  {statuses.map((status) => (
                                    <option key={status} value={status}>
                                      {status.charAt(0).toUpperCase() +
                                        status.slice(1).replace("_", " ")}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex justify-end gap-2 mt-4">
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                  onClick={() =>
                                    handleStatusChange(gig.id, "new-status")
                                  }
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(gig.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No gigs found matching the current filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{filteredGigs.length}</span> of{" "}
                <span className="font-medium">{filteredGigs.length}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Button variant="outline" size="sm" className="rounded-l-md">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="rounded-r-md">
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
