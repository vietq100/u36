import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  formId?: string; // HTML5 Form ID to bind submit button
  onCancel?: () => void;
  onSave?: () => void; // Optional explicit save handler if formId is not used
  isPending?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  showSave?: boolean;
  showCancel?: boolean;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function ActionModal({
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
  maxWidth = "md",
  className,
}: ActionModalProps) {
  const handleCancel = onCancel || (() => onOpenChange(false));

  const maxWidthClasses = {
    sm: "sm:max-w-[380px]",
    md: "sm:max-w-[440px]",
    lg: "sm:max-w-[540px]",
    xl: "sm:max-w-[640px]",
    "2xl": "sm:max-w-[760px]",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        overlayClassName="bg-black/30 dark:bg-black/30 backdrop-blur-none"
        className={cn(
          "flex flex-col bg-popover backdrop-blur-2xl border border-border w-full p-6 rounded-dialog shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] outline-none gap-4",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold tracking-tight">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto max-h-[70vh] pr-1 -mr-1">
          {children}
        </div>

        {/* Modal Footer */}
        {(showCancel || showSave) && (
          <DialogFooter className="pt-2 border-t border-border/40 dark:border-white/10 -mx-6 -mb-6 p-6 mt-2 bg-muted/20 dark:bg-white/1 rounded-b-dialog">
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
                className="h-9 px-4 rounded-button border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
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
                className="h-9 px-5 rounded-button bg-primary text-sm text-primary-foreground font-semibold hover:opacity-90 shadow-sm transition-all"
              >
                {isPending ? "Đang xử lý..." : saveLabel}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
