interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export default function Switch({ checked, onChange, label, description }: SwitchProps) {
  if (label || description) {
    return (
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {label && (
            <h4 className="text-sm font-medium text-gray-900 mb-1">{label}</h4>
          )}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
        <div className="relative inline-block w-11 h-6 cursor-pointer ml-4" onClick={() => onChange(!checked)}>
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={() => onChange(!checked)}
          />
          <div className={`block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div 
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
              checked ? 'transform translate-x-5' : ''
            }`}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block w-11 h-6 cursor-pointer" onClick={() => onChange(!checked)}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={() => onChange(!checked)}
      />
      <div className={`block w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
      <div 
        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? 'transform translate-x-5' : ''
        }`}
      ></div>
    </div>
  );
}