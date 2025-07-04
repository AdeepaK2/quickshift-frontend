// services/adminNotificationService.ts
import { ApiResponse } from '@/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: 'all' | 'users' | 'employers' | 'admins';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  scheduledFor?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: 'all' | 'users' | 'employers' | 'admins';
  scheduledFor?: string;
  expiresAt?: string;
  actionUrl?: string;
  actionText?: string;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export interface NotificationFilters {
  type?: 'info' | 'warning' | 'success' | 'error' | 'system';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  recipients?: 'all' | 'users' | 'employers' | 'admins';
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  byPriority: Array<{
    priority: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    sent: number;
    read: number;
  }>;
}

class AdminNotificationService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const url = `${API_BASE_URL}/api/admin${endpoint}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('API Request Error:', error.message);
        throw error;
      } else {
        console.error('Unknown API Error:', error);
        throw new Error('An unexpected error occurred');
      }
    }
  }

  // Get all notifications
  async getAllNotifications(filters?: NotificationFilters): Promise<ApiResponse<{
    notifications: AdminNotification[];
    total: number;
    page: number;
    pages: number;
    unreadCount: number;
  }>> {
    try {
      let queryParams = '';
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
        queryParams = `?${params.toString()}`;
      }
      
      return await this.makeRequest<{
        notifications: AdminNotification[];
        total: number;
        page: number;
        pages: number;
        unreadCount: number;
      }>(`/notifications${queryParams}`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Create new notification
  async createNotification(notificationData: CreateNotificationRequest): Promise<ApiResponse<AdminNotification>> {
    try {
      return await this.makeRequest<AdminNotification>('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notification by ID
  async getNotificationById(id: string): Promise<ApiResponse<AdminNotification>> {
    try {
      return await this.makeRequest<AdminNotification>(`/notifications/${id}`);
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  }

  // Update notification
  async updateNotification(id: string, updates: Partial<CreateNotificationRequest>): Promise<ApiResponse<AdminNotification>> {
    try {
      return await this.makeRequest<AdminNotification>(`/notifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<{ success: boolean; count: number }>> {
    try {
      return await this.makeRequest<{ success: boolean; count: number }>('/notifications/mark-all-read', {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Send notification immediately (for scheduled notifications)
  async sendNotificationNow(id: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await this.makeRequest<{ success: boolean }>(`/notifications/${id}/send-now`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error sending notification immediately:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<ApiResponse<NotificationStats>> {
    try {
      return await this.makeRequest<NotificationStats>('/notifications/stats');
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    title: string;
    message: string;
    type: string;
    priority: string;
  }>>> {
    try {
      return await this.makeRequest<Array<{
        id: string;
        name: string;
        title: string;
        message: string;
        type: string;
        priority: string;
      }>>('/notifications/templates');
    } catch (error) {
      console.error('Error fetching notification templates:', error);
      throw error;
    }
  }

  // Create notification template
  async createNotificationTemplate(template: {
    name: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    variables?: string[];
  }): Promise<ApiResponse<{ id: string; name: string }>> {
    try {
      return await this.makeRequest<{ id: string; name: string }>('/notifications/templates', {
        method: 'POST',
        body: JSON.stringify(template),
      });
    } catch (error) {
      console.error('Error creating notification template:', error);
      throw error;
    }
  }

  // Send system announcement
  async sendSystemAnnouncement(announcement: {
    title: string;
    message: string;
    recipients: 'all' | 'users' | 'employers';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    sendEmail?: boolean;
    sendPush?: boolean;
    expiresAt?: string;
  }): Promise<ApiResponse<{ success: boolean; sentCount: number }>> {
    try {
      return await this.makeRequest<{ success: boolean; sentCount: number }>('/notifications/system-announcement', {
        method: 'POST',
        body: JSON.stringify({
          ...announcement,
          type: 'system',
        }),
      });
    } catch (error) {
      console.error('Error sending system announcement:', error);
      throw error;
    }
  }

  // Bulk delete notifications
  async bulkDeleteNotifications(notificationIds: string[]): Promise<ApiResponse<{
    success: boolean;
    deleted: number;
    failed: number;
  }>> {
    try {
      return await this.makeRequest<{
        success: boolean;
        deleted: number;
        failed: number;
      }>('/notifications/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ notificationIds }),
      });
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      throw error;
    }
  }

  // Get notification delivery status
  async getNotificationDeliveryStatus(id: string): Promise<ApiResponse<{
    totalRecipients: number;
    delivered: number;
    failed: number;
    pending: number;
    deliveryDetails: Array<{
      recipientId: string;
      recipientEmail: string;
      status: 'delivered' | 'failed' | 'pending';
      deliveredAt?: string;
      error?: string;
    }>;
  }>> {
    try {
      return await this.makeRequest<{
        totalRecipients: number;
        delivered: number;
        failed: number;
        pending: number;
        deliveryDetails: Array<{
          recipientId: string;
          recipientEmail: string;
          status: 'delivered' | 'failed' | 'pending';
          deliveredAt?: string;
          error?: string;
        }>;
      }>(`/notifications/${id}/delivery-status`);
    } catch (error) {
      console.error('Error fetching notification delivery status:', error);
      throw error;
    }
  }
}

export const adminNotificationService = new AdminNotificationService();
export default adminNotificationService;
