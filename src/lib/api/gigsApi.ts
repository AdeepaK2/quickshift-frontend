/**
 * Gigs API - Centralized API calls for gig management
 * Handles all gig-related API operations with proper error handling
 * Uses environment variable for API base URL configuration
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
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
 * Generic API call function with error handling
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
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const url = `${API_BASE_URL}/api${endpoint}`;
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Gigs API operations
 * All functions follow consistent patterns with proper error handling
 */
export const gigsApi = {
  /**
   * Get all gigs from the backend
   */
  getAll: async (): Promise<ApiResponse<Gig[]>> => {
    return apiCall("/gig-requests");
  },

  /**
   * Get gig by ID
   */
  getById: async (id: string): Promise<ApiResponse<Gig>> => {
    return apiCall(`/gig-requests/${id}`);
  },

  /**
   * Update gig status (approve/reject/change status)
   */
  updateStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<Gig>> => {
    return apiCall(`/gig-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Update gig data
   */
  update: async (id: string, data: Partial<Gig>): Promise<ApiResponse<Gig>> => {
    return apiCall(`/gig-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete gig
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall(`/gig-requests/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Approve gig
   */
  approve: async (id: string): Promise<ApiResponse<Gig>> => {
    return gigsApi.updateStatus(id, "open");
  },

  /**
   * Reject gig
   */
  reject: async (id: string): Promise<ApiResponse<Gig>> => {
    return gigsApi.updateStatus(id, "cancelled");
  },
};

export default gigsApi;
