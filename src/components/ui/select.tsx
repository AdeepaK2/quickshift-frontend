import * as React from "react";

export interface SelectProps {
  options: { label: string; value: string | number }[];
  value: string | number;  onChange: (value: string) => void;
  className?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  [key: string]: unknown; // allow other props
}

export default function Select({ options, value, onChange, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
