import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Bất động sản"
        description="Quản lý thông tin căn hộ, biệt thự và mặt bằng cho thuê"
        actions={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Thêm Bất động sản
          </Button>
        }
      />
      <div className="rounded-xl border border-dashed p-8 text-center bg-card">
        <p className="text-muted-foreground">
          Chức năng danh sách bất động sản sẽ được di chuyển chi tiết ở các bước tiếp theo.
        </p>
      </div>
    </div>
  );
}
