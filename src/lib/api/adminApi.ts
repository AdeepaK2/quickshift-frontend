/**
 * Admin API - Centralized API calls for admin-specific operations
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Consistent ApiResponse interface
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

// Expected structure from GET /api/admin/dashboard
export interface AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalEmployers: number;
    totalGigs: number;
    activeGigs: number;
    completedGigs: number;
    totalAdmins: number;
  };
  recentActivity: {
    newUsersLastMonth: number;
    newEmployersLastMonth: number;
    newGigsLastMonth: number;
  };
  generatedAt: string;
}

// Add ApiError class if not already defined
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Generic API call function for Admin routes
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

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
    // Admin endpoints are prefixed with /api/admin by the backend router
    const url = `${API_BASE_URL}/api/admin${endpoint}`;
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // If parsing JSON fails, use status text or a generic message
        errorData = {
          message:
            response.statusText ||
            `API request failed with status ${response.status}`,
        };
      }
      throw new ApiError(
        errorData.message ||
          `API request failed with status ${response.status}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for admin endpoint ${endpoint}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown error occurred"
    );
  }
}

/**
 * Admin API operations
 */
export const adminApi = {
  /**
   * Get dashboard statistics from the backend
   * Corresponds to GET /api/admin/dashboard
   */
  getDashboardStats: async (): Promise<ApiResponse<AdminDashboardStats>> => {
    return apiCall<AdminDashboardStats>("/dashboard");
  },
};

export default adminApi;
