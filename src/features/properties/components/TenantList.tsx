import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Power, Search, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { DataTable } from "@/components/shared/tables/DataTable";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { useGetTenants, useToggleTenantActive } from "../hooks/useTenants";
import { TenantForm } from "./TenantForm";
import type { Tenant } from "../types";

export function TenantList() {
  // Query Filters & Paging state
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Toggle State
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmTenant, setConfirmTenant] = useState<Tenant | null>(null);

  // Fetch tenants data
  const { data, isLoading, refetch } = useGetTenants({
    Keyword: keyword || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  // Toggle Active Mutation
  const toggleActiveMutation = useToggleTenantActive({
    onSuccess: () => {
      toast.success(
        confirmTenant?.isActive
          ? "Đã ngưng hoạt động cư dân/khách thuê"
          : "Đã kích hoạt hoạt động cư dân/khách thuê"
      );
      refetch();
      setConfirmTenant(null);
    },
  });

  // Table columns definition
  const columns: ColumnDef<Tenant>[] = [
    {
      accessorKey: "name",
      header: "Họ và tên",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <User className="h-4 w-4 text-primary shrink-0" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "gender",
      header: "Giới tính",
      cell: ({ row }) => {
        const gender = row.original.gender;
        const displayGender =
          gender === "MALE"
            ? "Nam"
            : gender === "FEMALE"
            ? "Nữ"
            : "Khác";
        return <span>{displayGender}</span>;
      },
    },
    {
      accessorKey: "passport",
      header: "Số Hộ chiếu / CMND",
      cell: ({ row }) => <span className="font-mono">{row.original.passport}</span>,
    },
    {
      accessorKey: "phone",
      header: "Số điện thoại",
      cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.original.phone}</span>,
    },
    {
      accessorKey: "emailAddress",
      header: "Email",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.emailAddress}</span>,
    },
    {
      accessorKey: "nationalityName",
      header: "Quốc tịch",
      cell: ({ row }) => <span>{row.original.nationalityName || "Không xác định"}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              }`}
            />
            <span className={`text-xs font-medium ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}>
              {isActive ? "Hoạt động" : "Ngưng hoạt động"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedTenant(tenant);
                setIsFormOpen(true);
              }}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:border-primary/30"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setConfirmTenant(tenant)}
              className={`h-8 w-8 hover:shadow-sm ${
                tenant.isActive
                  ? "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                  : "text-emerald-500 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              }`}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const clearFilters = () => {
    setKeyword("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters panel */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, passport, số điện thoại..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </form>
          {keyword && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground h-10 text-xs">
              Xóa tìm kiếm
            </Button>
          )}
        </div>

        <Button
          onClick={() => {
            setSelectedTenant(null);
            setIsFormOpen(true);
          }}
          className="shrink-0"
        >
          Thêm Khách thuê
        </Button>
      </div>

      {/* Tenants DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Tenant Form dialog */}
      <TenantForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tenant={selectedTenant}
        onSuccess={refetch}
      />

      {/* Confirm Active/Deactivate dialog */}
      <ConfirmDialog
        open={!!confirmTenant}
        onOpenChange={(open) => !open && setConfirmTenant(null)}
        title={confirmTenant?.isActive ? "Ngưng hoạt động cư dân" : "Kích hoạt hoạt động cư dân"}
        description={
          confirmTenant?.isActive
            ? `Bạn có chắc chắn muốn ngưng hoạt động cư dân/khách thuê "${confirmTenant?.name}" không?`
            : `Bạn có chắc chắn muốn kích hoạt cư dân/khách thuê "${confirmTenant?.name}" hoạt động lại không?`
        }
        variant={confirmTenant?.isActive ? "destructive" : "default"}
        confirmText={confirmTenant?.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
        onConfirm={() => {
          if (confirmTenant) {
            toggleActiveMutation.mutate({
              data: { id: confirmTenant.id },
              params: { isActive: !confirmTenant.isActive },
            });
          }
        }}
      />
    </div>
  );
}
