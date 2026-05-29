import { useState, useMemo } from "react";
import { 
  Phone, 
  Mail, 
  FileText, 
  Home, 
  Flag, 
  User, 
  Clock, 
  Calendar,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetApiServicesAppInquiryGetActivity } from "@/api/generated/inquiry/inquiry";

interface InquiryActivitiesTabProps {
  inquiryId: number;
}

export function InquiryActivitiesTab({ inquiryId }: InquiryActivitiesTabProps) {
  const [selectedType, setSelectedType] = useState<number | "all">("all");

  const { data, isLoading } = useGetApiServicesAppInquiryGetActivity({
    InquiryId: inquiryId,
    MaxResultCount: 200,
  });

  const activities = (data as any)?.items || [];

  // Filter activities by type
  const filteredActivities = useMemo(() => {
    if (selectedType === "all") return activities;
    return activities.filter((act: any) => act.type === selectedType);
  }, [activities, selectedType]);

  const filterButtons = [
    { id: "all", label: "Tất cả", count: activities.length, color: "bg-primary/10 border-primary/20 text-primary" },
    { id: 1, label: "Cuộc gọi", count: activities.filter((a: any) => a.type === 1).length, icon: Phone, color: "bg-purple-500/10 border-purple-500/20 text-purple-600" },
    { id: 3, label: "Email", count: activities.filter((a: any) => a.type === 3).length, icon: Mail, color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
    { id: 2, label: "Đề xuất", count: activities.filter((a: any) => a.type === 2).length, icon: FileText, color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
    { id: 4, label: "Xem nhà (Site Visit)", count: activities.filter((a: any) => a.type === 4).length, icon: Home, color: "bg-orange-500/10 border-orange-500/20 text-orange-600" },
    { id: 5, label: "Giữ chỗ (Reservation)", count: activities.filter((a: any) => a.type === 5).length, icon: Flag, color: "bg-rose-500/10 border-rose-500/20 text-rose-600" },
  ];

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderActivityCard = (act: any) => {
    switch (act.type) {
      case 1: { // Call
        const call = act.inquiryCall;
        return (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Phone className="h-4 w-4" />
                <span>Nhật ký cuộc gọi</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(call?.callDate)}
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground/90 bg-muted/20 border border-border/30 rounded-lg p-2.5">
              Nội dung cuộc gọi: <span className="font-normal text-muted-foreground">{call?.description || "(Không có ghi chú)"}</span>
            </p>
          </div>
        );
      }
      case 3: { // Mail
        const mail = act.inquiryMail;
        return (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Mail className="h-4 w-4" />
                <span>Email tiếp xúc khách hàng</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(mail?.sendDate)}
              </span>
            </div>
            <div className="text-xs space-y-1 bg-muted/20 border border-border/30 rounded-lg p-2.5">
              <p className="font-semibold text-foreground/90">Tiêu đề: <span className="font-normal text-muted-foreground">{mail?.subject}</span></p>
              <p className="font-semibold text-foreground/90">Nội dung thư: <span className="font-normal text-muted-foreground">{mail?.description || "(Không có nội dung)"}</span></p>
            </div>
          </div>
        );
      }
      case 2: { // Proposal
        const prop = act.inquiryProposal;
        return (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <FileText className="h-4 w-4" />
                <span>Đề xuất mặt bằng (Proposal)</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(prop?.creationTime)}
              </span>
            </div>
            <div className="text-xs space-y-2 bg-muted/20 border border-border/30 rounded-lg p-3">
              <p className="font-semibold text-foreground/90">Tiêu đề đề xuất: <span className="font-normal text-muted-foreground">{prop?.title}</span></p>
              
              {prop?.proposalUnit && prop.proposalUnit.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-foreground/90 shrink-0">Căn hộ đề xuất:</span>
                  {prop.proposalUnit.map((item: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center rounded-md border border-border/40 px-2 py-0.5 text-[10px] bg-background font-bold select-none text-foreground/80">
                      {item?.unit?.projectCode} - {item?.unit?.unitName}
                    </span>
                  ))}
                </div>
              )}

              {prop?.proposalProject && prop.proposalProject.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-foreground/90 shrink-0">Dự án đề xuất:</span>
                  {prop.proposalProject.map((item: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center rounded-md border border-border/40 px-2 py-0.5 text-[10px] bg-background font-bold select-none text-foreground/80">
                      {item?.project?.projectCode}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center gap-4 pt-1 border-t border-border/20 mt-1">
                <span className="text-[10px] text-muted-foreground font-medium">Lượt xem link: <strong>{prop?.linkView || 0}</strong></span>
                {prop?.uniqueId && (
                  <a 
                    href={`/proposal/public/${prop.uniqueId}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-0.5"
                  >
                    Xem link công khai
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 4: { // SiteVisit
        const visit = act.inquirySiteVisit;
        return (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <Home className="h-4 w-4" />
                <span>Xem nhà thực tế (Site Visit)</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(visit?.creationTime)}
              </span>
            </div>
            <div className="text-xs space-y-2 bg-muted/20 border border-border/30 rounded-lg p-3">
              <p className="font-semibold text-foreground/90">Ghi chú xem nhà: <span className="font-normal text-muted-foreground">{visit?.description || "(Không có ghi chú)"}</span></p>
              <p className="font-semibold text-foreground/90">Thời gian xem: <span className="font-normal text-muted-foreground">{formatDateTime(visit?.siteVisitTime)}</span></p>
              
              {visit?.siteVisitUnit && visit.siteVisitUnit.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="font-semibold text-foreground/90 shrink-0">Căn hộ xem thực tế:</span>
                  {visit.siteVisitUnit.map((item: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center rounded-md border border-border/40 px-2 py-0.5 text-[10px] bg-background font-bold select-none text-foreground/80">
                      {item?.unit?.projectCode} - {item?.unit?.unitName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }
      case 5: { // Reservation
        const res = act.inquiryReservation;
        return (
          <div className="space-y-2.5">
            <div className="flex items-start justify-between gap-4">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <Flag className="h-4 w-4" />
                <span>Đặt cọc giữ chỗ (Reservation)</span>
              </h4>
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateTime(res?.creationTime)}
              </span>
            </div>
            <div className="text-xs space-y-2 bg-muted/20 border border-border/30 rounded-lg p-3">
              <p className="font-semibold text-foreground/90">Nội dung giữ chỗ: <span className="font-normal text-muted-foreground">{res?.description || "(Không có ghi chú)"}</span></p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <p className="font-semibold text-foreground/90">Ngày giữ chỗ: <span className="font-normal text-muted-foreground">{formatDateTime(res?.reservationTime)}</span></p>
                <p className="font-semibold text-foreground/90">Hạn hết giữ chỗ: <span className="font-normal text-rose-500 font-bold">{formatDateTime(res?.expiryDate)}</span></p>
              </div>

              {res?.reservationUnit && res.reservationUnit.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center pt-1 border-t border-border/10">
                  <span className="font-semibold text-foreground/90 shrink-0">Căn hộ giữ chỗ:</span>
                  {res.reservationUnit.map((item: any, idx: number) => {
                    const isCancelled = item.unitStatusId === 3 || item.unitStatusId === 5;
                    return (
                      <span 
                        key={idx} 
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold select-none ${isCancelled ? "line-through bg-background border-border/40 text-muted-foreground opacity-70" : "text-rose-500 bg-rose-500/5 border-rose-500/20"}`}
                      >
                        {item?.unit?.projectCode} - {item?.unit?.unitName} {item?.number > 0 ? `(Lượt ${item.number})` : ""}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Options */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-border/30">
        {filterButtons.map((btn) => (
          <Button
            key={btn.id}
            type="button"
            variant="outline"
            onClick={() => setSelectedType(btn.id as any)}
            className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
              selectedType === btn.id 
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}
          >
            {btn.label} ({btn.count})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground animate-pulse">Đang tải nhật ký hoạt động...</span>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-muted/5">
          <Clock className="h-9 w-9 mx-auto text-muted-foreground mb-3 opacity-55" />
          <p className="text-sm font-medium text-foreground">Không có hoạt động nào được ghi nhận</p>
          <p className="text-xs text-muted-foreground mt-1">Hệ thống ghi nhận cuộc gọi, email, gửi đề xuất, xem nhà và đặt cọc tại đây.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 border-l border-border/60 ml-3 py-1">
          {filteredActivities.map((act: any, idx: number) => {
            const Icon = filterButtons.find(b => b.id === act.type)?.icon || User;
            const btnColor = filterButtons.find(b => b.id === act.type)?.color || "";
            return (
              <div key={act.id || idx} className="relative group">
                {/* Timeline circle badge */}
                <div className={`absolute -left-[38px] top-1 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center shadow-sm text-foreground shrink-0 transition-transform group-hover:scale-110 z-10 ${btnColor.split(" ")[2] || ""}`}>
                  <Icon className="h-3 w-3" />
                </div>

                <div className="bg-card border border-border/40 hover:border-border/80 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  {/* Render specialized activity contents */}
                  {renderActivityCard(act)}

                  {/* Creator details */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 opacity-60" />
                      Nhân viên: <strong className="text-foreground/80 font-semibold">{act.inquiryCall?.creatorUser?.displayName || act.inquiryMail?.creatorUser?.displayName || act.inquiryProposal?.creatorUser?.displayName || act.inquirySiteVisit?.creatorUser?.displayName || act.inquiryReservation?.creatorUser?.displayName || "Hệ thống"}</strong>
                    </span>
                    <span>Tạo lúc: {formatDateTime(act.creationTime)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
