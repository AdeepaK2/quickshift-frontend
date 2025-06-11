/**
 * Shared error state component with retry functionality
 */

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "./button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
    >
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
