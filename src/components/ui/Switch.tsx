import { ReactNode } from 'react';

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  // Add these new props
  icon?: ReactNode;
  activeColor?: string;
}

export default function Switch({ 
  label, 
  description, 
  checked, 
  onChange,
  icon,
  activeColor = 'bg-blue-600' // Default color
}: SwitchProps) {
  return (
    <label className="flex items-start cursor-pointer">
      <div className="flex-1">
        {label && <span className="font-medium text-gray-900">{label}</span>}
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="relative ml-4">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={() => onChange(!checked)}
        />
        <div className="block w-11 h-6 rounded-full bg-gray-200"></div>
        <div 
          className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? `transform translate-x-5 ${activeColor}` : ''
          }`}
        ></div>
      </div>
    </label>
  );
}