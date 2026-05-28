import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Power, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/shared/inputs/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/inputs/Select";
import { DataTable } from "@/components/shared/tables/DataTable";
import { ConfirmDialog } from "@/components/shared/dialogs/ConfirmDialog";
import { useGetUnits, useToggleUnitActive } from "../hooks/useProperties";
import { usePropertiesStore } from "../stores/usePropertiesStore";
import { UnitForm } from "./UnitForm";
import type { Unit } from "../types";

export function UnitList({ projectId }: { projectId?: number }) {
  const projects = usePropertiesStore((state) => state.projects).filter(p => p.isActive);
  const statuses = usePropertiesStore((state) => state.statuses);

  // Filter & Page state
  const [keyword, setKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projectId || 0);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Toggle State
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmUnit, setConfirmUnit] = useState<Unit | null>(null);

  // Query Units data
  const { data, isLoading, refetch } = useGetUnits({
    Keyword: keyword || undefined,
    ProjectId: selectedProjectId || undefined,
    UnitStatusId: selectedStatusId || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  // Toggle active status mutation
  const toggleActiveMutation = useToggleUnitActive({
    onSuccess: () => {
      toast.success(
        confirmUnit?.isActive
          ? "Đã ngưng hoạt động căn hộ"
          : "Đã kích hoạt hoạt động căn hộ"
      );
      refetch();
      setConfirmUnit(null);
    },
  });

  // Table columns definition
  const columns: ColumnDef<Unit>[] = [
    {
      accessorKey: "unitName",
      header: "Mã Căn hộ",
      cell: ({ row }) => (
        <span className="font-mono font-bold text-foreground">
          {row.original.unitName}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: "Dự án",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-medium">
          {row.original.projectName}
        </span>
      ),
    },
    {
      accessorKey: "floorName",
      header: "Vị trí tầng",
      cell: ({ row }) => <span>{row.original.floorName}</span>,
    },
    {
      accessorKey: "actualSize",
      header: "Diện tích",
      cell: ({ row }) => <span>{row.original.actualSize} m²</span>,
    },
    {
      accessorKey: "price",
      header: "Giá thuê",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(row.original.price)}
          <span className="text-xs font-normal text-muted-foreground">/tháng</span>
        </span>
      ),
    },
    {
      accessorKey: "statusId",
      header: "Trạng thái",
      cell: ({ row }) => {
        const u = row.original;
        const color = u.statusColor || "#10b981";
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
            style={{
              borderColor: `${color}30`,
              backgroundColor: `${color}10`,
              color: color
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {u.statusName}
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Hoạt động",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-muted-foreground"
                }`}
            />
            <span className={`text-xs font-medium ${isActive ? "text-emerald-500" : "text-muted-foreground"}`}>
              {isActive ? "Bật" : "Tắt"}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const unit = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedUnit(unit);
                setIsFormOpen(true);
              }}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${unit.isActive
                  ? "text-muted-foreground hover:text-destructive"
                  : "text-muted-foreground hover:text-emerald-500"
                }`}
              onClick={() => setConfirmUnit(unit)}
              title={unit.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
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
    setSelectedProjectId(projectId || 0);
    setSelectedStatusId(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Search and Advanced Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-3xl">
          {/* Keyword Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã căn hộ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </form>

          {/* Project dropdown Filter */}
          {!projectId && (
            <Select
              value={String(selectedProjectId)}
              onValueChange={(val) => {
                setSelectedProjectId(Number(val));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tất cả dự án" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Tất cả dự án</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.projectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Status dropdown Filter */}
          <Select
            value={String(selectedStatusId)}
            onValueChange={(val) => {
              setSelectedStatusId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả trạng thái</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Filters button */}
          {(keyword || selectedProjectId !== (projectId || 0) || selectedStatusId !== 0) && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground text-xs">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <Button onClick={() => {
          setSelectedUnit(null);
          setIsFormOpen(true);
        }} className="shrink-0">
          Thêm Căn hộ
        </Button>
      </div>

      {/* Units DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Unit Form Dialog */}
      <UnitForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        unit={selectedUnit}
        onSuccess={refetch}
        defaultProjectId={projectId}
      />

      {/* Deactivate/Activate Confirm Dialog */}
      <ConfirmDialog
        open={confirmUnit !== null}
        onOpenChange={(open) => !open && setConfirmUnit(null)}
        title={confirmUnit?.isActive ? "Xác nhận ngưng hoạt động" : "Xác nhận kích hoạt"}
        description={`Bạn có chắc chắn muốn ${confirmUnit?.isActive ? "ngưng hoạt động" : "kích hoạt hoạt động"
          } cho căn hộ/mặt bằng "${confirmUnit?.unitName}"?`}
        variant={confirmUnit?.isActive ? "destructive" : "default"}
        confirmText={confirmUnit?.isActive ? "Ngưng hoạt động" : "Kích hoạt"}
        onConfirm={() => {
          if (confirmUnit) {
            toggleActiveMutation.mutate(confirmUnit.id);
          }
        }}
      />
    </div>
  );
}
