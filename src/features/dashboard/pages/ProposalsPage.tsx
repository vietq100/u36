import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Plus, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProposalsPage() {
  const proposals = [
    { code: "PRP-2026-0012", name: "Đề xuất Lotteria CP - Phase 2", project: "Crescent Mall", tenant: "Lotteria Vietnam JSC", area: "140 m²", rent: "$1,500/tháng", status: "Sent" },
    { code: "PRP-2026-0013", name: "Chào giá Highland Coffee GF", project: "Crescent Mall", tenant: "Highland Coffee JSC", area: "95 m²", rent: "$1,200/tháng", status: "Draft" },
    { code: "PRP-2026-0014", name: "Đề xuất Mặt bằng Calligaris PMHT", project: "PMH Tower", tenant: "Calligaris Vietnam", area: "320 m²", rent: "$6,400/tháng", status: "Approved" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="📝 Đề xuất & Thư chào thuê (Offer Letters)"
          description="Quản lý các bản đề xuất báo giá, thư mời thuê mặt bằng thương mại gửi tới khách hàng."
        />
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo Đề xuất
        </Button>
      </div>

      <div className="border border-border/30 bg-card rounded-dialog p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Danh Sách Báo Giá & Thư Chào Thuê</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground bg-muted/20">
              <th className="py-2.5 px-3 text-left">Mã Đề xuất</th>
              <th className="py-2.5 px-3 text-left">Tên Đề xuất</th>
              <th className="py-2.5 px-3 text-left">Dự án</th>
              <th className="py-2.5 px-3 text-left">Khách thuê</th>
              <th className="py-2.5 px-3 text-left">Diện tích</th>
              <th className="py-2.5 px-3 text-left">Đơn giá định kỳ</th>
              <th className="py-2.5 px-3 text-left">Trạng thái</th>
              <th className="py-2.5 px-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p) => (
              <tr key={p.code} className="border-b border-border/30 hover:bg-muted/10">
                <td className="py-3 px-3 font-mono font-bold text-foreground">{p.code}</td>
                <td className="py-3 px-3 font-medium text-foreground">{p.name}</td>
                <td className="py-3 px-3 text-muted-foreground">{p.project}</td>
                <td className="py-3 px-3 text-muted-foreground">{p.tenant}</td>
                <td className="py-3 px-3 text-muted-foreground">{p.area}</td>
                <td className="py-3 px-3 font-semibold text-primary">{p.rent}</td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                    p.status === "Sent" ? "bg-blue-100 text-blue-800" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
