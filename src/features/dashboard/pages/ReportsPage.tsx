import { PageHeader } from "@/components/shared/layout/PageHeader";
import { FileText, FileBarChart2, TrendingUp, CalendarDays } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    { title: "Báo cáo doanh thu cho thuê lũy kế", desc: "Tổng hợp doanh thu thực tế, hóa đơn phát hành và công nợ khách thuê.", type: "Doanh thu", icon: TrendingUp },
    { title: "Báo cáo tỷ lệ lấp đầy (Occupancy)", desc: "Theo dõi NLA trống, đã cọc, và đã ký hợp đồng theo phân khúc Mall/Office/Retail/Shophouse.", type: "Vận hành", icon: FileBarChart2 },
    { title: "Danh sách hợp đồng sắp đáo hạn (90 ngày)", desc: "Hỗ trợ đội ngũ kinh doanh theo dõi và chuẩn bị gia hạn, review giá thuê.", type: "Kinh doanh", icon: CalendarDays },
    { title: "Báo cáo công nợ & Nhắc nợ tự động", desc: "Theo dõi kỳ thanh toán và trạng thái nộp tiền đặt cọc, tiền thuê hàng tháng.", type: "Tài chính", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="📈 Thư viện Báo cáo & Phân tích (Reports Library)"
        description="Truy cập và kết xuất các báo cáo thống kê, phân tích dữ liệu cho thuê và tài chính toàn danh mục."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div key={idx} className="border border-border/30 bg-card rounded-dialog p-5 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {rep.type}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground">{rep.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rep.desc}</p>
                <button className="text-xs text-accent hover:underline font-semibold pt-1">
                  Xem chi tiết Báo cáo ➔
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
