import { useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Edit, Trash2, Search, FileText, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

import { useGetContracts, useDeleteContract } from "../hooks/useContracts";
import { useContractsStore } from "../stores/useContractsStore";
import { usePropertiesStore } from "@/features/properties/stores/usePropertiesStore";
import { useClientsStore } from "@/features/clients/stores/useClientsStore";
import { ContractForm } from "./ContractForm";
import type { LeaseContract } from "../types";

export function ContractList() {
  const statuses = useContractsStore((state) => state.statuses);
  const projects = usePropertiesStore((state) => state.projects).filter(p => p.isActive);
  const companies = useClientsStore((state) => state.companies).filter(c => c.isActive);

  // Filter & paging state
  const [keyword, setKeyword] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number>(0);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(0);
  const [selectedStatusId, setSelectedStatusId] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Edit / Delete State
  const [selectedContract, setSelectedContract] = useState<LeaseContract | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteContractId, setDeleteContractId] = useState<number | null>(null);

  // Fetch contracts
  const { data, isLoading, refetch } = useGetContracts({
    Keyword: keyword || undefined,
    ProjectId: selectedProjectId || undefined,
    CompanyId: selectedCompanyId || undefined,
    StatusId: selectedStatusId || undefined,
    SkipCount: pagination.pageIndex * pagination.pageSize,
    MaxResultCount: pagination.pageSize,
  });

  const deleteMutation = useDeleteContract({
    onSuccess: () => {
      toast.success("Đã thanh lý hợp đồng thuê");
      refetch();
      setDeleteContractId(null);
    },
  });

  const columns: ColumnDef<LeaseContract>[] = [
    {
      accessorKey: "referenceNumber",
      header: "Số hợp đồng",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <span className="font-mono font-bold text-foreground">
            {row.original.referenceNumber}
          </span>
        </div>
      ),
    },
    {
      id: "clientName",
      header: "Khách thuê (Bên B)",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground line-clamp-1">
              {c.companyName || c.contactName}
            </span>
            {c.companyName && (
              <span className="text-[10px] text-muted-foreground line-clamp-1">
                Đại diện: {c.contactName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "unitName",
      header: "Mặt bằng",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded w-max">
            {row.original.unitName}
          </span>
          <span className="text-[11px] text-muted-foreground mt-0.5 max-w-[150px] truncate">
            {row.original.projectName}
          </span>
        </div>
      ),
    },
    {
      id: "timeProgress",
      header: "Thời hạn & Tiến độ",
      cell: ({ row }) => {
        const c = row.original;
        const total = new Date(c.expiryDate).getTime() - new Date(c.commencementDate).getTime();
        const elapsed = Date.now() - new Date(c.commencementDate).getTime();
        const percent = total > 0 ? Math.min(100, Math.max(0, Math.round((elapsed / total) * 100))) : 0;

        return (
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{c.commencementDate} &rarr; {c.expiryDate}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 rounded-full bg-border/40 overflow-hidden relative" title={`Đã đi qua ${percent}% thời gian hợp đồng`}>
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "contractAmount",
      header: "Giá trị thuê",
      cell: ({ row }) => (
        <div className="flex flex-col text-right pr-4">
          <span className="font-semibold text-primary">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(row.original.contractAmount)}
          </span>
          <span className="text-[10px] text-muted-foreground">
            Cọc: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(row.original.depositAmount)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "statusId",
      header: "Trạng thái",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div 
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border"
            style={{ 
              borderColor: `${c.statusColor}30`, 
              backgroundColor: `${c.statusColor}10`,
              color: c.statusColor
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: c.statusColor }} />
            {c.statusName}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => {
                setSelectedContract(c);
                setIsFormOpen(true);
              }}
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteContractId(c.id)}
              title="Thanh lý hợp đồng"
            >
              <Trash2 className="h-4 w-4" />
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
    setSelectedProjectId(0);
    setSelectedCompanyId(0);
    setSelectedStatusId(0);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return (
    <div className="space-y-4">
      {/* Advanced Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 max-w-4xl">
          {/* Keyword Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo số HĐ, tên đối tác..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9"
            />
          </form>

          {/* Project dropdown Filter */}
          <Select
            value={String(selectedProjectId)}
            onValueChange={(val) => {
              setSelectedProjectId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[170px] h-10 bg-card text-foreground border-input">
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

          {/* Company dropdown Filter */}
          <Select
            value={String(selectedCompanyId)}
            onValueChange={(val) => {
              setSelectedCompanyId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[190px] h-10 bg-card text-foreground border-input">
              <SelectValue placeholder="Tất cả khách thuê" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tất cả khách thuê</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status dropdown Filter */}
          <Select
            value={String(selectedStatusId)}
            onValueChange={(val) => {
              setSelectedStatusId(Number(val));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px] h-10 bg-card text-foreground border-input">
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
          {(keyword || selectedProjectId !== 0 || selectedCompanyId !== 0 || selectedStatusId !== 0) && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground h-10 text-xs hover:bg-accent/10">
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <Button onClick={() => {
          setSelectedContract(null);
          setIsFormOpen(true);
        }} className="shrink-0">
          Ký Hợp đồng
        </Button>
      </div>

      {/* Contracts DataTable */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        pageCount={data ? Math.ceil(data.totalCount / pagination.pageSize) : 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        isLoading={isLoading}
      />

      {/* Contract Form Dialog */}
      <ContractForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contract={selectedContract}
        onSuccess={refetch}
      />

      {/* Terminate Confirm Dialog */}
      <ConfirmDialog
        open={deleteContractId !== null}
        onOpenChange={(open) => !open && setDeleteContractId(null)}
        title="Xác nhận thanh lý hợp đồng"
        description="Bạn có chắc chắn muốn thanh lý hợp đồng thuê này? Hành động này sẽ chuyển trạng thái mặt bằng về Trống để tiếp tục cho thuê."
        variant="destructive"
        confirmText="Xác nhận thanh lý"
        onConfirm={() => {
          if (deleteContractId !== null) {
            deleteMutation.mutate(deleteContractId);
          }
        }}
      />
    </div>
  );
}
