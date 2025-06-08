/**
 * API utility functions for backend communication
 * Centralized API calls with error handling and loading states
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const LOCAL_API_BASE_URL = "/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ApiError {
  message: string;
  status?: number;
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
  const token = localStorage.getItem("authToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    // Try backend API first
    const backendUrl = `${API_BASE_URL}${endpoint}`;
    let response = await fetch(backendUrl, requestOptions);

    // If backend fails, try local API for development
    if (!response.ok) {
      console.warn(
        `Backend API failed (${response.status}), trying local API...`
      );
      const localUrl = `${LOCAL_API_BASE_URL}${endpoint}`;
      response = await fetch(localUrl, requestOptions);
    }

    if (!response.ok) {
      throw new ApiError(
        `HTTP error! status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Unknown API error"
    );
  }
}

/**
 * Employers API
 */
export const employersApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiCall("/employers");
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/employers/${id}`);
  },

  verify: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/employers/${id}/verify`, {
      method: "PATCH",
    });
  },

  suspend: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/employers/${id}/suspend`, {
      method: "PATCH",
    });
  },
};

/**
 * Students/Undergraduates API
 */
export const studentsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiCall("/students");
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/students/${id}`);
  },

  verify: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/students/${id}/verify`, {
      method: "PATCH",
    });
  },

  suspend: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/students/${id}/suspend`, {
      method: "PATCH",
    });
  },
};

/**
 * Gigs API
 */
export const gigsApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiCall("/gigs");
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/gigs/${id}`);
  },

  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return apiCall(`/gigs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/gigs/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Undergraduates API
 */
export const undergraduatesApi = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    return apiCall("/undergraduates");
  },

  getById: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/undergraduates/${id}`);
  },

  verify: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/undergraduates/${id}/verify`, {
      method: "PATCH",
    });
  },

  suspend: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/undergraduates/${id}/suspend`, {
      method: "PATCH",
    });
  },

  activate: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/undergraduates/${id}/activate`, {
      method: "PATCH",
    });
  },

  update: async (id: string, data: any): Promise<ApiResponse<any>> => {
    return apiCall(`/undergraduates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<ApiResponse<any>> => {
    return apiCall(`/undergraduates/${id}`, {
      method: "DELETE",
    });
  },
};

/**
 * Analytics API
 */
export const analyticsApi = {
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    return apiCall("/analytics/dashboard");
  },

  getUserStats: async (): Promise<ApiResponse<any>> => {
    return apiCall("/analytics/users");
  },

  getGigStats: async (): Promise<ApiResponse<any>> => {
    return apiCall("/analytics/gigs");
  },
};

class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export { ApiError };
