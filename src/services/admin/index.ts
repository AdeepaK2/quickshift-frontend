// services/admin/index.ts
// Export all admin services for easy importing

// Core admin service
export { default as adminService } from '../adminService';
export type { AdminUser, AdminUserData, AdminEmployerData } from '../adminService';

// Admin settings service
export { default as adminSettingsService } from '../adminSettingsService';
export type { 
  AdminProfile, 
  UpdateAdminProfileRequest, 
  ChangePasswordRequest, 
  AdminPlatformSettings 
} from '../adminSettingsService';

// Admin dashboard service
export { default as adminDashboardService } from '../adminDashboardService';
export type { 
  DashboardStats, 
  Activity, 
  TopPerformer 
} from '../adminDashboardService';

// Admin user management service
export { default as adminUserManagementService } from '../adminUserManagementService';
export type { 
  UserActionRequest, 
  BulkUserActionRequest, 
  UserFilters, 
  UserStats 
} from '../adminUserManagementService';

// Admin employer management service
export { default as adminEmployerManagementService } from '../adminEmployerManagementService';
export type { 
  EmployerActionRequest, 
  EmployerFilters, 
  EmployerStats 
} from '../adminEmployerManagementService';

// Admin gig management service
export { default as adminGigManagementService } from '../adminGigManagementService';
export type { 
  AdminGigData, 
  GigActionRequest, 
  GigFilters, 
  GigStats 
} from '../adminGigManagementService';

// Admin notification service
export { default as adminNotificationService } from '../adminNotificationService';
export type { 
  AdminNotification, 
  CreateNotificationRequest, 
  NotificationFilters, 
  NotificationStats 
} from '../adminNotificationService';

// Re-export auth service for admin authentication
export { authService } from '../authService';
