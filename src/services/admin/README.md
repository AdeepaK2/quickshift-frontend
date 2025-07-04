# Admin Services Integration Guide

This guide explains how to use the admin services to connect all admin functionality with the backend API.

## Overview

The admin services provide a comprehensive interface for managing all aspects of the QuickShift platform from the admin panel. All services are properly typed with TypeScript and follow consistent patterns for error handling and data management.

## Available Services

### 1. Admin Settings Service (`adminSettingsService`)
Handles admin profile management and platform settings.

**Features:**
- Get/update admin profile
- Change password 
- Send password reset emails
- Manage platform settings (maintenance mode, notifications, etc.)
- Two-factor authentication management

**Usage:**
```typescript
import { adminSettingsService } from '@/services/adminSettingsService';

// Get current admin profile
const profile = await adminSettingsService.getCurrentAdminProfile();

// Update profile
await adminSettingsService.updateAdminProfile({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});

// Change password
await adminSettingsService.changePassword({
  currentPassword: 'oldpass',
  newPassword: 'newpass',
  confirmPassword: 'newpass'
});
```

### 2. Admin Dashboard Service (`adminDashboardService`)
Provides comprehensive dashboard statistics and metrics.

**Features:**
- Dashboard overview statistics
- Recent activities tracking
- Top performers data
- Platform health metrics
- Data export functionality

**Usage:**
```typescript
import { adminDashboardService } from '@/services/adminDashboardService';

// Get dashboard stats
const stats = await adminDashboardService.getDashboardStats('month');

// Get recent activities
const activities = await adminDashboardService.getRecentActivities(1, 10);

// Export dashboard data
const exportUrl = await adminDashboardService.exportDashboardData('excel', 'month');
```

### 3. Admin User Management Service (`adminUserManagementService`)
Complete user management functionality for admins.

**Features:**
- List all users with filtering and pagination
- User activation/deactivation
- User verification
- Bulk user operations
- User statistics and analytics
- Export user data
- Send notifications to users

**Usage:**
```typescript
import { adminUserManagementService } from '@/services/adminUserManagementService';

// Get all users with filters
const users = await adminUserManagementService.getAllUsers({
  search: 'john',
  university: 'MIT',
  isActive: true,
  page: 1,
  limit: 20
});

// Activate a user
await adminUserManagementService.activateUser({
  userId: 'user123',
  reason: 'Account verified',
  notifyUser: true
});

// Bulk operations
await adminUserManagementService.bulkUserAction({
  userIds: ['user1', 'user2'],
  action: 'activate',
  notifyUsers: true
});
```

### 4. Admin Employer Management Service (`adminEmployerManagementService`)
Comprehensive employer management functionality.

**Features:**
- List all employers with filtering
- Employer activation/deactivation
- Employer verification
- Employer statistics
- Export employer data
- View employer gig history
- Send notifications to employers

**Usage:**
```typescript
import { adminEmployerManagementService } from '@/services/adminEmployerManagementService';

// Get all employers
const employers = await adminEmployerManagementService.getAllEmployers({
  industry: 'Tech',
  isVerified: true,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Verify employer
await adminEmployerManagementService.verifyEmployer({
  employerId: 'emp123',
  reason: 'Documents verified',
  notifyEmployer: true
});
```

### 5. Admin Gig Management Service (`adminGigManagementService`)
Complete gig management and moderation tools.

**Features:**
- List all gigs with filtering
- Update gig status
- Flag/unflag inappropriate gigs
- View gig applications
- Gig analytics and statistics
- Export gig data
- Bulk gig operations

**Usage:**
```typescript
import { adminGigManagementService } from '@/services/adminGigManagementService';

// Get all gigs
const gigs = await adminGigManagementService.getAllGigs({
  status: 'active',
  paymentAmountMin: 100,
  flagged: false
});

// Update gig status
await adminGigManagementService.updateGigStatus('gig123', 'closed', 'Project completed');

// Flag a gig
await adminGigManagementService.flagGig({
  gigId: 'gig123',
  flag: true,
  flagReason: 'Inappropriate content',
  notifyEmployer: true
});
```

### 6. Admin Notification Service (`adminNotificationService`)
System-wide notification management.

