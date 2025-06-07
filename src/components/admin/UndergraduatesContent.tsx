"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
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
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// Define types for our user data
type User = {
  id: string;
  profilePicture: string;
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
  accountStatus: "active" | "inactive";
  verificationStatus: "verified" | "pending" | "rejected";
  lastLogin: string;
  bio: string;
};

// Mock data for users
const mockUsers: User[] = [
  {
    id: "1",
    profilePicture: "",
    fullName: "John Doe",
    email: "john.doe@university.edu",
    university: "University of Technology",
    yearOfStudy: 2,
    studentIdVerified: true,
    phoneNumber: "+1234567890",
    faculty: "Computer Science",
    gender: "Male",
    dateOfBirth: "2002-05-15",
    address: "123 Campus Street",
    city: "Tech City",
    postalCode: "12345",
    accountStatus: "active",
    verificationStatus: "verified",
    lastLogin: "2025-05-25T10:30:00",
    bio: "Computer Science student with a passion for web development.",
  },
  {
    id: "2",
    profilePicture: "",
    fullName: "Jane Smith",
    email: "jane.smith@college.edu",
    university: "State University",
    yearOfStudy: 3,
    studentIdVerified: true,
    phoneNumber: "+1987654321",
    faculty: "Engineering",
    gender: "Female",
    dateOfBirth: "2001-08-22",
    address: "456 University Ave",
    city: "College Town",
    postalCode: "54321",
    accountStatus: "active",
    verificationStatus: "verified",
    lastLogin: "2025-05-24T15:45:00",
    bio: "Mechanical Engineering student interested in renewable energy solutions.",
  },
  {
    id: "3",
    profilePicture: "",
    fullName: "Alex Johnson",
    email: "alex.j@education.edu",
    university: "National University",
    yearOfStudy: 1,
    studentIdVerified: false,
    phoneNumber: "+1122334455",
    faculty: "Business",
    gender: "Male",
    dateOfBirth: "2003-02-10",
    address: "789 Student Road",
    city: "Campus City",
    postalCode: "67890",
    accountStatus: "active",
    verificationStatus: "pending",
    lastLogin: "2025-05-23T09:15:00",
    bio: "First-year business student looking to gain experience in finance.",
  },
  {
    id: "4",
    profilePicture: "",
    fullName: "Sarah Williams",
    email: "sarah.w@institute.edu",
    university: "Technical Institute",
    yearOfStudy: 4,
    studentIdVerified: true,
    phoneNumber: "+1565758595",
    faculty: "Arts",
    gender: "Female",
    dateOfBirth: "2000-11-30",
    address: "101 Creative Blvd",
    city: "Art Town",
    postalCode: "13579",
    accountStatus: "inactive",
    verificationStatus: "verified",
    lastLogin: "2025-05-20T14:20:00",
    bio: "Graphic design student with experience in digital art and UI/UX design.",
  },
  {
    id: "5",
    profilePicture: "",
    fullName: "Michael Brown",
    email: "michael.b@academia.edu",
    university: "University of Technology",
    yearOfStudy: 2,
    studentIdVerified: false,
    phoneNumber: "+1243546576",
    faculty: "Science",
    gender: "Male",
    dateOfBirth: "2002-07-14",
    address: "222 Lab Street",
    city: "Science Park",
    postalCode: "24680",
    accountStatus: "active",
    verificationStatus: "rejected",
    lastLogin: "2025-05-22T11:10:00",
    bio: "Physics student interested in quantum mechanics and theoretical physics.",
  },
  {
    id: "6",
    profilePicture: "",
    fullName: "Emily Rodriguez",
    email: "emily.r@state.edu",
    university: "State University",
    yearOfStudy: 3,
    studentIdVerified: false,
    phoneNumber: "+1876543219",
    faculty: "Psychology",
    gender: "Female",
    dateOfBirth: "2001-12-03",
    address: "505 University Plaza",
    city: "College Town",
    postalCode: "67345",
    accountStatus: "active",
    verificationStatus: "rejected",
    lastLogin: "2025-05-21T13:25:00",
    bio: "Psychology student researching cognitive behavioral patterns in young adults.",
  },
];

// Universities for the filter
const universities = [
  "All Universities",
  "University of Technology",
  "State University",
  "National University",
  "Technical Institute",
];

