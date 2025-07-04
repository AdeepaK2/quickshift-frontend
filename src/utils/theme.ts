/**
 * Theme utility for consistent styling across all QuickShift dashboards
 */

export const theme = {
  colors: {
    primary: '#0077B6',
    secondary: '#00B4D8', 
    tertiary: '#90E0EF',
    quaternary: '#CAF0F8',
    dark: '#03045E',
    darker: '#02024A',
    bg: '#F8FAFC',
    light: '#E6F3FF',
  },
  
  sidebar: {
    bg: '#03045E',
    text: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    active: '#0077B6',
    hover: '#023E8A',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  
  status: {
    success: {
      bg: '#F0FDF4',
      text: '#065F46',
      border: '#10B981',
    },
    warning: {
      bg: '#EBF8FF',
      text: '#1E40AF',
      border: '#3B82F6',
    },
    error: {
      bg: '#FEF2F2',
      text: '#991B1B',
      border: '#EF4444',
    },
    info: {
      bg: '#F0F9FF',
      text: '#1E40AF',
      border: '#3B82F6',
    },
  },
  
  text: {
    primary: '#1E293B',    // slate-800
    secondary: '#374151',   // gray-700
    muted: '#6B7280',      // gray-500
    light: '#9CA3AF',      // gray-400
  },
};

/**
 * Get consistent CSS classes for different UI elements
 */
export const getThemeClasses = () => ({
  // Sidebar classes
  sidebar: {
    container: 'dashboard-sidebar',
    navItem: 'sidebar-nav-item',
    navItemActive: 'sidebar-nav-item active',
  },
  
  // Card classes
  card: {
    base: 'dashboard-card',
    hover: 'dashboard-card hover:shadow-md',
  },
  
  // Button classes
  button: {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
  },
  
  // Status classes
  status: {
    active: 'status-badge status-active',
    pending: 'status-badge status-pending',
    inactive: 'status-badge status-inactive',
    processing: 'status-badge status-processing',
  },
  
  // Text classes
  text: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted',
    light: 'text-light',
  },
  
  // Form classes
  form: {
    input: 'form-input',
    label: 'form-label',
  },
  
  // Table classes
  table: {
    container: 'dashboard-table',
  },
});

/**
 * Utility function to get status color based on status value
 */
export const getStatusColor = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'active': 'status-active',
    'pending': 'status-pending',
    'inactive': 'status-inactive',
    'processing': 'status-processing',
    'completed': 'status-active',
    'failed': 'status-inactive',
    'success': 'status-active',
    'warning': 'status-pending',
    'error': 'status-inactive',
  };
  
  return statusMap[status.toLowerCase()] || 'status-pending';
};

/**
 * Utility to get consistent dashboard layout classes
 */
export const getDashboardClasses = () => ({
  container: 'dashboard-container',
  mainContent: 'main-content',
  header: 'dashboard-header',
  pageTitle: 'page-title',
  pageSubtitle: 'page-subtitle',
});

export default theme;
