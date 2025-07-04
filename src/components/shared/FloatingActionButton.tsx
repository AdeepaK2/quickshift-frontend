"use client";

import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  className?: string;
}

export default function FloatingActionButton({
  onClick,
  icon: Icon = Plus,
  title = "Quick Action",
  className = ""
}: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={onClick}
        className={`
          bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg 
          transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-200
          ${className}
        `}
        title={title}
      >
        <Icon className="h-6 w-6" />
      </button>
    </div>
  );
}