// Years of study for the filter
const yearsOfStudy = [1, 2, 3, 4, 5];

// Verification statuses for the filter
const verificationStatuses = ["verified", "pending", "rejected"];

export default function UsersContent() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("All Universities");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [verificationFilter, setVerificationFilter] = useState<string | null>(
    null
  );

  // Function to handle filtering
  useEffect(() => {
    let filteredUsers = mockUsers;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Filter by university
    if (universityFilter && universityFilter !== "All Universities") {
      filteredUsers = filteredUsers.filter(
        (user) => user.university === universityFilter
      );
    }

    // Filter by year of study
    if (yearFilter !== null) {
      filteredUsers = filteredUsers.filter(
        (user) => user.yearOfStudy === yearFilter
      );
    }

    // Filter by verification status
    if (verificationFilter) {
      filteredUsers = filteredUsers.filter(
        (user) => user.verificationStatus === verificationFilter
      );
    }

    setUsers(filteredUsers);
  }, [searchQuery, universityFilter, yearFilter, verificationFilter]);

  // Function to handle user selection for detail view
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  // Helper function to format date strings
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    if (dateString.includes("T")) {
      // For datetime format (last login)
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } else {
      // For date-only format (DOB)
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    }
  };

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">University</label>
            <Select
              value={universityFilter}
              onValueChange={(value) => setUniversityFilter(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select University" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
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
              value={yearFilter?.toString() || "all"}
              onValueChange={(value) =>
                setYearFilter(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>{" "}
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearsOfStudy.map((year) => (
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
              value={verificationFilter || "all"}
              onValueChange={(value) =>
                setVerificationFilter(value === "all" ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>{" "}
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {verificationStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>{" "}
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Avatar>
                        <AvatarImage
                          src={user.profilePicture}
                          alt={user.fullName}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {user.fullName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>{" "}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.university}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Year {user.yearOfStudy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.studentIdVerified ? "success" : "warning"}
                      >
                        {user.studentIdVerified ? "Verified" : "Not Verified"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          user.verificationStatus === "verified"
                            ? "success"
                            : user.verificationStatus === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {user.verificationStatus.charAt(0).toUpperCase() +
                          user.verificationStatus.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedUser && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>User Details</SheetTitle>
                <SheetDescription>
                  Comprehensive information about the selected user
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* User Profile Header */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedUser.profilePicture}
                      alt={selectedUser.fullName}
                    />
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                      {selectedUser.fullName
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedUser.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </p>
                    <div className="mt-1 flex items-center space-x-2">
                      <Badge
                        variant={
                          selectedUser.accountStatus === "active"
                            ? "success"
                            : "destructive"
                        }
                      >
                        {selectedUser.accountStatus === "active"
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                      <Badge
                        variant={
                          selectedUser.verificationStatus === "verified"
                            ? "success"
                            : selectedUser.verificationStatus === "pending"
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {selectedUser.verificationStatus
                          .charAt(0)
                          .toUpperCase() +
                          selectedUser.verificationStatus.slice(1)}
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
                        <p>{selectedUser.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Gender
                        </p>
                        <p>{selectedUser.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Date of Birth
                        </p>
                        <p>{formatDate(selectedUser.dateOfBirth)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Address
                        </p>
                        <p>
                          {selectedUser.address}, {selectedUser.city},{" "}
                          {selectedUser.postalCode}
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
                        <p>{selectedUser.university}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <BookOpen className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Faculty
                        </p>
                        <p>{selectedUser.faculty}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Academic Email
                        </p>
                        <p>{selectedUser.email}</p>
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
                            selectedUser.studentIdVerified
                              ? "success"
                              : "warning"
                          }
                        >
                          {selectedUser.studentIdVerified
                            ? "Verified"
                            : "Not Verified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Account Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Account Information</h4>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Last Login
                        </p>
                        <p>{formatDate(selectedUser.lastLogin)}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Verification Status
                        </p>
                        <Badge
                          variant={
                            selectedUser.verificationStatus === "verified"
                              ? "success"
                              : selectedUser.verificationStatus === "pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {selectedUser.verificationStatus
                            .charAt(0)
                            .toUpperCase() +
                            selectedUser.verificationStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Bio */}
                <div className="space-y-2">
                  <h4 className="text-lg font-medium">Biography</h4>
                  <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
