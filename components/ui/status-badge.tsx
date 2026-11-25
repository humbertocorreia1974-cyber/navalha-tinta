import * as React from "react";
import { cn } from "@/lib/utils";

type Status = "danger" | "warning" | "success" | "neutral";

const STATUS_CLASSES: Record<Status, string> = {
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  neutral: "bg-surface-2 text-fg-muted",
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  status: Status;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status],
        className
      )}
      {...props}
    />
  );
}
