import { PageHeader } from "@/components/shared/layout/PageHeader";
import { Wrench, Shield, ClipboardList } from "lucide-react";

export default function OperationPage() {
  const tasks = [
    { id: 1, title: "Kiểm tra hệ thống PCCC Định kỳ", target: "Crescent Mall", date: "29 May 2026", status: "In Progress" },
    { id: 2, title: "Bảo trì thang máy Block A", target: "PMH Tower", date: "31 May 2026", status: "Scheduled" },
    { id: 3, title: "Sửa chữa hệ thống điều hòa Trung tâm", target: "Crescent 2", date: "28 May 2026", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="⚙️ Quản lý Vận hành (Operation)"
        description="Quản lý bảo trì thiết bị, kiểm tra an ninh, nhà cung cấp và sự cố kỹ thuật trong các tòa nhà."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border border-border/40 bg-card rounded-dialog p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Phiếu công việc</div>
            <div className="text-2xl font-bold text-foreground">12</div>
          </div>
        </div>

        <div className="border border-border/40 bg-card rounded-dialog p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-full text-amber-600">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Yêu cầu bảo trì</div>
            <div className="text-2xl font-bold text-foreground">4</div>
          </div>
        </div>

        <div className="border border-border/40 bg-card rounded-dialog p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Kiểm tra An ninh & PCCC</div>
            <div className="text-2xl font-bold text-foreground">Đã duyệt</div>
          </div>
        </div>
      </div>

      <div className="border border-border/30 bg-card rounded-dialog p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Phiếu Bảo Trì & Sửa Chữa Gần Đây</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground bg-muted/20">
              <th className="py-2.5 px-3 text-left">Nội dung</th>
              <th className="py-2.5 px-3 text-left">Địa điểm</th>
              <th className="py-2.5 px-3 text-left">Hạn xử lý</th>
              <th className="py-2.5 px-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b border-border/30 hover:bg-muted/10">
                <td className="py-3 px-3 font-medium text-foreground">{task.title}</td>
                <td className="py-3 px-3 text-muted-foreground">{task.target}</td>
                <td className="py-3 px-3 text-muted-foreground">{task.date}</td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    task.status === "Completed" ? "bg-emerald-100 text-emerald-800" :
                    task.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                    "bg-amber-100 text-amber-800"
                  }`}>
                    {task.status}
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
