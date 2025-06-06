export interface Settings {
  // Appearance
  theme: 'light' | 'dark' | 'system';
  language: string;
  
  // Notifications
  emailNotifications: {
    newApplications: boolean;
    jobUpdates: boolean;
    systemUpdates: boolean;
    marketing: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    newApplications: boolean;
    messages: boolean;
  };
  
  // Account
  autoSave: boolean;
  showProfile: boolean;
  
  // Security
  twoFactorAuth: boolean;
  sessionTimeout: number; // in minutes
}