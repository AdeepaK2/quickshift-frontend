// Dashboard-related constants and calculations
export const DASHBOARD_CONSTANTS = {
  // Growth rate multipliers for weekly calculations
  STUDENT_WEEKLY_GROWTH_RATE: 0.05, // 5% growth rate
  EMPLOYER_WEEKLY_GROWTH_RATE: 0.03, // 3% growth rate

  // Minimum values for mock calculations
  MIN_WEEKLY_SIGNUPS: 1,

  // Default ratings
  DEFAULT_STUDENT_RATING: 4.5,
  DEFAULT_EMPLOYER_RATING: 4.5,
  DEFAULT_PLATFORM_RATING: 4.8,

  // Default completion rate (as percentage)
  DEFAULT_COMPLETION_RATE: 85,

  // Default completion time
  DEFAULT_COMPLETION_TIME: "72h",
  // Default fallback values for performers
  DEFAULT_SPECIALIZATION: "General",
  DEFAULT_INDUSTRY: "Technology",

  // Default fallback values for gigs/activities
  DEFAULT_GIG_TITLE: "Untitled Gig",
  DEFAULT_COMPANY_NAME: "Unknown Company",
  DEFAULT_LOCATION: "Remote",
  DEFAULT_GIG_STATUS: "pending",
  DEFAULT_BUDGET: 0,
  // Display limits
  MAX_RECENT_ACTIVITIES: 5,

  // Default IDs and indices
  DEFAULT_ID: "1",
  TOP_PERFORMER_INDEX: 0, // Index for selecting top performer (demo purposes)

  // Mock performance metrics for top performers
  MOCK_TOP_STUDENT_RATING: 4.9,
  MOCK_TOP_EMPLOYER_RATING: 4.8,
  MOCK_STUDENT_GIGS_COMPLETED: 24,
  MOCK_EMPLOYER_GIGS_POSTED: 18,
} as const;

// Trend messages - these could be calculated dynamically based on actual data
export const TREND_MESSAGES = {
  users: {
    monthly: "+5% from last month",
    percentage: 5,
    period: "month",
  },
  gigs: {
    weekly: "+10 gigs this week",
    amount: 10,
    period: "week",
  },
  completion: {
    weekly: "+12% from last week",
    percentage: 12,
    period: "week",
  },
  signups: {
    general: "+15% increase",
    percentage: 15,
    period: "general",
  },
} as const;

// Helper functions for dynamic calculations
export const calculateWeeklyGrowth = (
  totalCount: number,
  growthRate: number
): number => {
  return Math.max(
    DASHBOARD_CONSTANTS.MIN_WEEKLY_SIGNUPS,
    Math.floor(totalCount * growthRate)
  );
};

export const calculateCompletionRate = (
  completed: number,
  total: number
): number => {
  return total > 0
    ? Math.round((completed / total) * 100)
    : DASHBOARD_CONSTANTS.DEFAULT_COMPLETION_RATE;
};

export const calculateAverageRating = (
  items: any[],
  ratingProperty: string | ((item: any) => number)
): string => {
  if (!items || items.length === 0)
    return DASHBOARD_CONSTANTS.DEFAULT_PLATFORM_RATING.toString();

  const sum = items.reduce((acc, item) => {
    const rating =
      typeof ratingProperty === "function"
        ? ratingProperty(item)
        : item[ratingProperty] || DASHBOARD_CONSTANTS.DEFAULT_STUDENT_RATING;
    return acc + rating;
  }, 0);

  return (sum / items.length).toFixed(1);
};

export const generateTrendMessage = (
  type: keyof typeof TREND_MESSAGES
): string => {
  const trend = TREND_MESSAGES[type];
  switch (type) {
    case "users":
      return `+${
        (trend as typeof TREND_MESSAGES.users).percentage
      }% from last ${trend.period}`;
    case "gigs":
      return `+${(trend as typeof TREND_MESSAGES.gigs).amount} gigs this ${
        trend.period
      }`;
    case "completion":
      return `+${
        (trend as typeof TREND_MESSAGES.completion).percentage
      }% from last ${trend.period}`;
    case "signups":
      return `+${
        (trend as typeof TREND_MESSAGES.signups).percentage
      }% increase`;
    default:
      return "+0% no change";
  }
};
