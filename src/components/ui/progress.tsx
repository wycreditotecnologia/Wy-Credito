import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0–100
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clamped = Math.max(0, Math.min(100, value));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-neutral-200", className)}
        {...props}
      >
        <div
          className="h-2 w-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";