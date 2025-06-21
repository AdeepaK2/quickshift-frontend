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
import { LoadingState } from "@/components/ui/loading";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

// Hardcoded Gig interface for frontend-only display
interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  employer: {
    _id: string;
    companyName: string;
    email: string;
    contactNumber?: string;
  };
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  payRate: {
    amount: number;
    rateType: "hourly" | "fixed" | "daily";
  };
  timeSlots: Array<{
    date: string;
    startTime: string;
    endTime: string;
    peopleNeeded: number;
    peopleAssigned: number;
  }>;
  location: {
    address: string;
    city: string;
    postalCode?: string;
  };
  requirements?: {
    skills?: string[];
    experience?: string;
    equipment?: string[];
    dressCode?: string;
  };
  applicationDeadline: string;
  applicants: Array<{
    user: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
    timeSlots: string[];
    coverLetter?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Hardcoded gigs data for frontend-only display
const HARDCODED_GIGS: Gig[] = [
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j1",
    title: "Event Setup Staff for University Career Fair",
    description:
      "Help set up booths, tables, and equipment for the annual university career fair. Must be able to lift 50+ lbs and work in a team environment. Great opportunity to network with potential employers!",
    category: "Event Staff",
    employer: {
      _id: "emp_001",
      companyName: "University Events Department",
      email: "events@university.edu",
      contactNumber: "+1-555-0123",
    },
    status: "open",
    payRate: {
      amount: 18.5,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-15",
        startTime: "08:00",
        endTime: "16:00",
        peopleNeeded: 12,
        peopleAssigned: 8,
      },
      {
        date: "2025-07-16",
        startTime: "08:00",
        endTime: "14:00",
        peopleNeeded: 8,
        peopleAssigned: 6,
      },
    ],
    location: {
      address: "123 University Ave, Student Center",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Physical Fitness", "Team Work", "Punctuality"],
      experience: "No experience required",
      equipment: ["Comfortable shoes", "Work gloves"],
      dressCode: "Business casual, closed-toe shoes",
    },
    applicationDeadline: "2025-07-10T23:59:59.000Z",
    applicants: [
      {
        user: "user_001",
        status: "pending",
        appliedAt: "2025-06-18T10:30:00.000Z",
        timeSlots: ["2025-07-15"],
        coverLetter:
          "I'm a hardworking student looking for part-time work to help pay for tuition.",
      },
      {
        user: "user_002",
        status: "accepted",
        appliedAt: "2025-06-17T14:22:00.000Z",
        timeSlots: ["2025-07-15", "2025-07-16"],
        coverLetter:
          "I have experience with event setup from my previous job at a catering company.",
      },
    ],
    createdAt: "2025-06-15T09:00:00.000Z",
    updatedAt: "2025-06-19T16:45:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j2",
    title: "Campus Tour Guide",
    description:
      "Lead prospective students and families on engaging campus tours. Share your knowledge of university life, facilities, and academic programs. Perfect for outgoing students who love their university!",
    category: "Campus Tours",
    employer: {
      _id: "emp_002",
      companyName: "Admissions Office",
      email: "admissions@university.edu",
      contactNumber: "+1-555-0124",
    },
    status: "open",
    payRate: {
      amount: 16.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-20",
        startTime: "10:00",
        endTime: "12:00",
        peopleNeeded: 3,
        peopleAssigned: 2,
      },
      {
        date: "2025-07-20",
        startTime: "14:00",
        endTime: "16:00",
        peopleNeeded: 3,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "Main Campus, Admissions Building",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Public Speaking", "University Knowledge", "Customer Service"],
      experience: "Current student preferred, training provided",
      dressCode: "University branded polo shirt (provided)",
    },
    applicationDeadline: "2025-07-15T23:59:59.000Z",
    applicants: [
      {
        user: "user_003",
        status: "accepted",
        appliedAt: "2025-06-16T11:15:00.000Z",
        timeSlots: ["2025-07-20"],
        coverLetter:
          "I'm a third-year student ambassador with excellent communication skills.",
      },
    ],
    createdAt: "2025-06-14T13:30:00.000Z",
    updatedAt: "2025-06-18T09:22:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j3",
    title: "Warehouse Package Sorting",
    description:
      "Sort and organize packages for delivery. Fast-paced environment with opportunities for overtime. Must be able to stand for long periods and lift packages up to 70 lbs.",
    category: "Warehouse",
    employer: {
      _id: "emp_003",
      companyName: "QuickShip Logistics",
      email: "hr@quickship.com",
      contactNumber: "+1-555-0125",
    },
    status: "in_progress",
    payRate: {
      amount: 19.25,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-06-25",
        startTime: "06:00",
        endTime: "14:00",
        peopleNeeded: 15,
        peopleAssigned: 15,
      },
      {
        date: "2025-06-26",
        startTime: "06:00",
        endTime: "14:00",
        peopleNeeded: 15,
        peopleAssigned: 12,
      },
    ],
    location: {
      address: "4567 Industrial Blvd, Unit 12",
      city: "Mississauga",
      postalCode: "L5T 2B3",
    },
    requirements: {
      skills: ["Physical Fitness", "Attention to Detail", "Time Management"],
      experience: "Warehouse experience preferred but not required",
      equipment: ["Steel-toed boots", "High-visibility vest"],
      dressCode: "Work clothes, closed-toe shoes mandatory",
    },
    applicationDeadline: "2025-06-22T23:59:59.000Z",
    applicants: [
      {
        user: "user_004",
        status: "accepted",
        appliedAt: "2025-06-20T08:45:00.000Z",
        timeSlots: ["2025-06-25", "2025-06-26"],
        coverLetter:
          "I have experience in warehouse work and am available for both days.",
      },
      {
        user: "user_005",
        status: "accepted",
        appliedAt: "2025-06-19T16:30:00.000Z",
        timeSlots: ["2025-06-25"],
        coverLetter: "Looking forward to working in a fast-paced environment.",
      },
    ],
    createdAt: "2025-06-18T07:15:00.000Z",
    updatedAt: "2025-06-20T12:00:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j4",
    title: "Restaurant Server - Downtown Location",
    description:
      "Serve customers in a busy downtown restaurant during lunch rush. Must have excellent customer service skills and be able to work in a fast-paced environment. Tips included!",
    category: "Food Service",
    employer: {
      _id: "emp_004",
      companyName: "Maple Leaf Bistro",
      email: "manager@mapleleafbistro.com",
      contactNumber: "+1-555-0126",
    },
    status: "open",
    payRate: {
      amount: 15.5,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-01",
        startTime: "11:00",
        endTime: "15:00",
        peopleNeeded: 4,
        peopleAssigned: 2,
      },
      {
        date: "2025-07-02",
        startTime: "11:00",
        endTime: "15:00",
        peopleNeeded: 4,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "789 King Street West",
      city: "Toronto",
      postalCode: "M5V 1M5",
    },
    requirements: {
      skills: ["Customer Service", "Multitasking", "Cash Handling"],
      experience: "Food service experience preferred",
      dressCode: "Black pants, white shirt, non-slip shoes",
    },
    applicationDeadline: "2025-06-28T23:59:59.000Z",
    applicants: [
      {
        user: "user_006",
        status: "pending",
        appliedAt: "2025-06-19T12:00:00.000Z",
        timeSlots: ["2025-07-01"],
        coverLetter:
          "I have 2 years of experience working at Tim Hortons and excellent customer service skills.",
      },
    ],
    createdAt: "2025-06-17T10:00:00.000Z",
    updatedAt: "2025-06-19T14:30:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j5",
    title: "Data Entry Assistant",
    description:
      "Help digitize student records and enter data into our new system. Attention to detail is crucial. Quiet office environment with flexible hours. Perfect for students who prefer desk work.",
    category: "Administrative",
    employer: {
      _id: "emp_005",
      companyName: "Student Records Office",
      email: "records@university.edu",
      contactNumber: "+1-555-0127",
    },
    status: "draft",
    payRate: {
      amount: 320.0,
      rateType: "fixed",
    },
    timeSlots: [
      {
        date: "2025-07-08",
        startTime: "09:00",
        endTime: "17:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "Administrative Building, Room 205",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Data Entry", "Microsoft Excel", "Attention to Detail"],
      experience: "Basic computer skills required",
      equipment: ["Laptop/computer will be provided"],
    },
    applicationDeadline: "2025-07-05T23:59:59.000Z",
    applicants: [],
    createdAt: "2025-06-19T15:45:00.000Z",
    updatedAt: "2025-06-19T15:45:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j6",
    title: "Social Media Content Creator",
    description:
      "Create engaging social media content for our summer campaign. Need someone creative with experience in Instagram, TikTok, and Facebook. Must provide own equipment and editing software.",
    category: "Marketing",
    employer: {
      _id: "emp_006",
      companyName: "Campus Life Marketing",
      email: "marketing@campuslife.com",
      contactNumber: "+1-555-0128",
    },
    status: "completed",
    payRate: {
      amount: 850.0,
      rateType: "fixed",
    },
    timeSlots: [
      {
        date: "2025-06-10",
        startTime: "10:00",
        endTime: "18:00",
        peopleNeeded: 1,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "Remote work with some on-campus shoots",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: [
        "Social Media",
        "Content Creation",
        "Video Editing",
        "Photography",
      ],
      experience: "Portfolio required, 1+ years social media experience",
      equipment: ["Camera/smartphone", "Editing software", "Laptop"],
    },
    applicationDeadline: "2025-06-05T23:59:59.000Z",
    applicants: [
      {
        user: "user_007",
        status: "accepted",
        appliedAt: "2025-06-01T09:30:00.000Z",
        timeSlots: ["2025-06-10"],
        coverLetter:
          "I run a successful Instagram account with 10k+ followers and have experience with Adobe Creative Suite.",
      },
    ],
    createdAt: "2025-05-28T11:20:00.000Z",
    updatedAt: "2025-06-15T17:00:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j7",
    title: "Research Assistant - Psychology Department",
    description:
      "Assist with data collection and analysis for ongoing psychology research studies. Must be detail-oriented and comfortable working with statistical software. Great for psychology students!",
    category: "Administrative",
    employer: {
      _id: "emp_008",
      companyName: "Psychology Research Lab",
      email: "research@psych.university.edu",
      contactNumber: "+1-555-0130",
    },
    status: "open",
    payRate: {
      amount: 20.0,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-25",
        startTime: "13:00",
        endTime: "17:00",
        peopleNeeded: 2,
        peopleAssigned: 1,
      },
      {
        date: "2025-07-26",
        startTime: "13:00",
        endTime: "17:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
    ],
    location: {
      address: "Psychology Building, Lab 301",
      city: "Toronto",
      postalCode: "M5S 1A1",
    },
    requirements: {
      skills: ["Data Analysis", "SPSS", "Research Methods", "Statistics"],
      experience: "Psychology coursework preferred",
      equipment: ["Laptop will be provided"],
      dressCode: "Business casual",
    },
    applicationDeadline: "2025-07-20T23:59:59.000Z",
    applicants: [
      {
        user: "user_009",
        status: "accepted",
        appliedAt: "2025-06-19T11:20:00.000Z",
        timeSlots: ["2025-07-25"],
        coverLetter:
          "I'm a psychology major with experience in SPSS and research methodology.",
      },
    ],
    createdAt: "2025-06-16T12:30:00.000Z",
    updatedAt: "2025-06-20T08:15:00.000Z",
  },
  {
    _id: "64f1a2b3c4d5e6f7g8h9i0j8",
    title: "Pet Care Assistant - Veterinary Clinic",
    description:
      "Help care for animals at busy veterinary clinic. Duties include feeding, cleaning, and basic animal handling. Must love animals and not be squeamish around medical procedures.",
    category: "Other",
    employer: {
      _id: "emp_009",
      companyName: "Downtown Veterinary Clinic",
      email: "jobs@downtownvet.com",
      contactNumber: "+1-555-0131",
    },
    status: "open",
    payRate: {
      amount: 16.75,
      rateType: "hourly",
    },
    timeSlots: [
      {
        date: "2025-07-12",
        startTime: "08:00",
        endTime: "12:00",
        peopleNeeded: 2,
        peopleAssigned: 0,
      },
      {
        date: "2025-07-13",
        startTime: "08:00",
        endTime: "12:00",
        peopleNeeded: 2,
        peopleAssigned: 1,
      },
    ],
    location: {
      address: "456 Queen Street East",
      city: "Toronto",
      postalCode: "M5A 1T8",
    },
    requirements: {
      skills: ["Animal Handling", "Compassion", "Physical Fitness"],
      experience: "No experience required, training provided",
      equipment: ["Scrubs provided", "Comfortable shoes"],
      dressCode: "Scrubs (provided), closed-toe shoes",
    },
    applicationDeadline: "2025-07-08T23:59:59.000Z",
    applicants: [
      {
        user: "user_010",
        status: "pending",
        appliedAt: "2025-06-20T15:45:00.000Z",
        timeSlots: ["2025-07-13"],
        coverLetter:
          "I volunteer at the animal shelter and love working with animals.",
      },
    ],
    createdAt: "2025-06-19T14:20:00.000Z",
    updatedAt: "2025-06-20T16:30:00.000Z",
  },
];

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
  // Use hardcoded gigs instead of API calls
  const gigs = HARDCODED_GIGS;
  const gigsLoading = false;
  const gigsError = null;

  // Mock refetch function for UI consistency
  const refetch = async () => {
    toast.success("Gigs refreshed (using hardcoded data)");
  };
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
  const debouncedSearch = useCallback(
    debounce((searchTerm: unknown) => {
      setFilters((prev) => ({ ...prev, search: searchTerm as string }));
    }, 300),
    []
  ); // Filter gigs based on current filters
  const filteredGigs = useMemo(() => {
    return gigs.filter((gig: Gig) => {
      const matchesSearch =
        !filters.search ||
        gig.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (gig.employer?.companyName &&
          gig.employer.companyName
            .toLowerCase()
            .includes(filters.search.toLowerCase())) ||
        gig.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = !filters.status || gig.status === filters.status;
      const matchesEmployer =
        !filters.employer || gig.employer?.companyName === filters.employer;
      const matchesCity = !filters.city || gig.location.city === filters.city;
      const matchesCategory =
        !filters.category || gig.category === filters.category;

      const matchesDeadlineStart =
        !filters.deadlineStart ||
        new Date(gig.applicationDeadline) >= new Date(filters.deadlineStart);
      const matchesDeadlineEnd =
        !filters.deadlineEnd ||
        new Date(gig.applicationDeadline) <= new Date(filters.deadlineEnd);
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
  }, [gigs, filters]); // Extract unique values for filter dropdowns
  const uniqueEmployers = useMemo(
    () => [
      ...new Set(
        gigs.map((gig: Gig) => gig.employer?.companyName).filter(Boolean)
      ),
    ],
    [gigs]
  );
  const uniqueCities = useMemo(
    () => [
      ...new Set(gigs.map((gig: Gig) => gig.location.city).filter(Boolean)),
    ],
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
  }; // Handle status updates with mock functionality for demo
  const handleStatusUpdate = async (gigId: string, newStatus: string) => {
    try {
      toast.loading("Updating gig status...");

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Gig status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update gig status");
    }
  };

  // Handle gig deletion with mock functionality for demo
  const handleDeleteGig = async () => {
    if (!gigToDelete) return;

    try {
      toast.loading("Deleting gig...");

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Gig deleted successfully");

      // Close dialog
      setShowDeleteDialog(false);
      setGigToDelete(null);
    } catch (error) {
      toast.error("Failed to delete gig");
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

    if (payRate.rateType === "hourly" && payRate.amount) {
      return `$${payRate.amount}/hr`;
    } else if (payRate.rateType === "fixed" && payRate.amount) {
      return `$${payRate.amount} fixed`;
    } else if (payRate.rateType === "daily" && payRate.amount) {
      return `$${payRate.amount}/day`;
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
          } catch {
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
              } catch {
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
        </div>
        <Button
          onClick={async () => {
            try {
              toast.loading("Refreshing gigs...", { id: "refresh" });
              await refetch();
              toast.success("Gigs refreshed successfully", { id: "refresh" });
            } catch {
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
            onChange={(value: string) => handleFilterChange("status", value)}
            options={[
              { value: "", label: "All Statuses" },
              ...GIG_STATUSES.map((status) => ({
                value: status,
                label:
                  status.charAt(0).toUpperCase() +
                  status.slice(1).replace("_", " "),
              })),
            ]}
          />
          {/* Category Filter */}
          <Select
            value={filters.category}
            onChange={(value: string) => handleFilterChange("category", value)}
            options={[
              { value: "", label: "All Categories" },
              ...GIG_CATEGORIES.map((category) => ({
                value: category,
                label: category,
              })),
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
              ...uniqueEmployers.map((employer) => ({
                value: employer,
                label: employer,
              })),
            ]}
          />
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
                key={gig._id}
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
                      {gig.status === "cancelled" && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Closed
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="h-4 w-4" />
                        {gig.employer?.companyName || "N/A"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {gig.location.city}
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
                        {gig.timeSlots.reduce(
                          (acc, slot) => acc + slot.peopleAssigned,
                          0
                        )}
                        /
                        {gig.timeSlots.reduce(
                          (acc, slot) => acc + slot.peopleNeeded,
                          0
                        )}
                        filled
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
                    </Sheet>
                    {/* Status Update */}
                    <Select
                      value={gig.status}
                      onChange={(value: string) =>
                        handleStatusUpdate(gig._id, value)
                      }
                      options={GIG_STATUSES.map((status) => ({
                        value: status,
                        label:
                          status.charAt(0).toUpperCase() +
                          status.slice(1).replace("_", " "),
                      }))}
                      className="w-32"
                    />
                    {/* Quick Actions for Draft Status */}
                    {gig.status === "draft" && (
                      <>
                        
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(gig._id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(gig._id)}
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
                      onClick={() => confirmDelete(gig._id)}
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
                      {selectedGig.timeSlots.reduce(
                        (acc, slot) => acc + slot.peopleAssigned,
                        0
                      )}
                      /
                      {selectedGig.timeSlots.reduce(
                        (acc, slot) => acc + slot.peopleNeeded,
                        0
                      )}
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
                      {selectedGig.employer?.companyName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">
                      {selectedGig.employer?.email || "N/A"}
                    </span>
                  </div>
                  {selectedGig.employer?.contactNumber && (
                    <div>
                      <span className="text-gray-600">Contact:</span>
                      <span className="ml-2 font-medium">
                        {selectedGig.employer.contactNumber}
                      </span>
                    </div>
                  )}
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
              </div>{" "}
              {/* Requirements */}
              {(selectedGig.requirements?.skills ||
                selectedGig.requirements?.experience ||
                selectedGig.requirements?.dressCode ||
                selectedGig.requirements?.equipment) && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Requirements</h4>
                    <div className="space-y-3 text-sm">
                      {selectedGig.requirements?.skills && (
                        <div>
                          <span className="text-gray-600">Skills:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {selectedGig.requirements.skills.map(
                              (skill: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                  {skill}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      )}
                      {selectedGig.requirements?.experience && (
                        <div>
                          <span className="text-gray-600">Experience:</span>
                          <span className="ml-2">
                            {selectedGig.requirements.experience}
                          </span>
                        </div>
                      )}
                      {selectedGig.requirements?.dressCode && (
                        <div>
                          <span className="text-gray-600">Dress Code:</span>
                          <span className="ml-2">
                            {selectedGig.requirements.dressCode}
                          </span>
                        </div>
                      )}
                      {selectedGig.requirements?.equipment && (
                        <div>
                          <span className="text-gray-600">Equipment:</span>
                          <span className="ml-2">
                            {selectedGig.requirements.equipment.join(", ")}
                          </span>
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
                </h4>{" "}
                {selectedGig.applicants?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedGig.applicants.map((applicant, index) => (
                      <div
                        key={applicant.user || index}
                        className="bg-gray-50 p-3 rounded-md text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            User ID: {applicant.user}
                          </span>
                          <Badge
                            variant={getStatusVariant(
                              applicant.status === "pending"
                                ? "draft"
                                : applicant.status === "accepted"
                                ? "open"
                                : "cancelled"
                            )}
                          >
                            {applicant.status}
                          </Badge>
                        </div>
                        <div className="text-gray-600 mt-1">
                          Applied: {formatDate(applicant.appliedAt)}
                        </div>
                        {applicant.coverLetter && (
                          <div className="mt-2 text-gray-600 text-xs">
                            <strong>Cover Letter:</strong>{" "}
                            {applicant.coverLetter}
                          </div>
                        )}
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
            </DialogClose>{" "}
            <Button variant="primary" onClick={handleDeleteGig}>
              Delete
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
