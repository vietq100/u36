import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({ fullScreen = false, className }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background/80 backdrop-blur-sm z-50",
        fullScreen ? "fixed inset-0" : "absolute inset-0",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 animate-spin text-primary"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <span className="text-sm font-medium text-muted-foreground">Đang tải...</span>
      </div>
    </div>
  );
}
