import Switch from '@/components/ui/Switch';
import { ReactNode } from 'react';

interface EnhancedSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: ReactNode;
  activeColor?: string;
}

export default function EnhancedSwitch({ 
  label, 
  description, 
  checked, 
  onChange, 
  icon,
  activeColor
}: EnhancedSwitchProps) {
  return (
    <div className={`flex items-start ${checked && activeColor ? activeColor + '-content' : ''}`}>
      {icon && (
        <div className="mr-3 mt-0.5">
          {icon}
        </div>
      )}
      <div className="flex-1">
        <Switch
          label={label}
          description={description}
          checked={checked}
          onChange={onChange}
        />
      </div>
    </div>
  );
}