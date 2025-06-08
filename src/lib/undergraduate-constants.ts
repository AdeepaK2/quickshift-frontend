/**
 * Constants for undergraduate management
 * Centralized configuration to avoid hardcoding values throughout the app
 */

// Filter options that could be fetched from API or configured
export const UNDERGRADUATE_CONSTANTS = {
  // Years of study - these are typically standard across institutions
  YEARS_OF_STUDY: [1, 2, 3, 4, 5] as const,

  VERIFICATION_STATUSES: ["verified", "pending", "rejected"] as const,

  ACCOUNT_STATUSES: ["active", "inactive", "suspended"] as const,

  // Labels for better UX
  LABELS: {
    SEARCH_PLACEHOLDER: "Search by name, email, university, or faculty...",
    ALL_UNIVERSITIES: "All Universities",
    ALL_YEARS: "All Years",
    ALL_STATUSES: "All Statuses",
    SHOWING_RESULTS: "Showing {count} of {total} undergraduates",
    NO_RESULTS_TITLE: "No Undergraduates Found",
    NO_RESULTS_DESCRIPTION:
      "No undergraduate students match your current filter criteria.",
  },

  // Table headers
  TABLE_HEADERS: {
    PROFILE: "Profile",
    FULL_NAME: "Full Name",
    EMAIL: "Email",
    UNIVERSITY: "University",
    YEAR: "Year",
    STUDENT_ID: "Student ID",
    VERIFICATION: "Verification",
    STATUS: "Status",
    ACTIONS: "Actions",
  },

  // Action labels
  ACTIONS: {
    VIEW: "View",
    VERIFY: "Verify",
    SUSPEND: "Suspend",
    ACTIVATE: "Activate",
  },

  // Sheet sections
  SHEET_SECTIONS: {
    PERSONAL_INFO: "Personal Information",
    ACADEMIC_INFO: "Academic Information",
    ACCOUNT_INFO: "Account Information",
    BIO: "Biography",
    SKILLS_INTERESTS: "Skills & Interests",
  },

  // Field labels for detail view
  FIELD_LABELS: {
    PHONE: "Phone Number",
    GENDER: "Gender",
    DATE_OF_BIRTH: "Date of Birth",
    ADDRESS: "Address",
    UNIVERSITY: "University",
    FACULTY: "Faculty",
    YEAR_OF_STUDY: "Year of Study",
    STUDENT_ID_VERIFICATION: "Student ID Verification",
    GPA: "GPA",
    JOIN_DATE: "Join Date",
    LAST_LOGIN: "Last Login",
    VERIFICATION_STATUS: "Verification Status",
  },
} as const;

// Type helpers
export type YearOfStudy =
  (typeof UNDERGRADUATE_CONSTANTS.YEARS_OF_STUDY)[number];
export type VerificationStatus =
  (typeof UNDERGRADUATE_CONSTANTS.VERIFICATION_STATUSES)[number];
export type AccountStatus =
  (typeof UNDERGRADUATE_CONSTANTS.ACCOUNT_STATUSES)[number];
