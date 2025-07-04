import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200/80 border-gray-200", 
        destructive:
          "bg-red-100 text-red-800 hover:bg-red-200/80 border-red-200",
        outline:
          "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-green-100 text-green-800 hover:bg-green-200/80 border-green-200",
        warning:
          "bg-gray-100 text-gray-800 hover:bg-gray-200/80 border-gray-200",
        info: "bg-blue-100 text-blue-800 hover:bg-blue-200/80 border-blue-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
