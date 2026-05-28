import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/shared/inputs/Input";
import { Button } from "@/components/ui/button";

export default function TenantsPage() {
  const tenants = [
    { name: "CGV Cinemas Vietnam", tradeName: "CGV", category: "Giải trí", type: "Doanh nghiệp", units: "3F-02, 3F-03", area: "1,820 m²", status: "Active" },
    { name: "CitiMart Co. Ltd", tradeName: "CitiMart", category: "Siêu thị", type: "Doanh nghiệp", units: "GF-04, GF-05", area: "2,100 m²", status: "Active" },
    { name: "UNIQLO Vietnam Co. Ltd", tradeName: "UNIQLO", category: "Thời trang", type: "Doanh nghiệp", units: "2-08, 2-09", area: "620 m²", status: "Active" },
    { name: "Annam Gourmet Trading JSC", tradeName: "Annam Gourmet", category: "F&B", type: "Doanh nghiệp", units: "1-15", area: "180 m²", status: "Active" },
    { name: "Lotteria Vietnam JSC", tradeName: "Lotteria", category: "F&B", type: "Doanh nghiệp", units: "GF-22", area: "140 m²", status: "Fit-out" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="👥 Khách thuê & Đối tác (Tenants)"
        description="Danh sách pháp nhân doanh nghiệp và cá nhân đang thuê mặt bằng thương mại tại các dự án Phú Mỹ Hưng."
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên khách thuê..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-1.5 h-10 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Lọc Danh mục
          </Button>
        </div>
      </div>

      <div className="border border-border/30 bg-card rounded-dialog p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Danh Sách Khách Thuê Hoạt Động</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground bg-muted/20">
              <th className="py-2.5 px-3 text-left">Khách thuê</th>
              <th className="py-2.5 px-3 text-left">Thương hiệu</th>
              <th className="py-2.5 px-3 text-left">Ngành hàng</th>
              <th className="py-2.5 px-3 text-left">Vị trí căn</th>
              <th className="py-2.5 px-3 text-left">Diện tích thuê</th>
              <th className="py-2.5 px-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t, idx) => (
              <tr key={idx} className="border-b border-border/30 hover:bg-muted/10">
                <td className="py-3 px-3 font-semibold text-foreground">{t.name}</td>
                <td className="py-3 px-3 text-muted-foreground">{t.tradeName}</td>
                <td className="py-3 px-3 text-muted-foreground">{t.category}</td>
                <td className="py-3 px-3 font-mono text-muted-foreground">{t.units}</td>
                <td className="py-3 px-3 text-muted-foreground">{t.area}</td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    t.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
