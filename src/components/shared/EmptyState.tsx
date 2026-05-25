import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed",
        className
      )}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="mt-4 text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
