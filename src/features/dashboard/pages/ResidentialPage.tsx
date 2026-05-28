import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Building2, Home, Landmark } from "lucide-react";

export default function ResidentialPage() {
  const properties = [
    { id: 1, name: "Scenic Valley 1", units: 720, occ: "94.5%", type: "Chung cư" },
    { id: 2, name: "Happy Valley", units: 810, occ: "92.1%", type: "Chung cư" },
    { id: 3, name: "Green Valley", units: 480, occ: "95.0%", type: "Chung cư" },
    { id: 4, name: "Chateau Villa", units: 130, occ: "88.3%", type: "Biệt thự" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏘️ Residential / Khối Căn hộ & Biệt thự dân cư"
        description="Quản lý thông tin dự án khu dân cư, căn hộ chung cư cao cấp và biệt thự Phú Mỹ Hưng."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border/40 bg-card rounded-dialog p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Dự án khu dân cư</div>
            <div className="text-2xl font-bold text-foreground">6</div>
          </div>
        </div>

        <div className="border border-border/40 bg-card rounded-dialog p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full text-blue-600">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Tổng số Căn hộ / Biệt thự</div>
            <div className="text-2xl font-bold text-foreground">2,140</div>
          </div>
        </div>

        <div className="border border-border/40 bg-card rounded-dialog p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Tỷ lệ lấp đầy bình quân</div>
            <div className="text-2xl font-bold text-foreground">91.2%</div>
          </div>
        </div>
      </div>

      <div className="border border-border/30 bg-card rounded-dialog p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Danh Sách Cụm Dân Cư Quản Lý</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground bg-muted/20">
              <th className="py-2.5 px-3 text-left">Tên dự án</th>
              <th className="py-2.5 px-3 text-left">Phân loại</th>
              <th className="py-2.5 px-3 text-left">Tổng số căn</th>
              <th className="py-2.5 px-3 text-left">Tỷ lệ lấp đầy</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((prop) => (
              <tr key={prop.id} className="border-b border-border/30 hover:bg-muted/10">
                <td className="py-3 px-3 font-medium text-foreground">{prop.name}</td>
                <td className="py-3 px-3 text-muted-foreground">{prop.type}</td>
                <td className="py-3 px-3 text-muted-foreground">{prop.units}</td>
                <td className="py-3 px-3">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {prop.occ}
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
