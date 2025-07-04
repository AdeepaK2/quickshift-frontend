// services/paymentService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface PaymentProcessRequest {
  paymentMethod: 'bank_transfer' | 'paypal' | 'stripe' | 'credit_card';
  notes?: string;
}

export interface PaymentProcessResponse {
  invoiceNumber: string;
  totalAmount: number;
  finalAmount: number;
  status: 'processing' | 'completed' | 'failed';
}

class PaymentService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}/api/gig-completions${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        } else if (response.status === 404) {
          throw new Error('The requested resource was not found.');
        } else {
          throw new Error(data.message || `Request failed with status ${response.status}`);
        }
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }

  /**
   * Process payment for a completed gig
   * @param gigCompletionId The ID of the gig completion to process payment for
   * @param paymentData Payment method and optional notes
   * @returns Promise<ApiResponse<PaymentProcessResponse>>
   */
  async processPayment(
    gigCompletionId: string, 
    paymentData: PaymentProcessRequest
  ): Promise<ApiResponse<PaymentProcessResponse>> {
    try {
      if (!gigCompletionId) {
        return {
          success: false,
          message: 'Gig completion ID is required'
        };
      }

      if (!paymentData.paymentMethod) {
        return {
          success: false,
          message: 'Payment method is required'
        };
      }

      return await this.makeRequest<PaymentProcessResponse>(`/${gigCompletionId}/process-payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to process payment. Please try again.'
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while processing payment.'
      };
    }
  }

  /**
   * Get payment details for a specific gig completion
   * @param gigCompletionId The ID of the gig completion
   * @returns Promise<ApiResponse<any>>
   */
  async getPaymentDetails(gigCompletionId: string): Promise<ApiResponse<any>> {
    try {
      if (!gigCompletionId) {
        return {
          success: false,
          message: 'Gig completion ID is required'
        };
      }

      return await this.makeRequest<any>(`/${gigCompletionId}`);
    } catch (error) {
      console.error('Error getting payment details:', error);
      if (error instanceof Error) {
        return {
          success: false,
          message: error.message || 'Failed to get payment details. Please try again.'
        };
      }
      return {
        success: false,
        message: 'An unexpected error occurred while getting payment details.'
      };
    }
  }
}

export const paymentService = new PaymentService();
