/**
 * Empty state component for when no data is available
 */

import React from "react";
import { Search, Users, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";

interface EmptyStateProps {
  icon?: "search" | "users" | "briefcase" | React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }

    const iconMap = {
      search: Search,
      users: Users,
      briefcase: Briefcase,
    };

    const IconComponent = iconMap[icon as keyof typeof iconMap];
    return <IconComponent className="h-12 w-12 text-gray-400" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4">{renderIcon()}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
