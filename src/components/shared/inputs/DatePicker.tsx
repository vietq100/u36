import * as React from "react"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const DatePicker = React.forwardRef<HTMLInputElement, Omit<React.ComponentProps<"input">, "type">>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative w-full group">
        <input
          type="date"
          ref={ref}
          className={cn(
            "h-8 w-full min-w-0 rounded-input border border-border bg-input pl-2.5 pr-8 py-1 text-base transition-all outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/40 md:text-sm transition-all duration-200 cursor-pointer scheme-light dark:scheme-dark",
            className
          )}
          {...props}
        />
        <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-foreground transition-colors" />
      </div>
    )
  }
)
DatePicker.displayName = "DatePicker"

export { DatePicker }