**Features:**
- Create and send notifications
- Manage notification templates
- System announcements
- Notification scheduling
- Delivery status tracking
- Bulk notification operations

**Usage:**
```typescript
import { adminNotificationService } from '@/services/adminNotificationService';

// Send system announcement
await adminNotificationService.sendSystemAnnouncement({
  title: 'Platform Maintenance',
  message: 'Scheduled maintenance on Sunday',
  recipients: 'all',
  priority: 'high',
  sendEmail: true
});

// Create notification
await adminNotificationService.createNotification({
  title: 'New Feature Released',
  message: 'Check out our new gig matching algorithm',
  type: 'info',
  priority: 'medium',
  recipients: 'users'
});
```

## Integration in Components

### Basic Pattern
All admin components should follow this pattern:

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { adminServiceName } from '@/services/admin';
import toast from 'react-hot-toast';

export default function AdminComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await adminServiceName.getData();
        
        if (response.success && response.data) {
          setData(response.data);
        } else {
          throw new Error(response.message || 'Failed to load data');
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAction = async () => {
    try {
      const response = await adminServiceName.performAction();
      if (response.success) {
        toast.success('Action completed successfully');
        // Refresh data if needed
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

### Error Handling
All services include comprehensive error handling:

```typescript
try {
  const response = await adminService.someMethod();
  if (response.success && response.data) {
    // Handle success
    setData(response.data);
    toast.success(response.message || 'Operation successful');
  } else {
    throw new Error(response.message || 'Operation failed');
  }
} catch (error) {
  console.error('Service error:', error);
  toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
}
```

### Loading States
Manage loading states consistently:

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAsyncOperation = async () => {
  setIsLoading(true);
  try {
    await adminService.performOperation();
  } finally {
    setIsLoading(false);
  }
};
```

## Backend Integration

All admin services connect directly to the backend API endpoints without any intermediate local API routes. This ensures:
- **Real-time data**: Direct connection to the actual backend database
- **Consistent behavior**: No discrepancies between local mock data and production data
- **Better performance**: Eliminates unnecessary routing layers
- **Simplified architecture**: Direct service-to-backend communication

### Backend API Endpoints

The services connect to these backend endpoints:

### Admin Routes (`/api/admin/`)
- `GET /` - Get all admins
- `POST /` - Create admin
- `GET /:id` - Get admin by ID
- `PATCH /:id` - Update admin
- `DELETE /:id` - Delete admin
- `GET /dashboard` - Dashboard stats
- `GET /users` - Get all users
- `GET /employers` - Get all employers

### User Management Routes (`/api/admin/users/`)
- `GET /` - List users with filters
- `GET /:id` - Get user details
- `PATCH /:id/activate` - Activate user
- `PATCH /:id/deactivate` - Deactivate user
- `PATCH /:id/verify` - Verify user
- `DELETE /:id` - Delete user
- `POST /bulk-action` - Bulk operations
- `GET /stats` - User statistics

### Similar patterns for employers (`/api/admin/employers/`), gigs (`/api/admin/gigs/`), and notifications (`/api/admin/notifications/`)

**Note**: All API calls go directly to the backend server. No local API routes are used to ensure data consistency and real-time updates.

## Configuration

Set your API base URL in environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Authentication

All services automatically include the JWT token from localStorage:
- Token is included in Authorization header
- Services handle 401 errors for expired tokens
- Automatic token refresh (if implemented in authService)

## Type Safety

All services are fully typed with TypeScript:
- Request/response interfaces
- Filter and parameter types
- Error handling types
- Consistent ApiResponse<T> wrapper

## Best Practices

1. **Always handle errors gracefully**
2. **Show loading states during async operations**
3. **Use toast notifications for user feedback**
4. **Validate data before sending to services**
5. **Use TypeScript types for better development experience**
6. **Cache data when appropriate to reduce API calls**
7. **Implement proper pagination for large datasets**

## Example Implementation

See `AdminDashboardExample.tsx` for a complete example of integrating multiple admin services in a single component.

This comprehensive service layer provides everything needed to build a fully functional admin panel that integrates seamlessly with the backend API.
