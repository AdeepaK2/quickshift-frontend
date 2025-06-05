"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Users,
  Briefcase,
  CheckCircle,
  UserPlus,
  Star,
  Building2,
  Activity,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  Award,
  X,
  Pause,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom colors matching the specified palette
const colors = {
  primary: "#0077B6",
  secondary: "#00B4D8", 
  tertiary: "#90E0EF",
  quaternary: "#CAF0F8",
  background: "#F8FAFC",
  dark: "#03045E",
};

// Types for dashboard data
type DashboardStats = {
  totalUndergraduates: number;
  totalEmployers: number;
  totalGigs: number;
  completedGigs: number;
  newSignupsThisWeek: number;
};

type TopPerformer = {
  id: string;
  name: string;
  rating: number;
  type: "student" | "employer";
  gigsCompleted?: number;
  totalGigs?: number;
};

type RecentActivity = {
  id: string;
  title: string;
  employerName: string;
  status: "open" | "in_progress" | "completed" | "closed";
  postedAt: string;
  location: string;
};

// Mock data for the dashboard
const mockStats: DashboardStats = {
  totalUndergraduates: 1247,
  totalEmployers: 89,
  totalGigs: 342,
  completedGigs: 278,
  newSignupsThisWeek: 23,
};

const mockTopPerformers: TopPerformer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    rating: 4.9,
    type: "student",
    gigsCompleted: 42,
  },
  {
    id: "2",
    name: "Tech Innovations Inc.",
    rating: 4.8,
    type: "employer",
    totalGigs: 28,
  },
];

const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    title: "Event Staff for Summer Festival",
    employerName: "Festival Productions Inc.",
    status: "open",
    postedAt: "2025-06-05T10:30:00",
    location: "Toronto, ON",
  },
  {
    id: "2",
    title: "Campus Tour Guide",
    employerName: "University of Toronto",
    status: "in_progress",
    postedAt: "2025-06-04T15:45:00",
    location: "Toronto, ON",
  },
  {
    id: "3",
    title: "Research Assistant",
    employerName: "Innovation Labs",
    status: "completed",
    postedAt: "2025-06-04T09:20:00",
    location: "Ottawa, ON",
  },
  {
    id: "4",
    title: "Social Media Content Creator",
    employerName: "Creative Media Solutions",
    status: "open",
    postedAt: "2025-06-03T14:15:00",
    location: "Vancouver, BC",
  },
  {
    id: "5",
    title: "Data Entry Clerk",
    employerName: "Global Finance Partners",
    status: "closed",
    postedAt: "2025-06-03T11:30:00",
    location: "Calgary, AB",
  },
];

// Chart data for demonstration (simplified)
const mockSignupData = [
  { week: "Week 1", signups: 45 },
  { week: "Week 2", signups: 52 },
  { week: "Week 3", signups: 48 },
  { week: "Week 4", signups: 61 },
];

const mockGigsByCategory = [
  { category: "Event Staff", count: 89 },
  { category: "Research", count: 67 },
  { category: "Admin", count: 54 },
  { category: "Tech", count: 42 },
  { category: "Marketing", count: 38 },
];

