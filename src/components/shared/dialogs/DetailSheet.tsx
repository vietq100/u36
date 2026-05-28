import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  formId?: string; // HTML5 Form ID to bind submit button
  onCancel?: () => void;
  onSave?: () => void; // Optional explicit save handler if formId is not used
  isPending?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  showSave?: boolean;
  showCancel?: boolean;
  children: React.ReactNode;
  extraHeaderContent?: React.ReactNode; // For tabs or other actions in header
  className?: string;
}

export function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  formId,
  onCancel,
  onSave,
  isPending = false,
  saveLabel = "Lưu thay đổi",
  cancelLabel = "Hủy",
  showSave = true,
  showCancel = true,
  children,
  extraHeaderContent,
  className,
}: DetailSheetProps) {
  const handleCancel = onCancel || (() => onOpenChange(false));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className={cn(
          "flex flex-col h-full bg-popover backdrop-blur-2xl border-l border-border w-full sm:max-w-[88vw] p-6 shadow-2xl dark:shadow-[-10px_0_50px_rgba(0,0,0,0.6)]",
          className
        )}
      >
        <SheetHeader className="flex flex-col gap-3 pb-4 border-b border-border/40 dark:border-white/10 mb-4">
          <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1 text-left">
              <SheetTitle className="text-xl font-bold tracking-tight">{title}</SheetTitle>
              {description && <SheetDescription>{description}</SheetDescription>}
            </div>
            
            {/* Header actions (Cancel / Save buttons) */}
            <div className="flex items-center gap-2">
              {showCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="h-9 px-4 rounded-button border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  {cancelLabel}
                </Button>
              )}
              {showSave && (
                <Button
                  type={formId ? "submit" : "button"}
                  form={formId}
                  onClick={formId ? undefined : onSave}
                  disabled={isPending}
                  className="h-9 px-5 rounded-button bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm transition-all"
                >
                  {isPending ? "Đang lưu..." : saveLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Extra content such as Tabs inside the header */}
          {extraHeaderContent && (
            <div className="mt-1">
              {extraHeaderContent}
            </div>
          )}
        </SheetHeader>

        {/* Form Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto mt-2 pr-1 -mr-1">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
