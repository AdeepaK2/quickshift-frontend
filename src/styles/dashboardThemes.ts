export const dashboardThemes = {
  admin: {
    name: 'Admin',
    primary: {
      gradient: 'from-[#023E8A] to-[#0077B6]',
      solid: '#0077B6',
      light: '#90E0EF',
      background: 'bg-blue-50'
    },
    accent: {
      solid: 'bg-[#0077B6] hover:bg-[#005F8A]',
      light: 'bg-blue-100 text-[#023E8A] border-r-4 border-[#0077B6]',
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
      gradient: 'from-[#6A4C93] to-[#8B5A3C]',
      solid: '#6A4C93',
      light: '#C39BD3',
      background: 'bg-purple-50'
    },
    accent: {
      solid: 'bg-[#6A4C93] hover:bg-[#553A73]',
      light: 'bg-purple-100 text-[#6A4C93] border-r-4 border-[#6A4C93]',
      hover: 'hover:bg-purple-50'
    },
    status: {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-purple-100 text-purple-800'
    }
  },
  undergraduate: {
    name: 'Student',
    primary: {
      gradient: 'from-[#16537E] to-[#0077B6]',
      solid: '#16537E',
      light: '#7DD3FC',
      background: 'bg-teal-50'
    },
    accent: {
      solid: 'bg-[#16537E] hover:bg-[#124460]',
      light: 'bg-teal-100 text-[#16537E] border-r-4 border-[#16537E]',
      hover: 'hover:bg-teal-50'
    },
    status: {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-teal-100 text-teal-800'
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
      return `${base} ${theme?.accent.solid || 'bg-blue-600 hover:bg-blue-700'} text-white`;
    case 'secondary':
      return commonStyles.button.secondary;
    case 'danger':
      return commonStyles.button.danger;
    default:
      return base;
  }
};