export default function DashboardContent() {
  const pathname = usePathname();
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [topPerformers, setTopPerformers] =
    useState<TopPerformer[]>(mockTopPerformers);
  const [recentActivity, setRecentActivity] =
    useState<RecentActivity[]>(mockRecentActivity);

  // Only render if we're in the admin route
  if (!pathname?.startsWith("/admin")) {
    return null;
  }

  // Format date and time
  const formatDateTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }; // Get status badge variant
  const getStatusVariant = (status: string) => {
    return "default";
  };

  // Get status colors
  const getStatusColors = (status: string) => {
    switch (status) {
      case "open":
        return "bg-[#CAF0F8] text-[#0077B6]";
      case "in_progress":
        return "bg-[#90E0EF] text-[#03045E]";
      case "completed":
        return "bg-[#D1E7DD] text-[#146C43]";
      case "closed":
        return "bg-[#F8D7DA] text-[#842029]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Briefcase className="h-3 w-3" />;
      case "in_progress":
        return <Clock className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "closed":
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "open":
        return "Open";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };  return (
    <div
      className="space-y-8 font-poppins min-h-screen"
      style={{
        backgroundColor: colors.background,
        padding: "2rem",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
          style={{ color: colors.dark }}
        >
          Admin Dashboard
        </h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Separator className="my-6" />{/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Total Users Card */}
        <Card
          className="col-span-1 sm:col-span-2 lg:col-span-2 hover:shadow-lg transition-shadow duration-200 rounded-xl shadow-md"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-semibold leading-tight"
              style={{ color: colors.dark }}
            >
              Total Users
            </CardTitle>
            <Users className="h-4 w-4" style={{ color: colors.primary }} />
          </CardHeader>
          <CardContent>
            <div
              className="text-2xl font-bold tracking-tight"
              style={{ color: colors.primary }}
            >
              {(
                stats.totalUndergraduates + stats.totalEmployers
              ).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Undergraduates:</span>
                <span className="font-semibold">
                  {stats.totalUndergraduates.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Employers:</span>
                <span className="font-semibold">
                  {stats.totalEmployers.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Gigs Posted */}
        <Card
          className="hover:shadow-lg transition-shadow duration-200 rounded-xl shadow-md"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-semibold leading-tight"
              style={{ color: colors.dark }}
            >
              Total Gigs Posted
            </CardTitle>            <Briefcase
              className="h-4 w-4"
              style={{ color: colors.primary }}
            />
          </CardHeader>
          <CardContent>            <div
              className="text-2xl font-bold tracking-tight"
              style={{ color: colors.primary }}
            >
              {stats.totalGigs.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground text-[#0077B6]">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        {/* Gigs Completed */}
        <Card
          className="hover:shadow-lg transition-shadow duration-200 rounded-xl shadow-md"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-semibold leading-tight"
              style={{ color: colors.dark }}
            >
              Gigs Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-[#146C43]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#146C43] tracking-tight">
              {stats.completedGigs.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round((stats.completedGigs / stats.totalGigs) * 100)}%
              completion rate
            </p>
          </CardContent>
        </Card>

        {/* New Signups This Week */}
        <Card
          className="hover:shadow-lg transition-shadow duration-200 rounded-xl shadow-md"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle
              className="text-sm font-semibold leading-tight"
              style={{ color: colors.dark }}
            >
              New Signups This Week
            </CardTitle>
            <UserPlus className="h-4 w-4" style={{ color: colors.primary }} />
          </CardHeader>
          <CardContent>            <div
              className="text-2xl font-bold tracking-tight"
              style={{ color: colors.primary }}
            >
              {stats.newSignupsThisWeek}
            </div>
            <p className="text-sm text-muted-foreground text-[#0077B6]">
              +8% from last week
            </p>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      {/* Top Performers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {" "}
        {/* Top Performers */}
        <Card
          className="hover:shadow-lg transition-shadow duration-200 rounded-xl shadow-md"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-xl font-bold leading-tight tracking-tight"
              style={{ color: colors.dark }}
            >
              <Award className="h-5 w-5" style={{ color: colors.primary }} />
              Top Performers
            </CardTitle>
            <CardDescription className="text-sm">
              Highest-rated users on the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">            {topPerformers.map((performer) => (
              <div
                key={performer.id}
                className="flex items-center justify-between hover:bg-slate-50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback
                      style={{
                        backgroundColor: colors.quaternary,
                        color: colors.dark,
                      }}
                    >
                      {performer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p
                      className="text-sm font-semibold leading-tight"
                      style={{ color: colors.dark }}
                    >
                      {performer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {performer.type === "student" ? "Student" : "Employer"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold">
                      {performer.rating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {performer.type === "student"
                      ? `${performer.gigsCompleted} gigs completed`
                      : `${performer.totalGigs} gigs posted`}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>{" "}
        {/* Recent Activity */}
        <Card
          className="hover:shadow-lg transition-shadow duration-200 rounded-xl shadow-md"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-xl font-bold leading-tight tracking-tight"
              style={{ color: colors.dark }}
            >
              <Activity
                className="h-5 w-5"
                style={{ color: colors.secondary }}
              />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm">
              Latest 5 gigs posted on the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">              {recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start justify-between hover:bg-slate-50 p-3 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-slate-200">
                    <div className="space-y-1 flex-1">
                      <p
                        className="text-sm font-semibold leading-tight"
                        style={{ color: colors.dark }}
                      >
                        {activity.title}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>{activity.employerName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDateTime(activity.postedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold ml-2 ${getStatusColors(
                        activity.status
                      )}`}
                    >
                      {getStatusIcon(activity.status)}
                      {getStatusText(activity.status)}
                    </div>
                  </div>
                  {index < recentActivity.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signups Over Time */}
        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-xl font-bold leading-tight tracking-tight"
              style={{ color: colors.dark }}
            >
              <TrendingUp
                className="h-5 w-5"
                style={{ color: colors.primary }}
              />
              Signups Over Time
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Weekly signup trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSignupData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: colors.dark }}
                  >
                    {data.week}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div
                      className="h-3 rounded-full transition-all duration-300 hover:h-4"
                      style={{
                        backgroundColor: colors.primary,
                        width: `${(data.signups / 65) * 120}px`,
                        minWidth: "30px",
                      }}
                    />
                    <span
                      className="text-sm font-bold min-w-[2rem] text-right"
                      style={{ color: colors.primary }}
                    >
                      {data.signups}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gigs by Category */}
        <Card
          className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
          style={{ borderColor: colors.tertiary }}
        >
          <CardHeader>
            <CardTitle
              className="flex items-center gap-2 text-xl font-bold leading-tight tracking-tight"
              style={{ color: colors.dark }}
            >
              <Briefcase
                className="h-5 w-5"
                style={{ color: colors.secondary }}
              />
              Gigs by Category
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Distribution of gig categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGigsByCategory.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: colors.dark }}
                  >
                    {data.category}
                  </span>
                  <div className="flex items-center space-x-3">                    <div
                      className="h-3 rounded-full transition-all duration-300 hover:h-4"
                      style={{
                        backgroundColor: colors.secondary,
                        width: `${(data.count / 90) * 120}px`,
                        minWidth: "30px",
                      }}
                    />
                    <span
                      className="text-sm font-bold min-w-[2rem] text-right"
                      style={{ color: colors.primary }}
                    >
                      {data.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />      {/* Summary Footer */}
      <Card
        className="rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
        style={{ borderColor: colors.tertiary }}
      >
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-[#146C43]" />
              <span
                className="text-lg font-bold"
                style={{ color: colors.dark }}
              >
                Platform Status: Healthy
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Platform is operating smoothly with{" "}
              <span className="font-bold text-[#0077B6]">
                {((stats.completedGigs / stats.totalGigs) * 100).toFixed(1)}%
              </span>{" "}
              gig completion rate and{" "}
              <span className="font-bold text-[#0077B6]">
                {stats.newSignupsThisWeek}
              </span>{" "}
              new users this week.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
