"use client";

import {
  Users,
  Briefcase,
  CheckCircle,
  UserPlus,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
// Corrected imports for UI components - assuming default exports based on typical usage
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CardContent from "@/components/ui/CardContent";
import CardDescription from "@/components/ui/CardDescription";
import CardHeader from "@/components/ui/CardHeader";
import CardTitle from "@/components/ui/CardTitle";
// Assuming Table components are structured similarly or need specific imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Keep if path is correct
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Keep if path is correct

import { useEffect, useMemo, useState } from "react";
import { useApi } from "@/lib/hooks";
// Corrected paths for API modules - assuming they are in src/lib/api/
import {
  undergraduatesApi,
  type Undergraduate,
} from "@/lib/api/undergraduateApi";
import { employersApi, type Employer } from "@/lib/api/employerApi";
import { gigsApi, type Gig } from "@/lib/api/gigsApi";
import {
  adminApi,
  type AdminDashboardStats,
  type ApiError as AdminApiError,
} from "@/lib/api/adminApi";
import {
  DASHBOARD_CONSTANTS,
  calculateWeeklyGrowth,
  calculateCompletionRate,
  generateTrendMessage,
} from "@/lib/dashboard-constants";
import { formatDate, getStatusVariant } from "@/lib/utils";
// Corrected paths for custom components - assuming they are in src/components/
import { LoadingState } from "@/components/ui/loading"; // Updated import
import { ErrorState as ErrorDisplay } from "@/components/ui/error-state"; // Updated import
import { ConnectionTestPanel } from "./ConnectionTestPanel";

// TypeScript interfaces
interface TopPerformer {
  type: "student" | "employer";
  id: string;
  name: string;
  rating: number;
  gigsCompleted?: number;
  gigsPosted?: number;
  specialization?: string;
  industry?: string;
}

interface RecentActivityItem {
  id: string;
  title: string;
  company: string;
  location: string;
  date: string;
  status:
    | "completed"
    | "in_progress"
    | "pending"
    | "cancelled"
    | "active"
    | "open"
    | "draft";
  payment: string;
}

export default function DashboardContent() {
  const [lastUpdated, setLastUpdated] = useState("");

  // Assuming useApi returns an object like { data, loading, error, refetch }
  // And 'data' is the actual data payload (e.g., Gig[], Employer[], AdminDashboardStats)
  const {
    data: undergraduatesData,
    loading: undergraduatesLoading,
    error: undergraduatesError,
    refetch: refetchUndergraduates,
  } = useApi<Undergraduate[]>(() => undergraduatesApi.getAll(), []);

  const {
    data: employersData,
    loading: employersLoading,
    error: employersError,
    refetch: refetchEmployers,
  } = useApi<Employer[]>(() => employersApi.getAll(), []);

  const {
    data: gigsData,
    loading: gigsLoading,
    error: gigsError,
    refetch: refetchGigs,
  } = useApi<Gig[]>(() => gigsApi.getAll(), []);

  const {
    data: adminStatsData,
    loading: adminStatsLoading,
    error: adminStatsError,
    refetch: refetchAdminStats,
  } = useApi<AdminDashboardStats>(() => adminApi.getDashboardStats(), []);

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const stats = useMemo(() => {
    const currentUndergraduates = undergraduatesData || [];
    const currentEmployers = employersData || [];
    const currentGigs = gigsData || [];

    const totalStudents = adminStatsData?.overview?.totalUsers
      ? currentUndergraduates.length
      : currentUndergraduates.length;
    const totalEmployers = adminStatsData?.overview?.totalUsers
      ? currentEmployers.length
      : currentEmployers.length;

    const totalUsers =
      adminStatsData?.overview?.totalUsers ?? totalStudents + totalEmployers;
    const totalGigs = adminStatsData?.overview?.totalGigs ?? currentGigs.length;
    const activeGigs =
      adminStatsData?.overview?.activeGigs ??
      currentGigs.filter(
        (gig: Gig) => gig.status === "open" || gig.status === "in_progress"
      ).length;
    const completedGigs =
      adminStatsData?.overview?.completedGigs ??
      currentGigs.filter((gig: Gig) => gig.status === "completed").length;

    const newSignupsThisMonth =
      adminStatsData?.recentActivity?.newUsersLastMonth ??
      (calculateWeeklyGrowth(
        totalStudents,
        DASHBOARD_CONSTANTS.STUDENT_WEEKLY_GROWTH_RATE
      ) +
        calculateWeeklyGrowth(
          totalEmployers,
          DASHBOARD_CONSTANTS.EMPLOYER_WEEKLY_GROWTH_RATE
        )) *
        4; // Approximate month from weekly

    const newStudentsThisMonth =
      adminStatsData?.recentActivity?.newUsersLastMonth && totalUsers > 0
        ? Math.round(newSignupsThisMonth * (totalStudents / totalUsers))
        : calculateWeeklyGrowth(
            totalStudents,
            DASHBOARD_CONSTANTS.STUDENT_WEEKLY_GROWTH_RATE
          ) * 4;

    const newEmployersThisMonth =
      adminStatsData?.recentActivity?.newEmployersLastMonth ??
      calculateWeeklyGrowth(
        totalEmployers,
        DASHBOARD_CONSTANTS.EMPLOYER_WEEKLY_GROWTH_RATE
      ) * 4;

    return [
      {
        title: "Total Users",
        value: totalUsers.toString(),
        subtitle: `${totalStudents} Students • ${totalEmployers} Employers`,
        trend: generateTrendMessage("users"),
        trendPositive: true,
        Icon: Users,
        iconColor: "text-blue-500",
        bgColor: "bg-blue-50",
      },
      {
        title: "Total Gigs Posted",
        value: totalGigs.toString(),
        subtitle: `Active: ${activeGigs} • Completed: ${completedGigs}`,
        trend: generateTrendMessage("gigs"),
        trendPositive: true,
        Icon: Briefcase,
        iconColor: "text-green-500",
        bgColor: "bg-green-50",
      },
      {
        title: "Gigs Completed",
        value: completedGigs.toString(),
        subtitle: `${calculateCompletionRate(
          completedGigs,
          totalGigs
        )}% completion rate`,
        trend: generateTrendMessage("completion"),
        trendPositive: true,
        Icon: CheckCircle,
        iconColor: "text-purple-500",
        bgColor: "bg-purple-50",
      },
      {
        title: "New Signups This Month",
        value: newSignupsThisMonth.toString(),
        subtitle: `${newStudentsThisMonth} Students • ${newEmployersThisMonth} Employers`,
        trend: generateTrendMessage("signups"),
        trendPositive: true,
        Icon: UserPlus,
        iconColor: "text-orange-500",
        bgColor: "bg-orange-50",
      },
    ];
  }, [adminStatsData, undergraduatesData, employersData, gigsData]);

  const topPerformers = useMemo(() => {
    const performers: TopPerformer[] = [];
    const currentUndergraduates = undergraduatesData || [];
    const currentEmployers = employersData || [];

    if (currentUndergraduates.length > 0) {
      const topStudent = currentUndergraduates[
        DASHBOARD_CONSTANTS.TOP_PERFORMER_INDEX
      ] as Undergraduate | undefined;
      if (topStudent) {
        performers.push({
          type: "student",
          id: topStudent.id || DASHBOARD_CONSTANTS.DEFAULT_ID,
          name: `${topStudent.firstName || "Top"} ${
            topStudent.lastName || "Student"
          }`,
          rating: DASHBOARD_CONSTANTS.MOCK_TOP_STUDENT_RATING, // Replace with actual if available: topStudent.averageRating
          gigsCompleted: DASHBOARD_CONSTANTS.MOCK_STUDENT_GIGS_COMPLETED, // Replace with actual
          specialization:
            topStudent.skills?.[0] ||
            DASHBOARD_CONSTANTS.DEFAULT_SPECIALIZATION, // Example from skills
        });
      }
    }

    if (currentEmployers.length > 0) {
      const topEmployer = currentEmployers[
        DASHBOARD_CONSTANTS.TOP_PERFORMER_INDEX
      ] as Employer | undefined;
      if (topEmployer) {
        performers.push({
          type: "employer",
          id: topEmployer.id || DASHBOARD_CONSTANTS.DEFAULT_ID,
          name: topEmployer.companyName || "Top Employer",
          rating: DASHBOARD_CONSTANTS.MOCK_TOP_EMPLOYER_RATING, // Replace with actual: topEmployer.averageRating
          gigsPosted: DASHBOARD_CONSTANTS.MOCK_EMPLOYER_GIGS_POSTED, // Replace with actual
          industry:
            topEmployer.industry || DASHBOARD_CONSTANTS.DEFAULT_INDUSTRY,
        });
      }
    }
    return performers;
  }, [undergraduatesData, employersData]);

  const recentActivity: RecentActivityItem[] = useMemo(() => {
    const currentGigs = gigsData || [];
    return currentGigs
      .slice(0, DASHBOARD_CONSTANTS.MAX_RECENT_ACTIVITIES)
      .map((gig: Gig) => ({
        id: gig.id || Math.random().toString(),
        title: gig.title || DASHBOARD_CONSTANTS.DEFAULT_GIG_TITLE,
        company: gig.employer?.name || DASHBOARD_CONSTANTS.DEFAULT_COMPANY_NAME,
        location:
          typeof gig.location === "string"
            ? gig.location
            : gig.location?.city || DASHBOARD_CONSTANTS.DEFAULT_LOCATION,
        date: formatDate(gig.createdAt || new Date().toISOString()),
        status: gig.status || DASHBOARD_CONSTANTS.DEFAULT_GIG_STATUS,
        payment: `$${
          gig.payRate?.amount ||
          gig.payRate?.min ||
          DASHBOARD_CONSTANTS.DEFAULT_BUDGET
        }`,
      }));
  }, [gigsData]);

  const getStatusBadge = (status: RecentActivityItem["status"]) => {
    const variant = getStatusVariant(status);
    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchUndergraduates(),
        refetchEmployers(),
        refetchGigs(),
        refetchAdminStats(),
      ]);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
    }
  };

  if (
    undergraduatesLoading ||
    employersLoading ||
    gigsLoading ||
    adminStatsLoading
  ) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  // Check if there are any errors
  const hasErrors = [
    undergraduatesError,
    employersError,
    gigsError,
    adminStatsError,
  ].some((error) => error !== null);

  if (hasErrors) {
    return (
      <ErrorDisplay
        title="Error Loading Dashboard"
        message="There was an issue fetching some of the dashboard data. Please try refreshing."
      />
    );
  }

  return (
    <div className="space-y-6">
      {process.env.NODE_ENV === "development" && <ConnectionTestPanel />}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-2 sm:mt-0 flex items-center gap-4">
          <p className="text-sm text-gray-600">Last updated: {lastUpdated}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border-none`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.title}
              </CardTitle>
              <stat.Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <p className="text-xs text-gray-600">{stat.subtitle}</p>
              {stat.trend && (
                <p
                  className={`text-xs mt-1 ${
                    stat.trendPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.trend}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Gig Activity</CardTitle>
            <CardDescription>
              Overview of the latest gig postings and statuses.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {recentActivity.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activityItem: RecentActivityItem) => (
                    <TableRow key={activityItem.id}>
                      <TableCell className="font-medium">
                        {activityItem.title}
                      </TableCell>
                      <TableCell>{activityItem.company}</TableCell>
                      <TableCell>{activityItem.date}</TableCell>
                      <TableCell>
                        {getStatusBadge(activityItem.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        {activityItem.payment}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500">
                No recent gig activity to display.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>
              Students and employers with notable contributions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.length > 0 ? (
              topPerformers.map((performer) => (
                <div
                  key={performer.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md"
                >
                  <div
                    className={`p-2 rounded-full ${
                      performer.type === "student"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {performer.type === "student" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <Briefcase className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {performer.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.type === "student"
                        ? `${performer.gigsCompleted} gigs completed`
                        : `${performer.gigsPosted} gigs posted`}
                      {" • "}Rating: {performer.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No top performers data available yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
