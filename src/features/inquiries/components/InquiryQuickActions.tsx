import { Button } from "@/components/ui/button";

interface InquiryQuickActionsProps {
  statusId: number;
  onMarkStatus: (statusId: number) => void;
  isPending: boolean;
}

export function InquiryQuickActions({ statusId, onMarkStatus, isPending }: InquiryQuickActionsProps) {
  // If inquiry is completed or dropped, hide the quick actions
  if (statusId === 4 || statusId === 5) return null;

  return (
    <div className="flex items-center gap-3 bg-muted/10 p-3 rounded-lg border border-border/40 mb-6 flex-wrap justify-between backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-xs font-semibold text-muted-foreground">Thao tác nhanh trạng thái:</span>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => onMarkStatus(4)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-button h-8 shadow-sm transition-all"
          disabled={isPending}
        >
          ✓ Đóng thành công (Mark Completed)
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => onMarkStatus(5)}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-xs rounded-button h-8 shadow-sm transition-all"
          disabled={isPending}
        >
          ✗ Đóng thất bại (Mark Dropped)
        </Button>
      </div>
    </div>
  );
}
