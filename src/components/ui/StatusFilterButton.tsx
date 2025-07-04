// Utility for improving button accessibility and visual feedback
// This addresses the issue where status filter buttons (especially "Filled") were hard to click

export const StatusFilterButton = ({ 
  onClick, 
  isActive, 
  children, 
  className = '',
  variant = 'default' 
}: {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'filled' | 'important';
}) => {
  const baseClasses = "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] border-2 relative overflow-hidden touch-manipulation";
  
  const variantClasses = {
    default: isActive 
      ? 'bg-[#0077B6] text-white shadow-md border-[#0077B6]'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm border-transparent',
    filled: isActive
      ? 'bg-blue-600 text-white shadow-lg border-blue-600 transform scale-105'
      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 hover:shadow-md hover:text-blue-800 border-gray-300',
    important: isActive
      ? 'bg-emerald-600 text-white shadow-lg border-emerald-600 transform scale-105'
      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-emerald-50 hover:to-emerald-100 hover:border-emerald-300 hover:shadow-md hover:text-emerald-800 border-gray-300'
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        // Ensure proper touch targets for mobile devices
        minHeight: '44px',
        minWidth: '44px',
      }}
    >
      <span className="relative z-10">{children}</span>
      {!isActive && variant !== 'default' && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
      )}
    </button>
  );
};

export default StatusFilterButton;
