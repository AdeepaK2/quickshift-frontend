/**
 * API utility functions for backend communication
 * Centralized API calls with error handling and loading states
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Environment check
const isDevelopment = process.env.NODE_ENV === "development";

// API endpoints configuration
export const API_ENDPOINTS = {
  EMPLOYERS: "/api/employers",
  USERS: "/api/users",
  STUDENTS: "/api/students",
  GIGS: "/api/gigs",
  ANALYTICS: "/api/analytics",
} as const;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface Gig {
  id: string;
  title: string;
  employer: {
    id: string;
    name: string;
    email: string;
  };
  category: string;
  status: "draft" | "open" | "in_progress" | "completed" | "cancelled";
  city: string;
  totalPositions: number;
  filledPositions: number;
  applicationDeadline: string;
  description: string;
  payRate?: {
    type: "hourly" | "fixed" | "daily";
    min?: number;
    max?: number;
    amount?: number;
    currency: string;
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
    postalCode: string;
  };
  skills?: string[];
  experience?: string;
  dressCode?: string;
  equipment?: string;
  isAcceptingApplications: boolean;
  applicants: Array<{
    id: string;
    name: string;
    status: "pending" | "accepted" | "rejected";
    appliedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generic API call function with fallback to local API
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add authentication token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    // Direct backend API call
    const backendUrl = `${API_BASE_URL}${endpoint}`;
    if (isDevelopment) {
      console.log(`API Call: ${requestOptions.method || "GET"} ${backendUrl}`);
    }

    const response = await fetch(backendUrl, requestOptions);

    if (!response.ok) {
      throw new ApiError(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw new ApiError(
      `API request failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Define Employer type here for API typing
export type Employer = {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  location?: string;
  isVerified: boolean;
  verified: boolean;
  ratings: {
    averageRating: number;
    totalReviews: number;
  };
  lastLoginAt?: string;
  profilePicture?: string;
  companyDescription?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Employers API
 */
export const employersApi = {
  getAll: async (): Promise<ApiResponse<Employer[]>> => {
    return apiCall(API_ENDPOINTS.EMPLOYERS);
  },
  getById: async (id: string): Promise<ApiResponse<Employer>> => {
    return apiCall(`${API_ENDPOINTS.EMPLOYERS}/${id}`);
  },
  verify: async (id: string): Promise<ApiResponse<Employer>> => {
    return apiCall(`${API_ENDPOINTS.EMPLOYERS}/${id}/verify`, {
      method: "PATCH",
    });
  },
  suspend: async (id: string): Promise<ApiResponse<Employer>> => {
    return apiCall(`${API_ENDPOINTS.EMPLOYERS}/${id}/suspend`, {
      method: "PATCH",
    });
  },
};

/**
 * Students/Undergraduates API
 */
export type Undergraduate = {
  id: string;
  _id: string;
  profilePicture?: string | null;
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
};

export const studentsApi = {
  getAll: async (): Promise<ApiResponse<Undergraduate[]>> => {
    return apiCall(API_ENDPOINTS.STUDENTS);
  },
  getById: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.STUDENTS}/${id}`);
  },
  verify: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.STUDENTS}/${id}/verify`, {
      method: "PATCH",
    });
  },
  suspend: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.STUDENTS}/${id}/suspend`, {
      method: "PATCH",
    });
  },
};

/**
 * Gigs API
 */
export const gigsApi = {
  getAll: async (): Promise<ApiResponse<Gig[]>> => {
    return apiCall(API_ENDPOINTS.GIGS);
  },
  getById: async (id: string): Promise<ApiResponse<Gig>> => {
    return apiCall(`${API_ENDPOINTS.GIGS}/${id}`);
  },
  update: async (id: string, data: Partial<Gig>): Promise<ApiResponse<Gig>> => {
    return apiCall(`${API_ENDPOINTS.GIGS}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  updateStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<Gig>> => {
    return apiCall(`${API_ENDPOINTS.GIGS}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall(`${API_ENDPOINTS.GIGS}/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Undergraduates API - mapped to backend /api/users
 */
export const undergraduatesApi = {
  getAll: async (): Promise<ApiResponse<Undergraduate[]>> => {
    return apiCall(API_ENDPOINTS.USERS);
  },
  getById: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.USERS}/${id}`);
  },
  verify: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.USERS}/${id}/verify`, {
      method: "PATCH",
    });
  },
  suspend: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.USERS}/${id}/suspend`, {
      method: "PATCH",
    });
  },
  activate: async (id: string): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.USERS}/${id}/verify`, {
      method: "PATCH",
    });
  },
  update: async (id: string, data: Partial<Undergraduate>): Promise<ApiResponse<Undergraduate>> => {
    return apiCall(`${API_ENDPOINTS.USERS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall(`${API_ENDPOINTS.USERS}/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Analytics API
 */
export const analyticsApi = {
  getDashboardStats: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiCall(`${API_ENDPOINTS.ANALYTICS}/dashboard`);
  },
  getUserStats: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiCall(`${API_ENDPOINTS.ANALYTICS}/users`);
  },
  getGigStats: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiCall(`${API_ENDPOINTS.ANALYTICS}/gigs`);
  },
};

// Add ApiError class if referenced
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}
