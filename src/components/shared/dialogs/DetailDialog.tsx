import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DetailDialogProps {
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
  className?: string;
}

export function DetailDialog({
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
  className,
}: DetailDialogProps) {
  const handleCancel = onCancel || (() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/30 dark:bg-black/30 backdrop-blur-none"
        className={cn(
          "flex flex-col bg-popover backdrop-blur-2xl border border-border w-full sm:max-w-[540px] p-6 rounded-dialog shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] outline-none gap-4",
          className
        )}
      >
        <DialogHeader className="flex flex-col gap-3 pb-4 border-b border-border/40 dark:border-white/10">
          <div className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1 text-left flex-1">
              <DialogTitle className="text-lg font-bold tracking-tight">{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
            
            {/* Header actions (Cancel / Save buttons) */}
            <div className="flex items-center gap-2 shrink-0">
              {showCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="h-8 px-3 rounded-button border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
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
                  className="h-8 px-4 rounded-button bg-primary text-xs text-primary-foreground font-semibold hover:opacity-90 shadow-sm transition-all"
                >
                  {isPending ? "Đang lưu..." : saveLabel}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-1 -mr-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
