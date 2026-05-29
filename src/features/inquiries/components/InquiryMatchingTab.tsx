import { Building2 } from "lucide-react";

interface InquiryMatchingTabProps {
  isLoading: boolean;
  matchingUnits: any[];
}

export function InquiryMatchingTab({ isLoading, matchingUnits }: InquiryMatchingTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-foreground">Căn hộ / Mặt bằng khớp tiêu chí</h3>
      <p className="text-xs text-muted-foreground">Các căn hộ khả dụng trong hệ thống phù hợp với dự án, diện tích và ngân sách yêu cầu.</p>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground animate-pulse">Đang tìm kiếm căn hộ phù hợp...</span>
        </div>
      ) : !matchingUnits || matchingUnits.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl bg-muted/5">
          <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm font-medium text-foreground">Không tìm thấy căn hộ phù hợp</p>
          <p className="text-xs text-muted-foreground mt-1">Cần thay đổi diện tích hoặc ngân sách trong tab Yêu cầu chi tiết.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {matchingUnits.map((unit: any) => (
            <div key={unit.id} className="border border-border/40 hover:border-primary/45 bg-card rounded-xl p-5 transition-all shadow-sm hover:shadow-md flex justify-between items-center gap-4 flex-wrap">
              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Mã căn: {unit.unitName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tầng: {unit.floorName} | Dự án: {unit.projectName}
                </p>
                <div className="flex gap-4 pt-1.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    Diện tích: <span className="text-foreground font-semibold">{unit.actualSize} m²</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Giá thuê: <span className="text-primary font-semibold">
                      {new Intl.NumberFormat("en-US", { 
                        style: "currency", 
                        currency: "USD", 
                        maximumFractionDigits: 0 
                      }).format(unit.price)}/tháng
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  {unit.statusName || "Available"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
