export const dashboardThemes = {
  admin: {
    name: 'Admin',
    primary: {
      gradient: 'from-blue-500 to-purple-600',
      solid: '#3B82F6',
      light: '#DBEAFE',
      background: 'bg-slate-50'
    },
    accent: {
      solid: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
      light: 'bg-blue-100 text-blue-800 border-r-4 border-blue-500',
      hover: 'hover:bg-blue-50'
    },
    status: {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    }
  },
  employer: {
    name: 'Employer',
    primary: {
      gradient: 'from-blue-500 to-purple-600',
      solid: '#3B82F6',
      light: '#DBEAFE',
      background: 'bg-slate-50'
    },
    accent: {
      solid: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
      light: 'bg-blue-100 text-blue-800 border-r-4 border-blue-500',
      hover: 'hover:bg-blue-50'
    },
    status: {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    }
  },
  undergraduate: {
    name: 'Student',
    primary: {
      gradient: 'from-blue-500 to-purple-600',
      solid: '#3B82F6',
      light: '#DBEAFE',
      background: 'bg-slate-50'
    },
    accent: {
      solid: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
      light: 'bg-blue-100 text-blue-800 border-r-4 border-blue-500',
      hover: 'hover:bg-blue-50'
    },
    status: {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    }
  }
};

export const commonStyles = {
  card: 'bg-white rounded-lg shadow-sm border',
  button: {
    primary: 'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
    secondary: 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors',
    danger: 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
  },
  input: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  badge: 'px-2 py-1 text-xs rounded-full font-medium',
  sidebar: {
    width: 'w-64',
    mobileHidden: 'md:translate-x-0 -translate-x-full',
    overlay: 'fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
  }
};

export const getTheme = (userType: 'admin' | 'employer' | 'undergraduate') => {
  return dashboardThemes[userType];
};

export const getButtonClass = (variant: 'primary' | 'secondary' | 'danger', theme?: typeof dashboardThemes.admin) => {
  const base = commonStyles.button.primary;
  
  switch (variant) {
    case 'primary':
      return `${base} ${theme?.accent.solid || 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'} text-white`;
    case 'secondary':
      return commonStyles.button.secondary;
    case 'danger':
      return commonStyles.button.danger;
    default:
      return base;
  }
};
