/**
 * API utility functions for backend communication
 * Centralized API calls with error handling and loading states
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const LOCAL_API_BASE_URL = "/api";

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
    const token = localStorage.getItem("authToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  let response: Response;

  try {
    // Try backend API first
    const backendUrl = `${API_BASE_URL}${endpoint}`;
    if (isDevelopment) {
      console.log(`API Call: ${requestOptions.method || "GET"} ${backendUrl}`);
    }

    response = await fetch(backendUrl, requestOptions);

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }
  } catch (backendError) {
    // Backend failed (network error or HTTP error), try local API
    console.warn(
      `Backend API failed, trying local API...`,
      backendError instanceof Error ? backendError.message : backendError
    );

    try {
      const localUrl = `${LOCAL_API_BASE_URL}${endpoint}`;
      response = await fetch(localUrl, requestOptions);

      if (!response.ok) {
        throw new ApiError(
          `Both backend and local API failed. Local API status: ${response.status}`,
          response.status
        );
      }
    } catch (localError) {
      console.error(`Local API also failed for ${endpoint}:`, localError);
      throw new ApiError(
        `Both backend and local API failed: ${
          localError instanceof Error ? localError.message : "Unknown error"
        }`
      );
    }
  }

  try {
    const data = await response.json();
    return data;
  } catch (parseError) {
    console.error(`Failed to parse response for ${endpoint}:`, parseError);
    throw new ApiError(
      `Failed to parse API response: ${
        parseError instanceof Error
          ? parseError.message
          : "Unknown parsing error"
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
import type { Undergraduate } from "@/lib/api/undergraduateApi";

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
import type { Gig } from "@/lib/api/gigsApi";

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

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
