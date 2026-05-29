import type { InquiryStatusOption } from "../types";

interface InquiryProgressBarProps {
  currentStatusId: number;
  statuses: InquiryStatusOption[];
}

export function InquiryProgressBar({ currentStatusId, statuses }: InquiryProgressBarProps) {
  return (
    <div className="w-full bg-card border border-border/40 rounded-xl p-4 shadow-sm backdrop-blur-md mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative">
        <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-muted -translate-y-1/2 hidden sm:block z-0" />
        {statuses.map((status, index) => {
          const isCurrent = currentStatusId === status.id;
          const isPast = currentStatusId > status.id;
          return (
            <div key={status.id} className="flex flex-col items-center gap-1.5 relative z-10 flex-1 w-full sm:w-auto">
              <div 
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all border shadow-sm ${
                  isCurrent 
                    ? "bg-primary text-primary-foreground border-primary scale-110 shadow-primary/20 ring-4 ring-primary/10" 
                    : isPast 
                      ? "bg-emerald-500 text-emerald-foreground border-emerald-500" 
                      : "bg-background border-border text-muted-foreground"
                }`}
              >
                {isPast ? "✓" : index + 1}
              </div>
              <span className={`text-[10px] font-bold text-center uppercase tracking-wider ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                {status.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
